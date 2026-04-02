#!/bin/bash

echo "Starting Amhara Bank App..."

(cd /Users/getnetbelay/Documents/amhara_bank_app/web && npm run dev) &

(cd /Users/getnetbelay/Documents/amhara_bank_app/backend && npm run seed:demo && npm run start:dev) &

(cd /Users/getnetbelay/Documents/amhara_bank_app/mobile && flutter run -d 0580DD06-7073-4FC6-AD41-B5860BFEDA62 --dart-define=API_BASE_URL=http://localhost:4000)

wait
