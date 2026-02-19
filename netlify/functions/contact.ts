import { createHash, randomUUID } from 'node:crypto';

interface FormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ValidationError {
  field: string;
  message: string;
}

type ApiResponseCode =
  | 'accepted'
  | 'accepted_duplicate'
  | 'accepted_queued'
  | 'validation_error'
  | 'airtable_auth'
  | 'airtable_rate_limit'
  | 'airtable_timeout'
  | 'airtable_unavailable'
  | 'method_not_allowed'
  | 'internal_error';

interface ContactApiResponse {
  success: boolean;
  code: ApiResponseCode;
  message: string;
  submissionId?: string;
  errors?: ValidationError[];
  error?: string;
}

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function buildResponse(statusCode: number, payload: ContactApiResponse) {
  return {
    statusCode,
    headers: BASE_HEADERS,
    body: JSON.stringify(payload)
  };
}

interface AirtableConfig {
  enabled: boolean;
  apiKey: string;
  baseId: string;
  tableName: string;
  timeoutMs: number;
  maxRetries: number;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableListResponse {
  records: AirtableRecord[];
}

interface AirtableCreateResponse {
  records: AirtableRecord[];
}

type AirtableFailureKind =
  | 'auth'
  | 'rate_limit'
  | 'timeout'
  | 'unavailable'
  | 'network'
  | 'bad_request'
  | 'unknown';

interface AirtableFailure {
  kind: AirtableFailureKind;
  status?: number;
  detail?: string;
}

function getAirtableConfig(): AirtableConfig {
  return {
    enabled: process.env.AIRTABLE_ENABLED === 'true',
    apiKey: process.env.AIRTABLE_API_KEY || '',
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: process.env.AIRTABLE_TABLE_NAME || '',
    timeoutMs: Number(process.env.AIRTABLE_TIMEOUT_MS || 4500),
    maxRetries: Number(process.env.AIRTABLE_MAX_RETRIES || 1)
  };
}

function getMissingAirtableEnv(config: AirtableConfig): string[] {
  const missing: string[] = [];

  if (!config.apiKey) {
    missing.push('AIRTABLE_API_KEY');
  }
  if (!config.baseId) {
    missing.push('AIRTABLE_BASE_ID');
  }
  if (!config.tableName) {
    missing.push('AIRTABLE_TABLE_NAME');
  }

  return missing;
}

function fallbackSubmissionId(): string {
  return randomUUID();
}

function generateIdempotencySubmissionId(formData: FormData): string {
  const normalized = [
    formData.name.trim().toLowerCase(),
    formData.email.trim().toLowerCase(),
    (formData.phone || '').trim().replace(/\s+/g, ''),
    formData.subject.trim().toLowerCase(),
    formData.message.trim().replace(/\s+/g, ' ').toLowerCase()
  ].join('|');

  return `sub_${createHash('sha256').update(normalized).digest('hex').slice(0, 24)}`;
}

function validateFormData(formData: FormData): {
  valid: boolean;
  errors?: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!formData.name || formData.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Imię musi mieć co najmniej 2 znaki' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.push({ field: 'email', message: 'Podaj prawidłowy adres email' });
  }

  if (formData.phone && formData.phone.trim().length > 0) {
    const phoneRegex = /^[+]?[\d\s-]{9,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      errors.push({ field: 'phone', message: 'Podaj prawidłowy numer telefonu' });
    }
  }

  const validSubjects = ['zmiana-koloru', 'reklamy', 'floty', 'szkolenia', 'dystrybucja', 'inne'];
  if (!formData.subject || !validSubjects.includes(formData.subject)) {
    errors.push({ field: 'subject', message: 'Wybierz temat wiadomości' });
  }

  if (!formData.message || formData.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Wiadomość musi mieć co najmniej 10 znaków' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

function getHeader(event: any, name: string): string {
  const headers = event?.headers || {};
  const value = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];

  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return typeof value === 'string' ? value : '';
}

function parseFormBody(event: any): URLSearchParams {
  const body = event?.body || '';
  const contentType = getHeader(event, 'content-type').toLowerCase();

  if (contentType.includes('application/json')) {
    const json = JSON.parse(body || '{}') as Record<string, unknown>;
    const params = new URLSearchParams();

    Object.entries(json).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });

    return params;
  }

  return new URLSearchParams(body);
}

function getAirtableEndpoint(config: AirtableConfig): string {
  return `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`;
}

function escapeAirtableFormulaValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

function mapAirtableFailureToCode(kind: AirtableFailureKind): ApiResponseCode {
  if (kind === 'auth') return 'airtable_auth';
  if (kind === 'rate_limit') return 'airtable_rate_limit';
  if (kind === 'timeout') return 'airtable_timeout';
  return 'airtable_unavailable';
}

function mapAirtableError(response: Response, detail?: string): AirtableFailure {
  if (response.status === 401 || response.status === 403) {
    return { kind: 'auth', status: response.status, detail };
  }

  if (response.status === 429) {
    return { kind: 'rate_limit', status: response.status, detail };
  }

  if (response.status >= 500) {
    return { kind: 'unavailable', status: response.status, detail };
  }

  return { kind: 'bad_request', status: response.status, detail };
}

function shouldRetryAirtable(error: AirtableFailure): boolean {
  return ['timeout', 'rate_limit', 'unavailable', 'network'].includes(error.kind);
}

async function airtableRequest(
  config: AirtableConfig,
  url: string,
  init: RequestInit
): Promise<{ ok: true; response: Response } | { ok: false; error: AirtableFailure }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      return { ok: false, error: mapAirtableError(response, detail) };
    }

    return { ok: true, response };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return { ok: false, error: { kind: 'timeout', detail: 'Airtable request timeout' } };
    }

    return {
      ok: false,
      error: {
        kind: 'network',
        detail: error?.message || 'Unknown network error'
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withAirtableRetry<T>(
  config: AirtableConfig,
  operation: () => Promise<{ ok: true; data: T } | { ok: false; error: AirtableFailure }>
): Promise<{ ok: true; data: T } | { ok: false; error: AirtableFailure }> {
  let lastError: AirtableFailure = { kind: 'unknown' };

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    const result = await operation();

    if (result.ok) {
      return result;
    }

    lastError = result.error;

    if (attempt >= config.maxRetries || !shouldRetryAirtable(result.error)) {
      return { ok: false, error: result.error };
    }
  }

  return { ok: false, error: lastError };
}

async function findSubmissionById(
  config: AirtableConfig,
  submissionId: string
): Promise<{ ok: true; data: AirtableRecord | null } | { ok: false; error: AirtableFailure }> {
  const params = new URLSearchParams({
    filterByFormula: `{submissionId}='${escapeAirtableFormulaValue(submissionId)}'`,
    maxRecords: '1'
  });

  const requestResult = await airtableRequest(config, `${getAirtableEndpoint(config)}?${params.toString()}`, {
    method: 'GET'
  });

  if (!requestResult.ok) {
    return requestResult;
  }

  const parsed = (await requestResult.response.json()) as AirtableListResponse;
  return { ok: true, data: parsed.records[0] || null };
}

function mapFormToAirtableFields(
  data: FormData,
  submissionId: string,
  event: any
): Record<string, unknown> {
  const xForwardedFor = getHeader(event, 'x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : process.env.NETLIFY_CLIENT_IP || '';
  const userAgent = getHeader(event, 'user-agent');

  return {
    submissionId,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    subject: data.subject,
    message: data.message,
    status: 'accepted',
    createdAt: new Date().toISOString(),
    source: 'contact-form',
    ip,
    userAgent
  };
}

async function createAirtableSubmission(
  config: AirtableConfig,
  fields: Record<string, unknown>
): Promise<{ ok: true; data: AirtableRecord } | { ok: false; error: AirtableFailure }> {
  const requestResult = await airtableRequest(config, getAirtableEndpoint(config), {
    method: 'POST',
    body: JSON.stringify({ records: [{ fields }] })
  });

  if (!requestResult.ok) {
    return requestResult;
  }

  const parsed = (await requestResult.response.json()) as AirtableCreateResponse;
  return { ok: true, data: parsed.records[0] };
}

function logFallback(submissionId: string, reasonCode: ApiResponseCode, data: FormData, event: any, detail?: string) {
  const xForwardedFor = getHeader(event, 'x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : process.env.NETLIFY_CLIENT_IP || '';

  console.error('contact_fallback_dead_letter', {
    submissionId,
    reasonCode,
    detail,
    source: 'contact-form',
    createdAt: new Date().toISOString(),
    ip,
    userAgent: getHeader(event, 'user-agent'),
    payload: {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject,
      message: data.message
    }
  });
}

export const handler = async (event: any) => {
  const startedAt = Date.now();

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: BASE_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return buildResponse(405, {
      success: false,
      code: 'method_not_allowed',
      message: 'Niedozwolona metoda żądania.',
      error: 'Niedozwolona metoda żądania.'
    });
  }

  try {
    const formData = parseFormBody(event);
    const airtableConfig = getAirtableConfig();

    const data: FormData = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || ''
    };

    const submissionId = generateIdempotencySubmissionId(data) || fallbackSubmissionId();

    const validation = validateFormData(data);
    if (!validation.valid) {
      return buildResponse(400, {
        success: false,
        code: 'validation_error',
        message: 'Dane formularza są nieprawidłowe.',
        submissionId,
        errors: validation.errors,
        error: 'Dane formularza są nieprawidłowe.'
      });
    }

    if (!airtableConfig.enabled) {
      console.info('contact_submission_processed', {
        submissionId,
        code: 'accepted',
        airtableEnabled: false,
        durationMs: Date.now() - startedAt
      });

      return buildResponse(202, {
        success: true,
        code: 'accepted',
        message: 'Dziękujemy, wiadomość została przyjęta.',
        submissionId
      });
    }

    const missingEnv = getMissingAirtableEnv(airtableConfig);
    if (missingEnv.length > 0) {
      console.error('airtable_config_incomplete', {
        submissionId,
        missingEnv,
        durationMs: Date.now() - startedAt
      });

      logFallback(submissionId, 'airtable_unavailable', data, event, `Missing env: ${missingEnv.join(', ')}`);

      return buildResponse(202, {
        success: true,
        code: 'accepted_queued',
        message: 'Wiadomość została przyjęta i oczekuje na przetworzenie.',
        submissionId
      });
    }

    const duplicateResult = await withAirtableRetry(airtableConfig, async () =>
      findSubmissionById(airtableConfig, submissionId)
    );

    if (!duplicateResult.ok) {
      const code = mapAirtableFailureToCode(duplicateResult.error.kind);

      logFallback(submissionId, code, data, event, duplicateResult.error.detail);

      console.error('airtable_duplicate_check_failed', {
        submissionId,
        code,
        durationMs: Date.now() - startedAt,
        error: duplicateResult.error
      });

      return buildResponse(202, {
        success: true,
        code: 'accepted_queued',
        message: 'Wiadomość została przyjęta i oczekuje na przetworzenie.',
        submissionId
      });
    }

    if (duplicateResult.data) {
      console.info('contact_submission_processed', {
        submissionId,
        code: 'accepted_duplicate',
        durationMs: Date.now() - startedAt
      });

      return buildResponse(202, {
        success: true,
        code: 'accepted_duplicate',
        message: 'Wiadomość została już wcześniej przyjęta.',
        submissionId
      });
    }

    const createResult = await withAirtableRetry(airtableConfig, async () =>
      createAirtableSubmission(airtableConfig, mapFormToAirtableFields(data, submissionId, event))
    );

    if (!createResult.ok) {
      const code = mapAirtableFailureToCode(createResult.error.kind);

      logFallback(submissionId, code, data, event, createResult.error.detail);

      console.error('airtable_create_failed', {
        submissionId,
        code,
        durationMs: Date.now() - startedAt,
        error: createResult.error
      });

      return buildResponse(202, {
        success: true,
        code: 'accepted_queued',
        message: 'Wiadomość została przyjęta i oczekuje na przetworzenie.',
        submissionId
      });
    }

    console.info('contact_submission_processed', {
      submissionId,
      code: 'accepted',
      airtableRecordId: createResult.data.id,
      durationMs: Date.now() - startedAt
    });

    return buildResponse(202, {
      success: true,
      code: 'accepted',
      message: 'Dziękujemy, wiadomość została przyjęta.',
      submissionId
    });
  } catch (error) {
    console.error('Error processing contact form:', error);

    return buildResponse(500, {
      success: false,
      code: 'internal_error',
      message: 'Wystąpił błąd podczas przetwarzania formularza. Spróbuj ponownie później.',
      error: 'Wystąpił błąd podczas przetwarzania formularza. Spróbuj ponownie później.'
    });
  }
};
