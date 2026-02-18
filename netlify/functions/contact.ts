import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'biuro@car-folie.pl';
const TO_EMAIL = process.env.TO_EMAIL || 'biuro@car-folie.pl';
const SITE_URL = process.env.SITE_URL || 'https://car-folie.pl';

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

// Validate form data
function validateFormData(formData: FormData): { valid: boolean; errors?: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Name validation
  if (!formData.name || formData.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Imię musi mieć co najmniej 2 znaki' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.push({ field: 'email', message: 'Podaj prawidłowy adres email' });
  }

  // Phone validation (optional)
  if (formData.phone && formData.phone.trim().length > 0) {
    const phoneRegex = /^[+]?[\d\s-]{9,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      errors.push({ field: 'phone', message: 'Podaj prawidłowy numer telefonu' });
    }
  }

  // Subject validation
  const validSubjects = ['zmiana-koloru', 'reklamy', 'floty', 'szkolenia', 'dystrybucja', 'inne'];
  if (!formData.subject || !validSubjects.includes(formData.subject)) {
    errors.push({ field: 'subject', message: 'Wybierz temat wiadomości' });
  }

  // Message validation
  if (!formData.message || formData.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Wiadomość musi mieć co najmniej 10 znaków' });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Format subject for display
function formatSubject(subject: string): string {
  const subjectMap: Record<string, string> = {
    'zmiana-koloru': 'Zmiana koloru',
    'reklamy': 'Reklamy na pojazdach',
    'floty': 'Floty',
    'szkolenia': 'Szkolenia',
    'dystrybucja': 'Dystrybucja materiałów',
    'inne': 'Inne'
  };
  return subjectMap[subject] || subject;
}

// Create HTML email body for site owner
function createOwnerEmailHtml(formData: FormData): string {
  const subjectDisplay = formatSubject(formData.subject);
  const phoneDisplay = formData.phone ? formData.phone : 'Nie podano';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nowa wiadomość z formularza kontaktowego</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #4da6ff 0%, #0066cc 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .field {
          margin-bottom: 20px;
        }
        .field-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .field-value {
          background: white;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid #4da6ff;
        }
        .message-field {
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #999;
          font-size: 12px;
        }
        .footer a {
          color: #4da6ff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Nowa wiadomość z formularza kontaktowego</h1>
      </div>
      <div class="content">
        <div class="field">
          <div class="field-label">Imię i nazwisko</div>
          <div class="field-value">${escapeHtml(formData.name)}</div>
        </div>
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value">
            <a href="mailto:${escapeHtml(formData.email)}">${escapeHtml(formData.email)}</a>
          </div>
        </div>
        <div class="field">
          <div class="field-label">Telefon</div>
          <div class="field-value">${escapeHtml(phoneDisplay)}</div>
        </div>
        <div class="field">
          <div class="field-label">Temat</div>
          <div class="field-value">${escapeHtml(subjectDisplay)}</div>
        </div>
        <div class="field">
          <div class="field-label">Wiadomość</div>
          <div class="field-value message-field">${escapeHtml(formData.message)}</div>
        </div>
        <div class="field">
          <div class="field-label">Data wysłania</div>
          <div class="field-value">${new Date().toLocaleString('pl-PL')}</div>
        </div>
      </div>
      <div class="footer">
        <p>Wiadomość wysłana z <a href="${SITE_URL}">${SITE_URL}</a></p>
      </div>
    </body>
    </html>
  `;
}

// Create plain text email body for site owner
function createOwnerEmailText(formData: FormData): string {
  const subjectDisplay = formatSubject(formData.subject);
  const phoneDisplay = formData.phone ? formData.phone : 'Nie podano';

  return `
Nowa wiadomość z formularza kontaktowego car-folie.pl

Imię i nazwisko: ${formData.name}
Email: ${formData.email}
Telefon: ${phoneDisplay}
Temat: ${subjectDisplay}

Wiadomość:
${formData.message}

Data wysłania: ${new Date().toLocaleString('pl-PL')}
---
Wiadomość wysłana z ${SITE_URL}
  `.trim();
}

// Create auto-reply email for submitter
function createAutoReplyEmail(formData: FormData): sgMail.MailDataRequired {
  const subjectDisplay = formatSubject(formData.subject);

  return {
    to: formData.email,
    from: FROM_EMAIL,
    subject: 'Potwierdzenie otrzymania wiadomości - Car-folie.pl',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Potwierdzenie otrzymania wiadomości</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #4da6ff 0%, #0066cc 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .thank-you {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .details {
            background: white;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #4da6ff;
          }
          .contact-info {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .contact-info h3 {
            margin: 0 0 10px 0;
            color: #4da6ff;
          }
          .contact-info p {
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 12px;
          }
          .footer a {
            color: #4da6ff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dziękujemy za kontakt!</h1>
        </div>
        <div class="content">
          <p class="thank-you">
            Dziękujemy za przesłanie wiadomości. Otrzymaliśmy Twoje zapytanie i odpowiemy najszybciej jak to możliwe.
          </p>

          <div class="details">
            <p><strong>Temat:</strong> ${escapeHtml(subjectDisplay)}</p>
            <p><strong>Data wysłania:</strong> ${new Date().toLocaleString('pl-PL')}</p>
          </div>

          <div class="contact-info">
            <h3>Dane kontaktowe:</h3>
            <p><strong>Telefon:</strong> 570-603-695</p>
            <p><strong>Email:</strong> biuro@car-folie.pl</p>
            <p><strong>Adres:</strong> ul. Wybickiego 48, Myślenice</p>
          </div>

          <p style="margin-top: 20px;">
            Jeśli masz pytania, możesz również skontaktować się z nami telefonicznie lub odwiedzić naszą stronę.
          </p>
        </div>
        <div class="footer">
          <p><a href="${SITE_URL}">${SITE_URL}</a></p>
        </div>
      </body>
      </html>
    `,
    text: `
Dziękujemy za kontakt!

Dziękujemy za przesłanie wiadomości. Otrzymaliśmy Twoje zapytanie i odpowiemy najszybciej jak to możliwe.

Temat: ${subjectDisplay}
Data wysłania: ${new Date().toLocaleString('pl-PL')}

Dane kontaktowe:
Telefon: 570-603-695
Email: biuro@car-folie.pl
Adres: ul. Wybickiego 48, Myślenice

Jeśli masz pytania, możesz również skontaktować się z nami telefonicznie lub odwiedzić naszą stronę.

---
${SITE_URL}
    `.trim()
  };
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Main handler function
export const handler = async (event: any) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const formData = new URLSearchParams(event.body || '');

    const data: FormData = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || ''
    };

    // Validate form data
    const validation = validateFormData(data);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Validation failed',
          errors: validation.errors
        })
      };
    }

    // Send email to site owner
    const ownerEmail: sgMail.MailDataRequired = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `Nowa wiadomość z formularza: ${formatSubject(data.subject)}`,
      html: createOwnerEmailHtml(data),
      text: createOwnerEmailText(data),
      replyTo: data.email
    };

    await sgMail.send(ownerEmail);

    // Send auto-reply to submitter
    const autoReplyEmail = createAutoReplyEmail(data);
    await sgMail.send(autoReplyEmail);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Formularz został pomyślnie wysłany',
        success: true
      })
    };

  } catch (error) {
    console.error('Error processing contact form:', error);

    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Wystąpił błąd podczas przetwarzania formularza. Spróbuj ponownie później.',
        success: false
      })
    };
  }
};
