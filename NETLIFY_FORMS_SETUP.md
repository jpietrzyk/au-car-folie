# Netlify Forms Setup Guide

## Phase 1: Basic Netlify Forms Configuration

### What's Been Done

1. **Contact Form Updated** ([`src/pages/kontakt.astro`](src/pages/kontakt.astro))
   - Added `data-netlify="true"` attribute to enable Netlify Forms
   - Added `netlify-honeypot="bot-field"` for spam protection
   - Added hidden `form-name` field for form identification
   - Added hidden `bot-field` for honeypot spam detection

2. **Netlify Configuration Created** ([`netlify.toml`](netlify.toml))
   - Configured build settings
   - Set up functions directory for future custom functions
   - Added API redirect routes for future use

3. **Environment Variables Template** ([`.env.example`](.env.example))
   - Template for SendGrid API keys (for Phase 2)
   - Email configuration placeholders

### How Netlify Forms Works

Netlify Forms automatically detects HTML forms with the `data-netlify="true"` attribute and:

- Captures form submissions
- Stores them in the Netlify dashboard
- Can send email notifications
- Provides spam protection
- Works without any backend code

### Deployment Steps

#### 1. Deploy to Netlify

```bash
# Option A: Using Netlify CLI
npm install -g netlify-cli
npm run build
netlify deploy --prod

# Option B: Using Git
git push origin main
# Then connect repository in Netlify dashboard
```

#### 2. Verify Form Detection

After deployment:

1. Go to Netlify dashboard
2. Navigate to **Forms** section
3. You should see a form named "contact" listed
4. Click on it to view submissions

#### 3. Configure Email Notifications

1. In Netlify dashboard, go to **Forms** → **contact**
2. Click **Settings** → **Form notifications**
3. Add email addresses that should receive form submissions
4. Customize email template if needed

#### 4. Configure Spam Protection

Netlify Forms includes built-in spam protection:

- **Honeypot field**: The hidden `bot-field` will catch automated bots
- **Akismet integration**: Available in Netlify dashboard
- **CAPTCHA**: Can be added if needed

### Testing the Form

1. **Local Testing**
   - Netlify Forms won't work locally (requires Netlify infrastructure)
   - Use `netlify dev` for local development with function testing
   - Deploy to a preview branch for testing

2. **Production Testing**
   - Deploy to Netlify
   - Fill out the form on the live site
   - Check Netlify dashboard for submissions
   - Verify email notifications are received

### Form Submission Flow

```plain
User submits form
    ↓
Netlify captures submission
    ↓
Data stored in Netlify dashboard
    ↓
Email notification sent (if configured)
    ↓
User sees success page
```

### Current Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------| |
| name | text | Yes | Full name |
| email | email | Yes | Email address |
| phone | tel | No | Phone number |
| subject | select | Yes | Inquiry topic |
| message | textarea | Yes | Message content |

### Viewing Submissions

1. **Netlify Dashboard**
   - Navigate to **Forms** → **contact**
   - View all submissions
   - Export as CSV if needed

2. **Email Notifications**
   - Receive emails for each submission
   - Format includes all form fields

### Limitations of Basic Netlify Forms

While Netlify Forms provides great functionality out of the box, it has some limitations:

- **No custom email templates**: Basic email formatting only
- **No auto-reply**: Can't automatically send confirmation to submitter
- **Limited validation**: Only browser-based validation
- **No custom processing**: Can't run custom logic on submission
- **No database storage**: Only stored in Netlify dashboard

### Next Steps: Phase 2

To overcome these limitations, we'll implement:

- **Netlify Functions**: Custom serverless functions
- **SendGrid Integration**: Professional email service
- **Auto-reply**: Automatic confirmation emails
- **Custom validation**: Server-side validation
- **Enhanced UX**: Better loading states and error handling

### Troubleshooting

#### Form not detected by Netlify

- Ensure `data-netlify="true"` is present on the form element
- Check that the form has a `name` attribute
- Verify the site has been deployed to Netlify

#### No email notifications received

- Check email configuration in Netlify dashboard
- Verify email addresses are correct
- Check spam folder
- Ensure form is being submitted successfully

#### Spam submissions

- Verify honeypot field is working
- Consider adding CAPTCHA
- Use Akismet integration in Netlify dashboard

### Security Considerations

1. **HTTPS**: Netlify automatically provides HTTPS
2. **Spam Protection**: Honeypot field + Netlify's built-in protection
3. **Data Privacy**: Submissions stored securely in Netlify
4. **Rate Limiting**: Available in Netlify dashboard

### Cost

- **Free Tier**: 100 submissions/month
- **Pro Tier**: $19/month for 1,000 submissions/month
- **Business Tier**: Custom pricing for higher volume

For most small businesses, the free tier is sufficient.

### Monitoring

Monitor your form usage in Netlify dashboard:

- Number of submissions
- Spam detection rate
- Email delivery status
- Form performance metrics

---

**Phase 1 Status**: ✅ Complete
**Next Phase**: Phase 2 - Netlify Functions with SendGrid Integration
**Estimated Time for Phase 2**: 2-3 hours
