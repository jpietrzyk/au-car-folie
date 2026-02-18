# SendGrid API Key Setup Guide

## API Key Type Required

**Web API Key** ✅ (NOT SMTP Relay)

For the [`@sendgrid/mail`](https://github.com/sendgrid/sendgrid-nodejs) Node.js package used in Phase 2, you need a **SendGrid Web API Key**.

### Web API Key vs SMTP Relay

| Feature | Web API Key | SMTP Relay |
|---------|-------------|------------|
| **Usage** | SendGrid REST API | Traditional SMTP protocol |
| **Compatibility** | ✅ `@sendgrid/mail` library | ❌ Not compatible |
| **Features** | Full programmatic access | Limited SMTP features |
| **Templates** | ✅ Supported | ❌ Not supported |
| **Attachments** | ✅ Supported | ✅ Supported |
| **Analytics** | ✅ Full access | ✅ Basic access |

## How to Create a Web API Key

### Step 1: Log in to SendGrid

1. Go to https://app.sendgrid.com
2. Sign in to your account (or create a free account)
3. Free tier includes 100 emails/day (3,000/month)

### Step 2: Navigate to API Keys

1. In the left sidebar, click **Settings**
2. Select **API Keys** from the dropdown
3. Click the blue **Create API Key** button

### Step 3: Configure API Key

**API Key Name:**
```
Car-folie Contact Form
```

**API Key Permissions:**
Select **Restricted Access** (recommended for security)

**Minimum Required Permissions:**
```
✅ Mail → Send
✅ Mail → Mail Send
```

**Optional Permissions (for advanced features):**
```
✅ Mail → Templates (if using email templates)
✅ Stats → Read (for analytics)
```

### Step 4: Create and Copy

1. Click **Create & View**
2. **IMPORTANT**: Copy the API key immediately
3. SendGrid only shows the key once for security
4. Store it securely (we'll add to Netlify environment variables)

The API key will look like:
```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Where to Configure the API Key

### 1. Netlify Environment Variables (Production)

1. Go to Netlify dashboard
2. Select your site
3. Navigate to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add the following:

```
Key: SENDGRID_API_KEY
Value: SG.your_actual_api_key_here
```

6. Click **Save**

### 2. Local Environment Variables (Development)

Create a `.env` file in your project root:

```bash
# .env file (already in .gitignore)
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=biuro@car-folie.pl
TO_EMAIL=biuro@car-folie.pl
SITE_URL=https://car-folie.pl
```

**Note**: The `.env` file is already in [`.gitignore`](.gitignore:17), so it won't be committed to version control.

## Security Best Practices

### ✅ Do's

- Use **Restricted Access** API keys with minimal permissions
- Store API keys in environment variables
- Never commit API keys to version control
- Rotate API keys periodically (every 90 days recommended)
- Monitor API key usage in SendGrid dashboard
- Use different API keys for different environments (dev/staging/prod)

### ❌ Don'ts

- Never share API keys in chat, email, or public repositories
- Don't use "Full Access" unless absolutely necessary
- Don't hardcode API keys in source code
- Don't commit `.env` files to version control
- Don't use the same API key across multiple applications

## How the API Key is Used

The Netlify function in [`netlify/functions/contact.ts`](netlify/functions/contact.ts) uses the API key like this:

```typescript
import sgMail from '@sendgrid/mail';

// Initialize with API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send email using the authenticated API
await sgMail.send({
  to: process.env.TO_EMAIL,
  from: process.env.FROM_EMAIL,
  subject: 'New contact form submission',
  text: 'Form submission details...'
});
```

## Testing Your API Key

### Local Testing

1. Add API key to local `.env` file
2. Test the contact function locally:
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```
3. Submit the form and check if email is sent

### Production Testing

1. Deploy to Netlify
2. Submit the form on your live site
3. Check SendGrid dashboard for email delivery
4. Verify email is received

## Monitoring API Key Usage

### SendGrid Dashboard

1. Go to **Settings** → **API Keys**
2. Click on your API key
3. View usage statistics:
   - Number of requests
   - Last used date
   - Error rates

### Email Activity

1. Go to **Activity** in SendGrid dashboard
2. View all email deliveries
3. Check for:
   - Delivered emails
   - Bounced emails
   - Spam complaints
   - Blocked emails

## Troubleshooting

### API Key Not Working

**Problem**: "Unauthorized" error

**Solutions**:
- Verify API key is correct (copy again from SendGrid)
- Check environment variable name: `SENDGRID_API_KEY` (case-sensitive)
- Ensure API key has "Mail Send" permissions
- Try creating a new API key

### Email Not Sending

**Problem**: No email received

**Solutions**:
- Check SendGrid Activity feed for delivery status
- Verify recipient email address is correct
- Check if email is in spam folder
- Ensure sender email is verified in SendGrid (single sender verification)

### Rate Limiting

**Problem**: Too many requests error

**Solutions**:
- Free tier: 100 emails/day
- Monitor usage in SendGrid dashboard
- Upgrade to paid tier if needed

## API Key Rotation

### Recommended Schedule

- **Development**: Every 30 days
- **Production**: Every 90 days
- **After security incident**: Immediately

### Rotation Steps

1. Create new API key in SendGrid
2. Update environment variable in Netlify
3. Redeploy your site
4. Test form submission
5. Delete old API key after 24-48 hours

## Cost Considerations

### SendGrid Free Tier

- **100 emails/day** (3,000/month)
- **Cost**: $0
- **Sufficient for**: Most small business contact forms

### Paid Tiers (if needed)

- **Basic**: $15/month for 40,000 emails
- **Pro**: $80/month for 100,000 emails
- **Premier**: Custom pricing

For most contact forms, the free tier is sufficient unless you're sending automated emails or newsletters.

## Additional Resources

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [Netlify Environment Variables](https://docs.netlify.com/site-deploys/environment-variables/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-18
**Status**: Ready for Phase 2 Implementation
