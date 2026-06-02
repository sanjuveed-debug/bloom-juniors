# Android Release Checklist

## Recommended first release path

Use Android first as an internal or closed test. The app is already a PWA, so the fastest store path is a Trusted Web Activity wrapper that opens:

`https://yaagvi-learn.vercel.app`

## Store listing basics

- App name: BrightMind Learning
- Short description: Child-friendly phonics, maths, stories, science, and learning games for ages 3-9.
- Category: Education
- Target audience: Children with parent/guardian setup
- Privacy policy URL: `https://yaagvi-learn.vercel.app/privacy`
- Support email: `sanju.veed@gmail.com`

## Before submitting to Google Play

- Create Google Play Console developer account.
- Create internal test release first.
- Use a unique Android package name, for example `com.brightmind.learning`.
- Generate signed Android App Bundle.
- Add Digital Asset Links for the final package and signing certificate.
- Complete Play Console data safety form.
- Complete target audience and children/family declarations.
- Add tablet and phone screenshots for all 3 age groups.
- Check that no third-party character names, images, or stories remain in the shipped build.
- Confirm parent registration, PIN relogin, profile add/delete, guide videos, and progress sync.

## Known items to finish before paid or school launch

- Move parent PIN verification to a server-side hashed flow.
- Add real email-based PIN reset.
- Add stronger server-side rate limiting for sensitive actions.
- Add a parent-facing account deletion request flow.
- Review all learning content for curriculum fit and rights clearance.
