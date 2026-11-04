#!/bin/sh
# Runs before every Vercel build, which reads the database. Applies pending migrations and
# fills an empty database once. Uses Vercel's own environment, so no credentials leave it.
# Exports stay inside this script: the build itself keeps the pooled DATABASE_URL.
set -e
export NODE_ENV=production
export DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
npm run migrate
SEED_ONLY_IF_EMPTY=true npm run seed
