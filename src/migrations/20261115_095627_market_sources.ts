import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_market_prices_source" ADD VALUE 'eia-brent';
  ALTER TYPE "public"."enum_market_prices_source" ADD VALUE 'ecb';
  ALTER TYPE "public"."enum_market_prices_source" ADD VALUE 'world-bank';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'fetchBrent' BEFORE 'ingestNews';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'fetchEcbRates' BEFORE 'ingestNews';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'fetchWorldBank' BEFORE 'ingestNews';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'fetchBrent' BEFORE 'ingestNews';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'fetchEcbRates' BEFORE 'ingestNews';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'fetchWorldBank' BEFORE 'ingestNews';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "market_prices" ALTER COLUMN "source" SET DATA TYPE text;
  DROP TYPE "public"."enum_market_prices_source";
  CREATE TYPE "public"."enum_market_prices_source" AS ENUM('eu-agrifood', 'eu-fertiliser', 'eu-oil-bulletin');
  ALTER TABLE "market_prices" ALTER COLUMN "source" SET DATA TYPE "public"."enum_market_prices_source" USING "source"::"public"."enum_market_prices_source";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'fetchEuCereal', 'fetchEuFertiliser', 'fetchOilBulletin', 'ingestNews', 'evaluateAlerts', 'draftMarketNote', 'editorialDigest', 'buildNewsletter');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'fetchEuCereal', 'fetchEuFertiliser', 'fetchOilBulletin', 'ingestNews', 'evaluateAlerts', 'draftMarketNote', 'editorialDigest', 'buildNewsletter');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";`)
}
