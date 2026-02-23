# reCAPTCHA v3 Implementation Guide

This document describes the reCAPTCHA v3 implementation for the contact form on the car-folie.pl website.

## Overview

The contact form now includes Google reCAPTCHA v3 protection to prevent spam and bot submissions. reCAPTCHA v3 is invisible to users and runs in the background, providing a seamless user experience.

## Features

- **Invisible verification**: No user interaction required
- **Score-based**: Uses a score (0.0 to 1.0) to determine if the interaction is legitimate
- **Configurable**: Can be enabled/disabled via environment variables
- **Graceful degradation**: Works even if reCAPTCHA is disabled or fails
- **Direct API integration**: Uses Google's verification API directly without additional dependencies

## Architecture

### Frontend (kontakt.astro)

1. **Script Loading**: The reCAPTCHA v3 script is loaded from Google's servers
2. **Token Generation**: When the form is submitted, a token is generated using `grecaptcha.execute()`
3. **Form Submission**: The token is included in the form data as a hidden field

### Backend (netlify/functions/contact.ts)

1. **Token Verification**: The server verifies the token using Google's siteverify API
2. **Score Validation**: The score is checked against a minimum threshold (default: 0.5)
3. **Error Handling**: Appropriate error messages are returned if verification fails
4. **Logging**: Detailed logging for debugging and monitoring

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# reCAPTCHA v3 Configuration
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_MIN_SCORE=0.5
```

### Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Register a new site"
3. Fill in the form:
   - Label: "car-folie.pl Contact Form"
   - reCAPTCHA type: "reCAPTCHA v3"
   - Domains: `car-folie.pl`, `localhost` (for testing)
   - Owners: Your email address
4. Accept the reCAPTCHA Terms of Service
5. Submit the form
6. Copy the **Site Key** and **Secret Key**

### Score Thresholds

The `RECAPTCHA_MIN_SCORE` determines how strict the verification is:

- **0.0-0.3**: Very strict, may block legitimate users
- **0.4-0.5**: Recommended balance (default)
- **0.6-0.7**: More lenient, allows more potential bots
- **0.8-1.0**: Very lenient, minimal protection

## Implementation Details

### Frontend Changes

1. **Form Data Attributes**:

   ```html
   <form
     data-recaptcha-enabled="true"
     data-recaptcha-site-key="your_site_key"
   >
   ```

2. **Hidden Token Field**:

   ```html
   <input type="hidden" id="recaptchaToken" name="recaptchaToken" />
   ```

3. **Token Generation**:

   ```javascript
   const recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
     action: 'submit'
   });
   formData.set('recaptchaToken', recaptchaToken);
   ```

### Backend Changes

1. **Configuration Interface**:

   ```typescript
   interface RecaptchaConfig {
     enabled: boolean;
     secretKey: string;
     minScore: number;
   }
   ```

2. **Verification Function**:

   ```typescript
   async function verifyRecaptcha(token: string, config: RecaptchaConfig): Promise<{
     valid: boolean;
     error?: string;
   }>
   ```

3. **Form Validation**:

   ```typescript
   const recaptchaToken = formData.get('recaptchaToken')?.toString();
   if (recaptchaConfig.enabled) {
     if (!recaptchaToken) {
       return error response;
     }
     const result = await verifyRecaptcha(recaptchaToken, recaptchaConfig);
     if (!result.valid) {
       return error response;
     }
   }
   ```

## Error Messages

The following error messages are displayed to users (in Polish):

- **Missing token**: "Weryfikacja CAPTCHA jest wymagana."
- **Low score**: "Wynik weryfikacji ({score}) jest niższy niż wymagany ({minScore})"
- **Verification failed**: "Weryfikacja CAPTCHA nie powiodła się."
- **Token generation error**: "Wystąpił błąd weryfikacji CAPTCHA. Spróbuj ponownie."

## Testing

### Local Development

1. Set `RECAPTCHA_ENABLED=true` in your `.env` file
2. Use your reCAPTCHA site key (localhost is allowed for testing)
3. Submit the contact form
4. Check the browser console for any errors
5. Verify the form submission succeeds

### Testing Score Thresholds

To test different score thresholds:

1. Temporarily change `RECAPTCHA_MIN_SCORE` in your environment
2. Submit the form multiple times
3. Observe which submissions are accepted/rejected

### Disabling for Testing

To disable reCAPTCHA temporarily:

```env
RECAPTCHA_ENABLED=false
```

## Security Considerations

1. **Secret Key Protection**: Never expose the secret key in frontend code
2. **Environment Variables**: Always use environment variables for sensitive data
3. **Score Threshold**: Choose an appropriate score threshold for your use case
4. **Rate Limiting**: Consider implementing rate limiting in addition to reCAPTCHA
5. **Monitoring**: Monitor reCAPTCHA scores and adjust thresholds as needed

## Troubleshooting

### Common Issues

1. **"Weryfikacja CAPTCHA jest wymagana" error**:
   - Check that `RECAPTCHA_ENABLED=true`
   - Verify the site key is correct
   - Ensure the reCAPTCHA script is loading

2. **"Wynik weryfikacji jest niższy niż wymagany" error**:
   - Lower the `RECAPTCHA_MIN_SCORE` threshold
   - Check if the user is using a VPN or proxy
   - Verify the user's browser is not flagged as suspicious

3. **"Wystąpił błąd weryfikacji CAPTCHA" error**:
   - Check the browser console for detailed errors
   - Verify the secret key is correct
   - Check network connectivity to Google's servers

4. **Form submission hangs**:
   - Check that the reCAPTCHA script is loaded
   - Verify `window.grecaptcha` is defined
   - Check for JavaScript errors in the console

### Debugging

Enable detailed logging by checking the browser console and server logs:

```javascript
console.log('reCAPTCHA enabled:', recaptchaEnabled);
console.log('reCAPTCHA site key:', recaptchaSiteKey);
console.log('Token generated:', recaptchaToken);
```

## Future Enhancements

Potential improvements to consider:

1. **Adaptive Thresholds**: Adjust score thresholds based on user behavior
2. **Multiple Actions**: Use different actions for different form types
3. **Analytics**: Track reCAPTCHA scores over time
4. **Fallback**: Implement honeypot fields as a fallback
5. **Rate Limiting**: Add rate limiting based on IP address

## References

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA FAQ](https://developers.google.com/recaptcha/docs/faq)

## Support

For issues or questions about this implementation:

1. Check the troubleshooting section above
2. Review the Google reCAPTCHA documentation
3. Check the browser console and server logs
4. Contact the development team
