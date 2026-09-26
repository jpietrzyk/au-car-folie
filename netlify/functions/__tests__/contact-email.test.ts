import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../contact';

function buildEvent(overrides: Record<string, string> = {}) {
  const body = new URLSearchParams({
    name: 'Jan Kowalski',
    email: 'klient@example.com',
    phone: '570603695',
    subject: 'zmiana-koloru',
    message: 'Proszę o wycenę zmiany koloru.',
    recaptchaToken: '',
    ...overrides
  });

  return {
    httpMethod: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  };
}

describe('contact function email delivery', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RATE_LIMIT_ENABLED = 'false';
    process.env.AIRTABLE_ENABLED = 'false';
    process.env.RECAPTCHA_ENABLED = 'false';
    process.env.RESEND_API_KEY = 're.test-key';
    process.env.EMAIL_FROM = 'formularz@car-folie.pl';
    process.env.TO_EMAIL = 'au.hanmix@gmail.com';
    process.env.FROM_NAME = 'Car-Folie';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('sends a notification email and returns accepted', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler(buildEvent());
    const payload = JSON.parse(result.body);

    expect(result.statusCode).toBe(202);
    expect(payload.success).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');

    const requestBody = JSON.parse(init.body);
    expect(requestBody.to).toEqual(['au.hanmix@gmail.com']);
    expect(requestBody.from).toBe('Car-Folie <formularz@car-folie.pl>');
    expect(requestBody.reply_to).toBe('klient@example.com');
    expect(requestBody.subject).toContain('Zmiana koloru');
    expect(requestBody.text).toContain('klient@example.com');
    expect(requestBody.html).toContain('klient@example.com');
  });

  it('skips email delivery when Resend credentials are missing', async () => {
    delete process.env.RESEND_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler(buildEvent());
    const payload = JSON.parse(result.body);

    expect(result.statusCode).toBe(202);
    expect(payload.success).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still accepts the submission when the email provider fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('invalid api key', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler(buildEvent());
    const payload = JSON.parse(result.body);

    expect(result.statusCode).toBe(202);
    expect(payload.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  function enableAirtable() {
    process.env.AIRTABLE_ENABLED = 'true';
    process.env.AIRTABLE_API_KEY = 'pat.test';
    process.env.AIRTABLE_BASE_ID = 'appTest';
    process.env.AIRTABLE_TABLE_NAME = 'ContactSubmissions';
  }

  function airtableFetchMock(existingRecords: unknown[]) {
    return vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes('api.resend.com')) {
        return new Response(null, { status: 202 });
      }
      if (String(url).includes('api.airtable.com')) {
        if ((init?.method || 'GET') === 'GET') {
          return Response.json({ records: existingRecords });
        }
        return Response.json({ records: [{ id: 'recNew', fields: {} }] });
      }

      return new Response('unexpected url', { status: 500 });
    });
  }

  it('sends a notification email exactly once for a new submission', async () => {
    enableAirtable();
    const fetchMock = airtableFetchMock([]);
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler(buildEvent());
    const payload = JSON.parse(result.body);

    expect(payload.code).toBe('accepted');
    const emailCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes('api.resend.com')
    );
    expect(emailCalls).toHaveLength(1);
  });

  it('does not send an email again for a duplicate submission', async () => {
    enableAirtable();
    const fetchMock = airtableFetchMock([{ id: 'recExisting', fields: {} }]);
    vi.stubGlobal('fetch', fetchMock);

    const result = await handler(buildEvent());
    const payload = JSON.parse(result.body);

    expect(payload.code).toBe('accepted_duplicate');
    const emailCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes('api.resend.com')
    );
    expect(emailCalls).toHaveLength(0);
  });
});
