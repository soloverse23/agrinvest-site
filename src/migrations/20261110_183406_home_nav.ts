import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_navigation_items_panel" AS ENUM('links', 'shop');
  ALTER TABLE "navigation_items_children" ADD COLUMN "group" varchar;
  ALTER TABLE "navigation_items" ADD COLUMN "panel" "enum_navigation_items_panel" DEFAULT 'links';
  ALTER TABLE "navigation_items" ADD COLUMN "promo_title" varchar;
  ALTER TABLE "navigation_items" ADD COLUMN "promo_text" varchar;
  ALTER TABLE "navigation_items" ADD COLUMN "promo_link_label" varchar;
  ALTER TABLE "navigation_items" ADD COLUMN "promo_link_href" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation_items_children" DROP COLUMN "group";
  ALTER TABLE "navigation_items" DROP COLUMN "panel";
  ALTER TABLE "navigation_items" DROP COLUMN "promo_title";
  ALTER TABLE "navigation_items" DROP COLUMN "promo_text";
  ALTER TABLE "navigation_items" DROP COLUMN "promo_link_label";
  ALTER TABLE "navigation_items" DROP COLUMN "promo_link_href";
  DROP TYPE "public"."enum_navigation_items_panel";`)
}
