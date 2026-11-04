import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "products_protection_doses" DROP CONSTRAINT "products_protection_doses_crop_id_crops_id_fk";
  
  ALTER TABLE "products_fertiliser_rates" DROP CONSTRAINT "products_fertiliser_rates_crop_id_crops_id_fk";
  
  ALTER TABLE "_products_v_version_protection_doses" DROP CONSTRAINT "_products_v_version_protection_doses_crop_id_crops_id_fk";
  
  ALTER TABLE "_products_v_version_fertiliser_rates" DROP CONSTRAINT "_products_v_version_fertiliser_rates_crop_id_crops_id_fk";
  
  DROP INDEX "products_protection_doses_crop_idx";
  DROP INDEX "products_fertiliser_rates_crop_idx";
  DROP INDEX "_products_v_version_protection_doses_crop_idx";
  DROP INDEX "_products_v_version_fertiliser_rates_crop_idx";
  ALTER TABLE "products_protection_doses_locales" ADD COLUMN "crop_text" varchar;
  ALTER TABLE "products_protection_doses_locales" ADD COLUMN "target_text" varchar;
  ALTER TABLE "products_protection_doses_locales" ADD COLUMN "timing" varchar;
  ALTER TABLE "products_protection_doses_locales" ADD COLUMN "dose_text" varchar;
  ALTER TABLE "products_fertiliser_rates_locales" ADD COLUMN "crop_text" varchar;
  ALTER TABLE "products_fertiliser_rates_locales" ADD COLUMN "rate_text" varchar;
  ALTER TABLE "_products_v_version_protection_doses_locales" ADD COLUMN "crop_text" varchar;
  ALTER TABLE "_products_v_version_protection_doses_locales" ADD COLUMN "target_text" varchar;
  ALTER TABLE "_products_v_version_protection_doses_locales" ADD COLUMN "timing" varchar;
  ALTER TABLE "_products_v_version_protection_doses_locales" ADD COLUMN "dose_text" varchar;
  ALTER TABLE "_products_v_version_fertiliser_rates_locales" ADD COLUMN "crop_text" varchar;
  ALTER TABLE "_products_v_version_fertiliser_rates_locales" ADD COLUMN "rate_text" varchar;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "products_protection_doses" DROP COLUMN "crop_id";
  ALTER TABLE "products_fertiliser_rates" DROP COLUMN "crop_id";
  ALTER TABLE "_products_v_version_protection_doses" DROP COLUMN "crop_id";
  ALTER TABLE "_products_v_version_fertiliser_rates" DROP COLUMN "crop_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  ALTER TABLE "products_protection_doses" ADD COLUMN "crop_id" integer;
  ALTER TABLE "products_fertiliser_rates" ADD COLUMN "crop_id" integer;
  ALTER TABLE "_products_v_version_protection_doses" ADD COLUMN "crop_id" integer;
  ALTER TABLE "_products_v_version_fertiliser_rates" ADD COLUMN "crop_id" integer;
  ALTER TABLE "products_protection_doses" ADD CONSTRAINT "products_protection_doses_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_fertiliser_rates" ADD CONSTRAINT "products_fertiliser_rates_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_protection_doses" ADD CONSTRAINT "_products_v_version_protection_doses_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_fertiliser_rates" ADD CONSTRAINT "_products_v_version_fertiliser_rates_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_protection_doses_crop_idx" ON "products_protection_doses" USING btree ("crop_id");
  CREATE INDEX "products_fertiliser_rates_crop_idx" ON "products_fertiliser_rates" USING btree ("crop_id");
  CREATE INDEX "_products_v_version_protection_doses_crop_idx" ON "_products_v_version_protection_doses" USING btree ("crop_id");
  CREATE INDEX "_products_v_version_fertiliser_rates_crop_idx" ON "_products_v_version_fertiliser_rates" USING btree ("crop_id");
  ALTER TABLE "products_protection_doses_locales" DROP COLUMN "crop_text";
  ALTER TABLE "products_protection_doses_locales" DROP COLUMN "target_text";
  ALTER TABLE "products_protection_doses_locales" DROP COLUMN "timing";
  ALTER TABLE "products_protection_doses_locales" DROP COLUMN "dose_text";
  ALTER TABLE "products_fertiliser_rates_locales" DROP COLUMN "crop_text";
  ALTER TABLE "products_fertiliser_rates_locales" DROP COLUMN "rate_text";
  ALTER TABLE "_products_v_version_protection_doses_locales" DROP COLUMN "crop_text";
  ALTER TABLE "_products_v_version_protection_doses_locales" DROP COLUMN "target_text";
  ALTER TABLE "_products_v_version_protection_doses_locales" DROP COLUMN "timing";
  ALTER TABLE "_products_v_version_protection_doses_locales" DROP COLUMN "dose_text";
  ALTER TABLE "_products_v_version_fertiliser_rates_locales" DROP COLUMN "crop_text";
  ALTER TABLE "_products_v_version_fertiliser_rates_locales" DROP COLUMN "rate_text";`)
}
