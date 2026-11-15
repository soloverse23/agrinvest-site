import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_settings" ALTER COLUMN "weights_half_life_hours" SET DEFAULT 24;
  ALTER TABLE "news_items" ADD COLUMN "image" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_settings" ALTER COLUMN "weights_half_life_hours" SET DEFAULT 12;
  ALTER TABLE "news_items" DROP COLUMN "image";`)
}
