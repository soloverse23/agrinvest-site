import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "finance_products" ADD COLUMN "harvest_calendar" boolean DEFAULT true;
  ALTER TABLE "_finance_products_v" ADD COLUMN "version_harvest_calendar" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "finance_products" DROP COLUMN "harvest_calendar";
  ALTER TABLE "_finance_products_v" DROP COLUMN "version_harvest_calendar";`)
}
