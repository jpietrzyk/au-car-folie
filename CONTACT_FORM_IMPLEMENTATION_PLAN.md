# Contact Form Backend Implementation Plan

## Overview

This document outlines the plan for implementing the contact form backend for the Car-folie.pl website using Netlify Functions, which will be hosted on Netlify.

## Current State Analysis

### Existing Contact Form

- **Location**: [`src/pages/kontakt.astro`](src/pages/kontakt.astro)
- **Form Action**: Currently points to `/api/contact` (non-existent endpoint)
- **Form Fields**:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Subject (required, dropdown with predefined options)
  - Message (required)

### Project Context

- **Framework**: Astro 5.x
- **Hosting**: Netlify (planned)
- **Current Status**: Frontend completed, backend integration pending
- **Dependencies**: No form handling libraries currently installed

## Implementation Options Comparison

### Option 1: Netlify Forms (Recommended) ⭐

**Pros:**

- No code required for basic functionality
- Built-in spam protection
- Free tier available (up to 100 submissions/month)
- Easy to set up with existing HTML forms
- Automatic form handling and email notifications
- Works seamlessly with Astro static builds

**Cons:**

- Limited customization on free tier
- Requires Netlify hosting (already planned)
- Less control over form processing logic

### Option 2: Netlify Functions

**Pros:**

- Full control over form processing logic
- Can integrate with third-party services (SendGrid, Mailgun, etc.)
- More flexible for custom workflows
- Can add validation, rate limiting, etc.
- Serverless functions scale automatically

**Cons:**

- Requires coding and maintenance
- Need to handle email sending separately
- More complex setup
- Additional dependencies required

### Option 3: Third-party Services (Formspree, FormSubmit, etc.)

**Pros:**

- Very easy to implement
- No backend code needed
- Good free tiers available

**Cons:**

- Third-party dependency
- Limited customization
- May have branding on free tier

## Recommended Approach: Hybrid Solution

We'll implement **Netlify Forms** as the primary solution with **Netlify Functions** for enhanced functionality:

1. **Primary**: Netlify Forms for basic form submission
2. **Enhancement**: Netlify Function for:
   - Custom email formatting
   - Spam filtering
   - Form validation
   - Auto-reply functionality
   - Database storage (optional)

## Implementation Steps

### Phase 1: Basic Netlify Forms Setup (Quick Win)

#### Step 1.1: Update Contact Form for Netlify Forms

- Add `netlify` attribute to the form element
- Add hidden `form-name` field
- Update form action to use Netlify's default handler
- Add honeypot field for spam protection

**File to modify**: [`src/pages/kontakt.astro`](src/pages/kontakt.astro)

```html
<form
  class="contact-form"
  name="contact"
  method="POST"
  data-netlify="true"
  netlify-honeypot="bot-field"
>
  <input type="hidden" name="form-name" value="contact" />
  <input type="hidden" name="bot-field" />
  <!-- rest of form fields -->
</form>
```

#### Step 1.2: Configure Netlify Forms in Netlify Dashboard

- Deploy site to Netlify
- Navigate to Forms section in Netlify dashboard
- Verify form detection
- Configure email notifications
- Set up spam filtering

**Estimated time**: 30 minutes

### Phase 2: Netlify Function for Enhanced Processing

#### Step 2.1: Install Required Dependencies

```bash
npm install @netlify/functions
```

#### Step 2.2: Create Netlify Function Structure

Create directory: `netlify/functions/contact.ts`

**Function Features:**

- Form validation
- Email sending via SendGrid or similar
- Spam detection
- Auto-reply to submitter
- Error handling
- CORS support

#### Step 2.3: Implement Contact Function

Create [`netlify/functions/contact.ts`](netlify/functions/contact.ts) with:

- Request parsing
- Form validation
- Email composition
- Third-party API integration
- Response formatting

#### Step 2.4: Update Form to Use Function

Change form action to point to Netlify function:

```html
<form action="/.netlify/functions/contact" method="POST">
```

**Estimated time**: 2-3 hours

### Phase 3: Email Service Integration

#### Step 3.1: Choose Email Provider

Options:

- **SendGrid** (recommended): Free tier (100 emails/day), excellent API
- **Mailgun**: Free tier (5,000 emails/month)
- **Resend**: Modern API, generous free tier
- **AWS SES**: Cost-effective for high volume

#### Step 3.2: Configure Environment Variables

Add to Netlify environment variables:

```bash
SENDGRID_API_KEY=your_api_key
FROM_EMAIL=biuro@car-folie.pl
TO_EMAIL=biuro@car-folie.pl
```

#### Step 3.3: Implement Email Templates

Create professional email templates:

- Notification email to site owner
- Auto-reply confirmation to submitter
- HTML and plain text versions

**Estimated time**: 1-2 hours

### Phase 4: Form Enhancements

#### Step 4.1: Add Client-Side Validation

- Real-time email validation
- Phone number format validation
- Required field validation
- Character limits for message field

#### Step 4.2: Add Loading States

- Show spinner during submission
- Disable submit button while processing
- Clear error/success messages

#### Step 4.3: Add Success/Error Handling

- Success message with confirmation
- Error messages with retry option
- Form reset on success

**Estimated time**: 1 hour

### Phase 5: Testing & Deployment

#### Step 5.1: Local Testing

- Test form submission locally
- Verify email delivery
- Test error scenarios
- Check spam protection

#### Step 5.2: Netlify Deployment

- Deploy to Netlify
- Verify function execution
- Test form on production
- Monitor logs

#### Step 5.3: Performance Testing

- Test form submission speed
- Verify mobile responsiveness
- Check accessibility

**Estimated time**: 1 hour

## File Structure After Implementation

```plain
car-folie-astro/
├── netlify/
│   └── functions/
│       └── contact.ts          # Netlify function for form processing
├── src/
│   ├── pages/
│   │   └── kontakt.astro       # Updated contact form
│   └── components/
│       └── ContactForm.astro   # Reusable contact form component (optional)
├── .env                        # Local environment variables (gitignored)
├── .env.example               # Environment variable template
└── netlify.toml               # Netlify configuration (optional)
```

## Technical Implementation Details

### Netlify Function Structure

```typescript
// netlify/functions/contact.ts
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    // Parse form data
    const formData = new URLSearchParams(event.body);

    // Validate input
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validation.error })
      };
    }

    // Send email
    await sendEmail({
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: 'New contact form submission',
      body: formatEmailBody(formData)
    });

    // Send auto-reply
    await sendAutoReply(formData.get('email'));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submitted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

### Email Template Example

```typescript
function formatEmailBody(formData: URLSearchParams): string {
  return `
    New contact form submission from car-folie.pl

    Name: ${formData.get('name')}
    Email: ${formData.get('email')}
    Phone: ${formData.get('phone') || 'Not provided'}
    Subject: ${formData.get('subject')}

    Message:
    ${formData.get('message')}

    Submitted at: ${new Date().toISOString()}
  `;
}
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Input Validation**: Validate all form inputs on both client and server
3. **Spam Protection**: Use honeypot fields and CAPTCHA if needed
4. **CORS**: Configure CORS properly for API endpoints
5. **Environment Variables**: Never commit API keys to repository
6. **HTTPS**: Ensure all submissions use HTTPS (automatic on Netlify)

## Configuration Files

### netlify.toml (Optional)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### .env.example

```bash
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=biuro@car-folie.pl
TO_EMAIL=biuro@car-folie.pl
```

## Testing Checklist

- [ ] Form submits successfully
- [ ] Email received by site owner
- [ ] Auto-reply sent to submitter
- [ ] Validation errors display correctly
- [ ] Spam protection works
- [ ] Mobile submission works
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Form resets after success
- [ ] Accessibility maintained

## Estimated Timeline

| Phase | Duration | Dependencies |
| ------- | ---------- | -------------- |
| Phase 1: Basic Netlify Forms | 30 min | None |
| Phase 2: Netlify Function | 2-3 hours | Phase 1 |
| Phase 3: Email Integration | 1-2 hours | Phase 2 |
| Phase 4: Form Enhancements | 1 hour | Phase 3 |
| Phase 5: Testing & Deployment | 1 hour | Phase 4 |
| **Total** | **5.5 - 7.5 hours** | |

## Cost Analysis

### Netlify Forms

- **Free tier**: 100 submissions/month
- **Pro tier**: $19/month for 1,000 submissions/month

### Email Service (SendGrid example)

- **Free tier**: 100 emails/day (3,000/month)
- **Basic tier**: $15/month for 40,000 emails/month

### Netlify Functions

- **Free tier**: 125,000 invocations/month, 1000 minutes execution time
- **Pro tier**: $19/month for higher limits

**Total cost for basic implementation**: $0 (free tiers sufficient for most small businesses)

## Maintenance Considerations

1. **Monitor submission rates**: Check Netlify dashboard regularly
2. **Update email templates**: Keep messaging current
3. **Review spam reports**: Adjust spam protection as needed
4. **Monitor API usage**: Stay within free tier limits
5. **Backup form submissions**: Export submissions periodically
6. **Update dependencies**: Keep packages up to date

## Success Criteria

✅ Contact form successfully submits data
✅ Email notifications received by site owner
✅ Auto-reply sent to form submitter
✅ Spam protection working effectively
✅ Mobile-friendly submission experience
✅ Accessible form with proper validation
✅ Error handling and user feedback
✅ Performance optimized (submits in < 3 seconds)

## Next Steps

1. **Immediate**: Start with Phase 1 (Basic Netlify Forms) for quick win
2. **Short-term**: Implement Phase 2-3 for enhanced functionality
3. **Long-term**: Add Phase 4 enhancements for better UX

---

**Document Version**: 1.0
**Last Updated**: 2026-02-18
**Status**: Ready for Implementation
