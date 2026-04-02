# Deployment Notes

## Backend
- Set `MONGODB_URI`, `JWT_SECRET`, and `PORT`
- Run `npm install`
- Run `npm run build`
- Optional for local PoC data: `npm run seed:demo`
- Run `npm start`
- Default local database: `mongodb://localhost:27017/amhara_bank_app`

## Local Demo Helper
- `./infrastructure/run-local-demo.sh` prints the real-API startup commands for backend, web, and mobile using the seeded demo credentials
- `./infrastructure/start-local-stack.sh` starts backend and web together for local PoC work
- `./infrastructure/start-local-stack.sh --seed` seeds demo data first, then starts the stack

## Web
- Set `VITE_API_BASE_URL`
- Run `npm install`
- Run `npm run build`
- If the backend is unavailable, the web app falls back to demo adapters

## Mobile
- Set `API_BASE_URL` with `--dart-define`, for example:
  `flutter run --dart-define=API_BASE_URL=http://localhost:4000`
- Run `flutter pub get`
- Run `flutter run`
- If `API_BASE_URL` is not provided or the backend is unavailable, the app falls back to demo adapters
