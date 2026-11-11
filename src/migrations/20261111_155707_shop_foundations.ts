import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_protection_ghs_pictograms" AS ENUM('GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09');
  CREATE TYPE "public"."enum_products_protection_signal_word" AS ENUM('warning', 'danger');
  CREATE TYPE "public"."enum__products_v_version_protection_ghs_pictograms" AS ENUM('GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09');
  CREATE TYPE "public"."enum__products_v_version_protection_signal_word" AS ENUM('warning', 'danger');
  ALTER TYPE "public"."enum_leads_type" ADD VALUE 'quick';
  ALTER TYPE "public"."enum_lead_routing_routes_type" ADD VALUE 'quick';
  CREATE TABLE "products_protection_ghs_pictograms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_protection_ghs_pictograms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_protection_ghs_pictograms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_protection_ghs_pictograms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "shop_home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"promo_ends_at" timestamp(3) with time zone,
  	"promo_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shop_home_locales" (
  	"promo_kicker" varchar,
  	"promo_title" varchar,
  	"promo_text" varchar,
  	"promo_link_label" varchar,
  	"promo_link_href" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "shop_home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "categories" ALTER COLUMN "icon" SET DATA TYPE text;
  -- The generic icons (leaf, drop, scale) have no match in the shop set: the apply step sets the new ones while empty.
  UPDATE "categories" SET "icon" = NULL WHERE "icon" NOT IN ('seed', 'protection', 'herbicide', 'fungicide', 'insecticide', 'seed-treatment', 'adjuvant', 'growth', 'fertiliser', 'foliar', 'bio', 'other');
  DROP TYPE "public"."enum_categories_icon";
  CREATE TYPE "public"."enum_categories_icon" AS ENUM('seed', 'protection', 'herbicide', 'fungicide', 'insecticide', 'seed-treatment', 'adjuvant', 'growth', 'fertiliser', 'foliar', 'bio', 'other');
  ALTER TABLE "categories" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_categories_icon" USING "icon"::"public"."enum_categories_icon";
  ALTER TABLE "_categories_v" ALTER COLUMN "version_icon" SET DATA TYPE text;
  UPDATE "_categories_v" SET "version_icon" = NULL WHERE "version_icon" NOT IN ('seed', 'protection', 'herbicide', 'fungicide', 'insecticide', 'seed-treatment', 'adjuvant', 'growth', 'fertiliser', 'foliar', 'bio', 'other');
  DROP TYPE "public"."enum__categories_v_version_icon";
  CREATE TYPE "public"."enum__categories_v_version_icon" AS ENUM('seed', 'protection', 'herbicide', 'fungicide', 'insecticide', 'seed-treatment', 'adjuvant', 'growth', 'fertiliser', 'foliar', 'bio', 'other');
  ALTER TABLE "_categories_v" ALTER COLUMN "version_icon" SET DATA TYPE "public"."enum__categories_v_version_icon" USING "version_icon"::"public"."enum__categories_v_version_icon";
  ALTER TABLE "leads" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "phone" DROP NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "products" ADD COLUMN "protection_signal_word" "enum_products_protection_signal_word";
  ALTER TABLE "products_locales" ADD COLUMN "protection_hazard_statements" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "protection_buffer_zone" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_protection_signal_word" "enum__products_v_version_protection_signal_word";
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_protection_hazard_statements" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_protection_buffer_zone" varchar;
  ALTER TABLE "leads" ADD COLUMN "variant" varchar;
  ALTER TABLE "leads" ADD COLUMN "hectares" numeric;
  ALTER TABLE "products_protection_ghs_pictograms" ADD CONSTRAINT "products_protection_ghs_pictograms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_protection_ghs_pictograms" ADD CONSTRAINT "_products_v_version_protection_ghs_pictograms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_home" ADD CONSTRAINT "shop_home_promo_image_id_media_id_fk" FOREIGN KEY ("promo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_home_locales" ADD CONSTRAINT "shop_home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_home_rels" ADD CONSTRAINT "shop_home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shop_home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_home_rels" ADD CONSTRAINT "shop_home_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_protection_ghs_pictograms_order_idx" ON "products_protection_ghs_pictograms" USING btree ("order");
  CREATE INDEX "products_protection_ghs_pictograms_parent_idx" ON "products_protection_ghs_pictograms" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_protection_ghs_pictograms_order_idx" ON "_products_v_version_protection_ghs_pictograms" USING btree ("order");
  CREATE INDEX "_products_v_version_protection_ghs_pictograms_parent_idx" ON "_products_v_version_protection_ghs_pictograms" USING btree ("parent_id");
  CREATE INDEX "shop_home_promo_promo_image_idx" ON "shop_home" USING btree ("promo_image_id");
  CREATE UNIQUE INDEX "shop_home_locales_locale_parent_id_unique" ON "shop_home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "shop_home_locales_parent_id_idx" ON "shop_home_locales" USING btree ("_parent_id");
  CREATE INDEX "shop_home_rels_order_idx" ON "shop_home_rels" USING btree ("order");
  CREATE INDEX "shop_home_rels_parent_idx" ON "shop_home_rels" USING btree ("parent_id");
  CREATE INDEX "shop_home_rels_path_idx" ON "shop_home_rels" USING btree ("path");
  CREATE INDEX "shop_home_rels_products_id_idx" ON "shop_home_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_protection_ghs_pictograms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_protection_ghs_pictograms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_home_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_home_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_protection_ghs_pictograms" CASCADE;
  DROP TABLE "_products_v_version_protection_ghs_pictograms" CASCADE;
  DROP TABLE "shop_home" CASCADE;
  DROP TABLE "shop_home_locales" CASCADE;
  DROP TABLE "shop_home_rels" CASCADE;
  ALTER TABLE "categories" ALTER COLUMN "icon" SET DATA TYPE text;
  -- The shop icons have no match in the old set.
  UPDATE "categories" SET "icon" = NULL WHERE "icon" NOT IN ('leaf', 'drop', 'silo', 'scale', 'document');
  DROP TYPE "public"."enum_categories_icon";
  CREATE TYPE "public"."enum_categories_icon" AS ENUM('leaf', 'drop', 'silo', 'scale', 'document');
  ALTER TABLE "categories" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_categories_icon" USING "icon"::"public"."enum_categories_icon";
  ALTER TABLE "_categories_v" ALTER COLUMN "version_icon" SET DATA TYPE text;
  UPDATE "_categories_v" SET "version_icon" = NULL WHERE "version_icon" NOT IN ('leaf', 'drop', 'silo', 'scale', 'document');
  DROP TYPE "public"."enum__categories_v_version_icon";
  CREATE TYPE "public"."enum__categories_v_version_icon" AS ENUM('leaf', 'drop', 'silo', 'scale', 'document');
  ALTER TABLE "_categories_v" ALTER COLUMN "version_icon" SET DATA TYPE "public"."enum__categories_v_version_icon" USING "version_icon"::"public"."enum__categories_v_version_icon";
  ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_leads_type";
  CREATE TYPE "public"."enum_leads_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'motorina', 'parteneri', 'cariere', 'general');
  ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE "public"."enum_leads_type" USING "type"::"public"."enum_leads_type";
  ALTER TABLE "lead_routing_routes" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_lead_routing_routes_type";
  CREATE TYPE "public"."enum_lead_routing_routes_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'motorina', 'parteneri', 'cariere', 'general');
  ALTER TABLE "lead_routing_routes" ALTER COLUMN "type" SET DATA TYPE "public"."enum_lead_routing_routes_type" USING "type"::"public"."enum_lead_routing_routes_type";
  ALTER TABLE "leads" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "phone" SET NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "products" DROP COLUMN "protection_signal_word";
  ALTER TABLE "products_locales" DROP COLUMN "protection_hazard_statements";
  ALTER TABLE "products_locales" DROP COLUMN "protection_buffer_zone";
  ALTER TABLE "_products_v" DROP COLUMN "version_protection_signal_word";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_protection_hazard_statements";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_protection_buffer_zone";
  ALTER TABLE "leads" DROP COLUMN "variant";
  ALTER TABLE "leads" DROP COLUMN "hectares";
  DROP TYPE "public"."enum_products_protection_ghs_pictograms";
  DROP TYPE "public"."enum_products_protection_signal_word";
  DROP TYPE "public"."enum__products_v_version_protection_ghs_pictograms";
  DROP TYPE "public"."enum__products_v_version_protection_signal_word";`)
}
