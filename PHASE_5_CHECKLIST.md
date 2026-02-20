# Phase 5 Quick Reference Checklist

Use this checklist to track your progress through Phase 5 testing and deployment.

## Pre-Deployment Checks

- [ ] SendGrid API key created and copied
- [ ] SendGrid sender domain verified (<biuro@car-folie.pl>)
- [ ] `.env` file contains correct configuration
- [ ] Netlify CLI installed (`npm install -g netlify-cli`)
- [ ] SendGrid package installed (`@sendgrid/mail@8.1.6`)
- [ ] Netlify account created

## Local Testing

- [ ] Run `netlify dev` and verify server starts
- [ ] Navigate to `http://localhost:8888/kontakt`
- [ ] Submit form with valid test data
- [ ] Verify success message appears
- [ ] Check browser console for errors (should be none)
- [ ] Check Network tab for 200 OK response
- [ ] Verify email received by site owner (<biuro@car-folie.pl>)
- [ ] Verify auto-reply sent to submitter
- [ ] Test all error scenarios (missing fields, invalid email, etc.)

## Deployment

- [ ] Run `npm run build` successfully
- [ ] Login to Netlify (`netlify login`)
- [ ] Deploy to production (`netlify deploy --prod`)
- [ ] Configure environment variables in Netlify dashboard:
  - [ ] SENDGRID_API_KEY
  - [ ] FROM_EMAIL
  - [ ] TO_EMAIL
  - [ ] SITE_URL
- [ ] Redeploy site after adding environment variables
- [ ] Verify site is accessible at production URL

## Production Testing

- [ ] Navigate to `/kontakt` on live site
- [ ] Submit form with valid test data
- [ ] Verify success message appears
- [ ] Check Netlify function logs (should show successful execution)
- [ ] Check SendGrid Activity (should show 2 emails sent)
- [ ] Verify email received by site owner
- [ ] Verify auto-reply sent to submitter

## Performance Testing

- [ ] Form submission time < 3 seconds
- [ ] Form works on mobile devices (iPhone, iPad, Android)
- [ ] Form is keyboard accessible (Tab navigation)
- [ ] Error messages are screen reader friendly
- [ ] Loading spinner visible during submission

## Spam Protection

- [ ] Monitor for spam submissions in Netlify dashboard
- [ ] Check SendGrid Activity for spam complaints
- [ ] Verify legitimate submissions go through

## Monitoring Setup

- [ ] Bookmark Netlify function logs page
- [ ] Bookmark SendGrid Activity dashboard
- [ ] Set up weekly check-in to review form submissions
- [ ] Document any issues or improvements needed

## Success Criteria

All of the following must be true:

- ✅ Form submits successfully (local and production)
- ✅ Email notifications received by site owner
- ✅ Auto-reply sent to form submitter
- ✅ Spam protection working effectively
- ✅ Mobile-friendly submission experience
- ✅ Accessible form with proper validation
- ✅ Error handling and user feedback working
- ✅ Performance optimized (submits in < 3 seconds)

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Form fails locally | Check `.env` file, verify API key, check Netlify Dev logs |
| Form fails on production | Verify Netlify environment variables, redeploy site |
| No emails received | Check spam folder, verify sender email in SendGrid, check SendGrid Activity |
| No auto-reply | Check SendGrid Activity for both emails, verify submitter email is valid |
| High spam | Consider adding CAPTCHA, implement rate limiting |

## Contact Support

If you encounter issues:

1. Check the detailed guide: [`PHASE_5_TESTING_DEPLOYMENT.md`](./PHASE_5_TESTING_DEPLOYMENT.md)
2. Review Netlify function logs
3. Check SendGrid Activity dashboard
4. Review error messages in browser console

## Next Steps

After completing Phase 5:

1. Monitor form submissions for 1 week
2. Collect user feedback
3. Document any issues or improvements
4. Consider adding analytics integration

---

**Status**: 🔄 In Progress (Airtable integration)
**Last Updated**: 2026-02-20
