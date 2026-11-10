#!/bin/sh
# Runs before every Vercel build, which reads the database. Applies pending migrations, fills an
# empty database once, then applies the reviewed data (data/products, data/finance): those steps are
# idempotent and leaves alone anything staff changed in the admin. Uses Vercel's own
# environment, so no credentials leave it.
# Exports stay inside this script: the build itself keeps the pooled DATABASE_URL.
set -e
export NODE_ENV=production
export DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
# Photos need cloud storage: Vercel's own disk is read-only.
if [ -n "$BLOB_STORE_ID" ] || [ -n "$R2_BUCKET" ]; then export SEED_PHOTOS=true; fi
npm run migrate
SEED_ONLY_IF_EMPTY=true npm run seed
npm run apply:products
npm run apply:finance
npm run apply:tools
npm run apply:articles
# A warning only: a changed ANAF address must not stop a deploy, the buyer can type the data.
npm run check:anaf || true
