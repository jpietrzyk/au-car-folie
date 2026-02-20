# Phase 5: Testing & Deployment Guide

## Overview

This guide covers the final phase of the contact form implementation: testing and deployment. Phases 1-4 are complete, and now we need to verify everything works correctly in both development and production environments.

## Current Status

✅ **Phase 1**: Basic Netlify Forms Setup - Complete
✅ **Phase 2**: Netlify Function for Enhanced Processing - Complete
✅ **Phase 3**: Email Service Integration (SendGrid) - Complete
✅ **Phase 4**: Form Enhancements (client-side validation, loading states, success/error handling) - Complete
🔄 **Phase 5**: Testing & Deployment - In Progress

## Prerequisites

Before proceeding with Phase 5, ensure you have:

- ✅ SendGrid API key created and configured
- ✅ SendGrid sender domain verified (<biuro@car-folie.pl>)
- ✅ `.env` file with SendGrid API key configured locally
- ✅ Netlify CLI installed (`npm install -g netlify-cli`)
- ✅ SendGrid package installed (`@sendgrid/mail@8.1.6`)
- ✅ Netlify account created

## Step 1: Verify Local Configuration

### 1.1 Check `.env` File

Verify your `.env` file contains the correct configuration:

```bash
cat .env
```

Expected content:

```env
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=biuro@car-folie.pl
TO_EMAIL=biuro@car-folie.pl
SITE_URL=https://car-folie.pl
```

**Important**:

- Replace `SG.your_actual_api_key_here` with your actual SendGrid Web API key
- Ensure the API key has "Mail Send" permissions
- The `.env` file should be in `.gitignore` (it is)

### 1.2 Verify SendGrid API Key

Test your SendGrid API key is valid:

```bash
# Test if API key is properly formatted
grep SENDGRID_API_KEY .env
```

The API key should start with `SG.` and be approximately 69 characters long.

## Step 2: Local Testing with Netlify Dev

### 2.1 Start Netlify Dev Server

Run the Netlify development server with function support:

```bash
netlify dev
```

This will:

- Start a local development server (usually at `http://localhost:8888`)
- Run Netlify Functions locally
- Load environment variables from `.env` file

**Expected output:**

```bash
◈ Netlify Dev ◈
◈ Ignoring general config unsupported by dev server: plugins
◈ Starting Netlify Dev with Astro
◈ Loaded function contact
◈ Server now ready on http://localhost:8888
```

### 2.2 Test Contact Form Locally

1. Open your browser and navigate to `http://localhost:8888/kontakt`
2. Fill out the contact form with test data:
   - **Name**: Test User
   - **Email**: <your-test-email@example.com> (use a real email you can check)
   - **Phone**: 123 456 789 (optional)
   - **Subject**: Zmiana koloru
   - **Message**: This is a test message to verify the contact form is working correctly.

3. Click "Wyślij wiadomość" (Send message)

### 2.3 Verify Local Test Results

**Expected behavior:**

- ✅ Submit button shows spinner animation
- ✅ Submit button is disabled during submission
- ✅ After 2-3 seconds, success message appears: "Dziękujemy za wiadomość! Odpowiemy wkrótce."
- ✅ Form is reset after successful submission
- ✅ No error messages in browser console

**Check browser console:**

- Open Developer Tools (F12)
- Go to Console tab
- Look for any errors (should be none)
- Check Network tab for the `/api/contact` request (should return 200 OK)

**Check Netlify Dev terminal:**

- Look for function execution logs
- Should see something like:

  ```plain
  [POST] /.netlify/functions/contact 200
  ```

### 2.4 Verify Email Delivery

Check your email inbox (and spam folder) for:

1. **Email to site owner** (<biuro@car-folie.pl>):
   - Subject: "Nowa wiadomość z formularza: Zmiana koloru"
   - Contains: Name, Email, Phone, Subject, Message, Timestamp
   - Should be professionally formatted with HTML

2. **Auto-reply to submitter** (<your-test-email@example.com>):
   - Subject: "Potwierdzenie otrzymania wiadomości - Car-folie.pl"
   - Contains: Thank you message, contact details
   - Should be professionally formatted with HTML

**If emails are not received:**

- Check SendGrid dashboard (Activity tab)
- Verify API key has correct permissions
- Check spam/junk folders
- Verify sender email is verified in SendGrid

### 2.5 Test Error Scenarios

Test various error conditions:

**Test 1: Missing required field**

- Leave "Name" empty
- Try to submit
- Expected: Error message "Imię musi mieć co najmniej 2 znaki"

**Test 2: Invalid email**

- Enter "invalid-email" in Email field
- Try to submit
- Expected: Error message "Wprowadź poprawny adres email"

**Test 3: Invalid phone**

- Enter "abc" in Phone field
- Try to submit
- Expected: Error message "Wprowadź poprawny numer telefonu"

**Test 4: Short message**

- Enter "Hi" in Message field
- Try to submit
- Expected: Error message "Wiadomość musi mieć co najmniej 10 znaków"

**Test 5: No subject selected**

- Leave Subject dropdown on default
- Try to submit
- Expected: Error message "Wybierz temat"

## Step 3: Deploy to Netlify

### 3.1 Build the Project

First, build the production version:

```bash
npm run build
```

**Expected output:**

```bash
▶ Astro v4.x
   build output: "dist"
   ✓ Completed in X.XXs.
```

### 3.2 Deploy to Netlify

**Option A: Deploy with Netlify CLI**

```bash
# Login to Netlify (if not already logged in)
netlify login

# Deploy to production
netlify deploy --prod
```

Follow the prompts:

- Select your existing site or create a new one
- Confirm the build directory: `dist`
- Wait for deployment to complete

**Option B: Deploy via Git**

```bash
# Commit changes
git add .
git commit -m "Phase 5: Contact form testing and deployment"
git push origin main
```

Then:

1. Go to Netlify dashboard
2. Connect your Git repository
3. Netlify will automatically deploy on push

### 3.3 Configure Netlify Environment Variables

After deploying, you need to add the SendGrid API key to Netlify:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Navigate to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add the following variables:

| Key | Value |
|-----|-------|
| `SENDGRID_API_KEY` | `SG.your_actual_api_key_here` |
| `FROM_EMAIL` | `biuro@car-folie.pl` |
| `TO_EMAIL` | `biuro@car-folie.pl` |
| `SITE_URL` | `https://car-folie.pl` |

1. Click **Save**
2. **Important**: Redeploy your site after adding environment variables:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

### 3.4 Verify Deployment

1. Visit your live site: `https://your-site-name.netlify.app/kontakt`
2. Check that the page loads correctly
3. Verify all form fields are visible
4. Check that the form styling is correct

## Step 4: Production Testing

### 4.1 Test Form on Production

Repeat the same tests from Step 2.2 on your live site:

1. Navigate to `/kontakt` on your live site
2. Submit a test form with valid data
3. Verify success message appears
4. Check your email for both emails (owner notification + auto-reply)

### 4.2 Monitor Netlify Function Logs

1. Go to Netlify dashboard
2. Navigate to **Functions** tab
3. Click on the `contact` function
4. View recent invocations
5. Check for any errors

**Expected:**

- Function should execute successfully
- Response time should be < 3 seconds
- No errors in logs

### 4.3 Monitor SendGrid Activity

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Activity** tab
3. View recent email deliveries
4. Verify both emails were sent successfully

**Expected:**

- 2 emails sent (1 to owner, 1 auto-reply)
- Status: "Delivered"
- No bounces or spam reports

## Step 5: Performance Testing

### 5.1 Test Form Submission Speed

Use browser DevTools to measure submission time:

1. Open Network tab in DevTools
2. Submit the form
3. Find the `/api/contact` request
4. Check the "Time" column

**Target:** < 3 seconds

### 5.2 Test Mobile Responsiveness

Test the form on different devices:

1. Open DevTools Device Mode (F12 → Toggle device toolbar)
2. Test on various screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

**Verify:**

- ✅ Form is usable on all screen sizes
- ✅ Submit button is easily tappable on mobile
- ✅ Error messages are readable
- ✅ Loading spinner is visible

### 5.3 Test Accessibility

Test keyboard navigation:

1. Use Tab key to navigate through form fields
2. Verify focus indicators are visible
3. Test Enter key to submit form
4. Verify screen reader announces error messages

**Verify:**

- ✅ All form fields are keyboard accessible
- ✅ Focus order is logical
- ✅ Error messages are announced by screen readers
- ✅ ARIA attributes are correct

## Step 6: Spam Protection Testing

### 6.1 Test Honeypot Field

The form should have a hidden honeypot field for spam protection. Currently, the form uses the Netlify Function approach, which has built-in spam protection.

**To test:**

- Submit a form with valid data (should work)
- Monitor SendGrid Activity for any spam submissions
- Check Netlify function logs for suspicious activity

### 6.2 Monitor Spam Reports

After deployment, regularly check:

1. **SendGrid Dashboard** → **Activity** → Look for spam complaints
2. **Netlify Dashboard** → **Forms** → Check for spam submissions
3. Your email inbox for spam messages

## Step 7: Ongoing Monitoring

### 7.1 Set Up Monitoring

**Netlify Monitoring:**

- Check function execution logs weekly
- Monitor error rates
- Track submission volume

**SendGrid Monitoring:**

- Check email delivery rates
- Monitor bounce rates
- Track spam complaints
- Review email engagement (open rates, click rates)

### 7.2 Performance Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Form submission time | < 3 seconds | Browser DevTools Network tab |
| Email delivery rate | > 95% | SendGrid Activity dashboard |
| Function success rate | > 99% | Netlify Functions logs |
| Mobile usability | 100% | Manual testing on devices |

### 7.3 Regular Maintenance Tasks

**Weekly:**

- Check Netlify function logs for errors
- Review SendGrid email delivery rates
- Monitor form submission volume

**Monthly:**

- Review spam protection effectiveness
- Check email templates for updates
- Verify API key usage is within limits

**Quarterly:**

- Rotate SendGrid API key (security best practice)
- Review and update email templates
- Test form submission end-to-end

## Troubleshooting

### Issue: Form submission fails locally

**Symptoms:**

- Error message appears
- No email received

**Solutions:**

1. Check `.env` file exists and has correct values
2. Verify SendGrid API key is valid
3. Check Netlify Dev server is running
4. Look for errors in terminal output

### Issue: Form submission fails on production

**Symptoms:**

- Error message on live site
- No email received

**Solutions:**

1. Verify environment variables are set in Netlify dashboard
2. Check Netlify function logs for errors
3. Ensure site was redeployed after adding environment variables
4. Verify SendGrid API key has correct permissions

### Issue: Emails not received

**Symptoms:**

- Form submission succeeds
- No emails in inbox

**Solutions:**

1. Check spam/junk folders
2. Verify sender email is verified in SendGrid
3. Check SendGrid Activity dashboard for delivery status
4. Verify recipient email address is correct

### Issue: Auto-reply not sent

**Symptoms:**

- Owner receives email
- Submitter doesn't receive auto-reply

**Solutions:**

1. Check SendGrid Activity for both emails
2. Verify submitter's email address is valid
3. Check if submitter's email provider is blocking emails
4. Review function logs for errors

### Issue: High spam submissions

**Symptoms:**

- Many spam submissions in Netlify dashboard
- Spam emails received

**Solutions:**

1. Add CAPTCHA (reCAPTCHA v3 recommended)
2. Implement rate limiting in Netlify function
3. Use Akismet integration
4. Add more sophisticated spam detection

## Success Criteria

✅ **All tests pass** (local and production)
✅ **Emails delivered successfully** (owner + auto-reply)
✅ **Form submission time < 3 seconds**
✅ **Mobile-friendly** (works on all devices)
✅ **Accessible** (keyboard navigation, screen reader support)
✅ **No errors** in browser console or function logs
✅ **Spam protection working** (minimal spam submissions)

## Next Steps After Phase 5

Once Phase 5 is complete and all tests pass:

1. **Monitor** form submissions for the first week
2. **Collect feedback** from real users
3. **Optimize** based on usage patterns
4. **Document** any issues or improvements needed

## Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/)
- [SendGrid Email Activity](https://docs.sendgrid.com/ui/analytics-and-reporting/email-activity)
- [Netlify Environment Variables](https://docs.netlify.com/site-deploys/environment-variables/)
- [Contact Form Implementation Plan](./CONTACT_FORM_IMPLEMENTATION_PLAN.md)
- [SendGrid API Key Guide](./SENDGRID_API_KEY_GUIDE.md)

---

**Phase 5 Status**: 🔄 In Progress (Airtable integration testing)
**Estimated Time**: 1-2 hours
**Dependencies**: SendGrid API key configured, Netlify account created, Airtable setup required

**Last Updated**: 2026-02-20
