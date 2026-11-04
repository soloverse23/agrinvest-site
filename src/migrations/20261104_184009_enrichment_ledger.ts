import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "crops" ADD COLUMN "enrichment" jsonb;
  ALTER TABLE "_crops_v" ADD COLUMN "version_enrichment" jsonb;
  ALTER TABLE "products" ADD COLUMN "enrichment" jsonb;
  ALTER TABLE "_products_v" ADD COLUMN "version_enrichment" jsonb;
  ALTER TABLE "categories" ADD COLUMN "enrichment" jsonb;
  ALTER TABLE "_categories_v" ADD COLUMN "version_enrichment" jsonb;
  ALTER TABLE "brands" ADD COLUMN "enrichment" jsonb;
  ALTER TABLE "_brands_v" ADD COLUMN "version_enrichment" jsonb;
  ALTER TABLE "active_ingredients" ADD COLUMN "enrichment" jsonb;
  ALTER TABLE "_active_ingredients_v" ADD COLUMN "version_enrichment" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "crops" DROP COLUMN "enrichment";
  ALTER TABLE "_crops_v" DROP COLUMN "version_enrichment";
  ALTER TABLE "products" DROP COLUMN "enrichment";
  ALTER TABLE "_products_v" DROP COLUMN "version_enrichment";
  ALTER TABLE "categories" DROP COLUMN "enrichment";
  ALTER TABLE "_categories_v" DROP COLUMN "version_enrichment";
  ALTER TABLE "brands" DROP COLUMN "enrichment";
  ALTER TABLE "_brands_v" DROP COLUMN "version_enrichment";
  ALTER TABLE "active_ingredients" DROP COLUMN "enrichment";
  ALTER TABLE "_active_ingredients_v" DROP COLUMN "version_enrichment";`)
}
