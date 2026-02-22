# reCAPTCHA v3 Quick Start Guide

This guide will help you quickly set up and test the reCAPTCHA v3 implementation.

## Prerequisites

- You have reCAPTCHA keys from Google (see [RECAPTCHA_IMPLEMENTATION.md](RECAPTCHA_IMPLEMENTATION.md:44) for how to get them)
- Your environment variables are configured
- Netlify configuration is updated for Node.js functions

## Current Status

✅ Environment variables are configured in `.env`:
- `RECAPTCHA_ENABLED=true`
- `RECAPTCHA_SITE_KEY=6LfGDnQsAAAAAA5N1YEU8tiXY7nMBnKy9CKvNhSA`
- `RECAPTCHA_SECRET_KEY=6LfGDnQsAAAAAEhwsRLJbkzHwMnhdvX-DZ-hhtOh`
- `RECAPTCHA_MIN_SCORE=0.5`

✅ Netlify configuration updated:
- [`netlify.toml`](netlify.toml:6) - Functions directory configured
- [`netlify/functions/package.json`](netlify/functions/package.json:1) - Dependencies defined
- Node.js bundler set to esbuild

✅ **Dev mode bypass**: reCAPTCHA is automatically disabled in development mode to allow testing without it

## Testing Locally

### 1. Start the development server

```bash
npm run dev
```

### 2. Navigate to the contact page

Open your browser to: `http://localhost:4321/kontakt`

### 3. Open browser console

Press F12 or right-click and select "Inspect" to open the developer tools, then go to the Console tab.

### 4. Fill out the form

Enter some test data:
- Name: Test User
- Email: test@example.com
- Phone: (optional)
- Subject: Zmiana koloru
- Message: This is a test message for reCAPTCHA verification

### 5. Submit the form

Click the "Wyślij wiadomość" button.

### 6. Check the console

You should see logs like:

```
reCAPTCHA config: { enabled: "true", siteKey: "6LfGDnQsAAAAAA5N1YEU8tiXY7nMBnKy9CKvNhSA" }
grecaptcha available: true
reCAPTCHA token generated successfully
```

### 7. Check the server logs

In your terminal where `npm run dev` is running, you should see:

```
contact_form_received { submissionId: '...', recaptchaEnabled: true, recaptchaTokenProvided: true, recaptchaTokenLength: ... }
recaptcha_verification_result { submissionId: '...', valid: true, error: undefined }
reCAPTCHA verification successful { score: 0.9, hostname: 'localhost' }
contact_submission_processed { submissionId: '...', code: 'accepted', ... }
```

## Troubleshooting

### Error: "Weryfikacja CAPTCHA jest wymagana"

**Cause**: The reCAPTCHA token was not generated or sent to the server.

**Solutions**:
1. Check browser console for errors
2. Verify that `grecaptcha available: true` appears in console
3. Make sure the reCAPTCHA script is loading (check Network tab for `recaptcha/api.js`)
4. Ensure `RECAPTCHA_ENABLED=true` in your `.env` file

### Error: "Wynik weryfikacji jest niższy niż wymagany"

**Cause**: The reCAPTCHA score is below the threshold.

**Solutions**:
1. Lower `RECAPTCHA_MIN_SCORE` in your `.env` file (try 0.3 for testing)
2. Try submitting from a different browser or network
3. Check if you're using a VPN or proxy that might affect the score

### Error: "Wystąpił błąd weryfikacji CAPTCHA"

**Cause**: Token generation or verification failed.

**Solutions**:
1. Check browser console for detailed error messages
2. Verify your reCAPTCHA keys are correct
3. Check network connectivity to Google's servers
4. Review server logs for specific error codes

### Error: "reCAPTCHA nie jest jeszcze załadowany"

**Cause**: The reCAPTCHA script hasn't finished loading when form is submitted.

**Solutions**:
1. Wait a moment after page loads before submitting
2. Check if there are any network errors loading the script
3. Try refreshing the page

## Disabling reCAPTCHA for Testing

To temporarily disable reCAPTCHA:

```env
RECAPTCHA_ENABLED=false
```

Then restart your development server.

## Testing Score Thresholds

To test different score thresholds:

1. Edit `.env`:
   ```env
   RECAPTCHA_MIN_SCORE=0.3  # More lenient
   ```

2. Restart the development server

3. Submit the form multiple times

4. Observe which submissions are accepted/rejected

## Production Deployment

When deploying to Netlify:

1. Add environment variables in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add the same variables from your `.env` file

2. Deploy your site:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. Test the production contact form

## Monitoring

Check your reCAPTCHA statistics at:
https://www.google.com/recaptcha/admin

You can see:
- Total requests
- Success rate
- Score distribution
- Top error codes

## Next Steps

1. ✅ Test locally with the steps above
2. ✅ Verify console logs show successful token generation
3. ✅ Verify server logs show successful verification
4. ✅ Test with different score thresholds
5. ✅ Deploy to production and test again
6. ✅ Monitor reCAPTCHA statistics in Google Admin Console

## Support

If you encounter issues:

1. Check the [RECAPTCHA_IMPLEMENTATION.md](RECAPTCHA_IMPLEMENTATION.md) for detailed documentation
2. Review browser console and server logs
3. Verify your reCAPTCHA keys are correct
4. Check Google's reCAPTCHA documentation: https://developers.google.com/recaptcha/docs/v3
