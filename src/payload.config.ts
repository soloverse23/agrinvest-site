import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { ro } from '@payloadcms/translations/languages/ro'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { ActiveIngredients } from './collections/ActiveIngredients'
import { Bases } from './collections/Bases'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Counties } from './collections/Counties'
import { Crops } from './collections/Crops'
import { Documents } from './collections/Documents'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { PriceHistory } from './collections/PriceHistory'
import { Products } from './collections/Products'
import { Targets } from './collections/Targets'
import { Users } from './collections/Users'
import { Figures } from './globals/Figures'
import { Footer } from './globals/Footer'
import { LeadRouting } from './globals/LeadRouting'
import { Navigation } from './globals/Navigation'
import { SeoDefaults } from './globals/SeoDefaults'
import { defaultLocale } from './i18n/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Media goes to Vercel Blob or Cloudflare R2, whichever is configured; local disk otherwise
 * (dev, CI). Vercel's own disk is read-only, so hosted uploads need one of the two.
 */
const r2 = process.env.R2_BUCKET
  ? s3Storage({
      bucket: process.env.R2_BUCKET,
      collections: { media: true, documents: true },
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    })
  : null

const blob = process.env.BLOB_READ_WRITE_TOKEN
  ? vercelBlobStorage({
      collections: { media: true, documents: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Straight from the browser: a Vercel function accepts 4.5 MB at most.
      clientUploads: true,
    })
  : null

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Pages,
    Bases,
    Counties,
    Crops,
    Products,
    Categories,
    Brands,
    ActiveIngredients,
    Targets,
    PriceHistory,
    People,
    Leads,
    Media,
    Documents,
    Users,
  ],
  globals: [Figures, Navigation, Footer, SeoDefaults, LeadRouting],
  editor: lexicalEditor(),
  // Content locales (what visitors read). Romanian is the source language.
  localization: {
    locales: [
      { code: 'ro', label: 'Română' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale,
    fallback: true,
  },
  // Admin interface languages (what staff see).
  i18n: {
    fallbackLanguage: 'ro',
    supportedLanguages: { ro, en },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Development pushes the schema; production applies these files (`npm run migrate`).
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [blob, r2].flatMap((plugin) => plugin ?? []),
})
