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
  | 'validation_error'
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

function generateSubmissionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

interface AirtableConfig {
  enabled: boolean;
  apiKey: string;
  baseId: string;
  tableName: string;
}

function getAirtableConfig(): AirtableConfig {
  return {
    enabled: process.env.AIRTABLE_ENABLED === 'true',
    apiKey: process.env.AIRTABLE_API_KEY || '',
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: process.env.AIRTABLE_TABLE_NAME || ''
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

export const handler = async (event: any) => {
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
    const formData = new URLSearchParams(event.body || '');
    const submissionId = generateSubmissionId();
    const airtableConfig = getAirtableConfig();

    if (airtableConfig.enabled) {
      const missingEnv = getMissingAirtableEnv(airtableConfig);

      if (missingEnv.length > 0) {
        console.error('Airtable is enabled but required environment variables are missing', {
          submissionId,
          missingEnv
        });

        return buildResponse(500, {
          success: false,
          code: 'internal_error',
          message: 'Konfiguracja Airtable jest niekompletna. Skontaktuj się z administratorem.',
          submissionId,
          error: 'Konfiguracja Airtable jest niekompletna.'
        });
      }
    }

    const data: FormData = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || ''
    };

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

    console.log('Contact form received (no email provider configured):', {
      submissionId,
      name: data.name,
      email: data.email,
      subject: data.subject,
      hasPhone: Boolean(data.phone && data.phone.trim()),
      messageLength: data.message.length
    });

    return buildResponse(200, {
      success: true,
      code: 'accepted',
      message: 'Formularz został poprawnie odebrany.',
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
