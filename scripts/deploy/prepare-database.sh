#!/bin/sh
# Runs before every Vercel build, which reads the database. Applies pending migrations and
# fills an empty database once. Uses Vercel's own environment, so no credentials leave it.
# Exports stay inside this script: the build itself keeps the pooled DATABASE_URL.
set -e
export NODE_ENV=production
export DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
# Photos need cloud storage: Vercel's own disk is read-only.
if [ -n "$BLOB_READ_WRITE_TOKEN" ] || [ -n "$R2_BUCKET" ]; then export SEED_PHOTOS=true; fi
npm run migrate
SEED_ONLY_IF_EMPTY=true npm run seed
