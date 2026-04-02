# Mobile

Flutter app workspace for member-facing banking features including savings, loans, payments, notifications, and shareholder voting.

## Runtime Config
- Set `API_BASE_URL` with `--dart-define` to enable real backend HTTP calls
- If `API_BASE_URL` is not provided, the app falls back to demo data adapters

Example:
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:4000
```

## macOS Build Note

Do not symlink `build/` to `/tmp` or `/private/tmp` for macOS runs. On Xcode 26.2 this causes module-cache and stale-file failures because the build products resolve outside Xcode's allowed root paths.

Use the default in-repo `build/` directory, or if you need a different location, use a real directory under the workspace instead of a symlink.
