# Mobile E2E Testing

## Automated E2E test

The Flutter E2E test lives at `mobile/integration_test/app_e2e_test.dart`.

It validates:

- branded splash screen appears first
- login screen shows the Amhara Bank logo
- shareholder demo login succeeds
- home header shows branch, greeting, and logo
- profile screen shows branded header and logo

## Copy-paste command

Run on macOS desktop:

```bash
cd /Users/getnetbelay/Documents/amhara_bank_app/mobile
flutter test integration_test/app_e2e_test.dart -d macos
```

Run on the booted iPhone simulator:

```bash
cd /Users/getnetbelay/Documents/amhara_bank_app/mobile
flutter test integration_test/app_e2e_test.dart -d 0580DD06-7073-4FC6-AD41-B5860BFEDA62
```

## Manual QA script

Use this for a quick manual pass.

1. Launch the app.
2. Confirm the native startup splash shows the Amhara Bank logo on a green background.
3. Confirm the in-app splash shows the centered logo and `Amhara Bank` text.
4. Confirm the login screen shows the logo above the sign-in form.
5. Use the seeded shareholder credentials shown by the local stack helper:
   - identifier: `AMH-100001`
   - password: `demo-pass`
6. Tap `Sign In`.
7. Confirm the home screen header shows:
   - `Bahir Dar Branch`
   - `Welcome, Abebe Kebede`
   - Amhara Bank logo at the right side
8. Tap `Profile` in the bottom navigation.
9. Confirm the profile screen shows:
   - `Amhara Bank Profile`
   - `Abebe Kebede`
   - small Amhara Bank logo in the header card

## Copy-paste manual run helper

```bash
cd /Users/getnetbelay/Documents/amhara_bank_app/mobile
flutter run -d macos
```
