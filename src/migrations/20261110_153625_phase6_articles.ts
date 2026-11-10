import { slugify } from '../lib/slugify'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_guides_blocks_tool_widget_widget" AS ENUM('grainPrices', 'netPrice', 'diesel', 'weather', 'news');
  CREATE TYPE "public"."enum_guides_pillar" AS ENUM('grau', 'porumb', 'floarea-soarelui', 'rapita', 'orz', 'vanzare', 'depozitare', 'fertilizare', 'protectia-plantelor', 'subventii-apia');
  CREATE TYPE "public"."enum_guides_brief_status" AS ENUM('idee', 'brief', 'aprobat', 'in-lucru', 'de-verificat', 'publicat', 'de-actualizat');
  CREATE TYPE "public"."enum_guides_brief_intent" AS ENUM('I', 'C', 'T');
  CREATE TYPE "public"."enum__guides_v_blocks_tool_widget_widget" AS ENUM('grainPrices', 'netPrice', 'diesel', 'weather', 'news');
  CREATE TYPE "public"."enum__guides_v_version_pillar" AS ENUM('grau', 'porumb', 'floarea-soarelui', 'rapita', 'orz', 'vanzare', 'depozitare', 'fertilizare', 'protectia-plantelor', 'subventii-apia');
  CREATE TYPE "public"."enum__guides_v_version_brief_status" AS ENUM('idee', 'brief', 'aprobat', 'in-lucru', 'de-verificat', 'publicat', 'de-actualizat');
  CREATE TYPE "public"."enum__guides_v_version_brief_intent" AS ENUM('I', 'C', 'T');
  ALTER TYPE "public"."enum_guides_section" ADD VALUE 'ghid';
  ALTER TYPE "public"."enum__guides_v_version_section" ADD VALUE 'ghid';
  ALTER TYPE "public"."enum_outbox_template" ADD VALUE 'editorial-digest';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'editorialDigest' BEFORE 'buildNewsletter';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'editorialDigest' BEFORE 'buildNewsletter';
  CREATE TABLE "guides_blocks_tool_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"widget" "enum_guides_blocks_tool_widget_widget",
  	"heading" varchar,
  	"crop_id" integer,
  	"county_id" integer,
  	"base_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_guides_v_blocks_tool_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"widget" "enum__guides_v_blocks_tool_widget_widget",
  	"heading" varchar,
  	"crop_id" integer,
  	"county_id" integer,
  	"base_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "guides" ADD COLUMN "pillar" "enum_guides_pillar";
  ALTER TABLE "guides" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "guides" ADD COLUMN "cover_id" integer;
  ALTER TABLE "guides" ADD COLUMN "brief_status" "enum_guides_brief_status" DEFAULT 'idee';
  ALTER TABLE "guides" ADD COLUMN "brief_intent" "enum_guides_brief_intent";
  ALTER TABLE "guides" ADD COLUMN "brief_planned_for" timestamp(3) with time zone;
  ALTER TABLE "guides" ADD COLUMN "brief_serp_notes" varchar;
  ALTER TABLE "guides" ADD COLUMN "brief_outline" varchar;
  ALTER TABLE "guides" ADD COLUMN "brief_links" varchar;
  ALTER TABLE "guides" ADD COLUMN "brief_faq_ideas" varchar;
  ALTER TABLE "guides" ADD COLUMN "brief_expert_id" integer;
  ALTER TABLE "guides" ADD COLUMN "brief_refresh_by" timestamp(3) with time zone;
  ALTER TABLE "guides_locales" ADD COLUMN "brief_primary_keyword" varchar;
  ALTER TABLE "guides_locales" ADD COLUMN "brief_secondary_keywords" varchar;
  ALTER TABLE "guides_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_guides_v" ADD COLUMN "version_pillar" "enum__guides_v_version_pillar";
  ALTER TABLE "_guides_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "_guides_v" ADD COLUMN "version_cover_id" integer;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_status" "enum__guides_v_version_brief_status" DEFAULT 'idee';
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_intent" "enum__guides_v_version_brief_intent";
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_planned_for" timestamp(3) with time zone;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_serp_notes" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_outline" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_links" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_faq_ideas" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_expert_id" integer;
  ALTER TABLE "_guides_v" ADD COLUMN "version_brief_refresh_by" timestamp(3) with time zone;
  ALTER TABLE "_guides_v_locales" ADD COLUMN "version_brief_primary_keyword" varchar;
  ALTER TABLE "_guides_v_locales" ADD COLUMN "version_brief_secondary_keywords" varchar;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "people" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "people" ADD COLUMN "slug" varchar;
  ALTER TABLE "guides_blocks_tool_widget" ADD CONSTRAINT "guides_blocks_tool_widget_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_blocks_tool_widget" ADD CONSTRAINT "guides_blocks_tool_widget_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_blocks_tool_widget" ADD CONSTRAINT "guides_blocks_tool_widget_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_blocks_tool_widget" ADD CONSTRAINT "guides_blocks_tool_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_blocks_tool_widget" ADD CONSTRAINT "_guides_v_blocks_tool_widget_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_blocks_tool_widget" ADD CONSTRAINT "_guides_v_blocks_tool_widget_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_blocks_tool_widget" ADD CONSTRAINT "_guides_v_blocks_tool_widget_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_blocks_tool_widget" ADD CONSTRAINT "_guides_v_blocks_tool_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "guides_blocks_tool_widget_order_idx" ON "guides_blocks_tool_widget" USING btree ("_order");
  CREATE INDEX "guides_blocks_tool_widget_parent_id_idx" ON "guides_blocks_tool_widget" USING btree ("_parent_id");
  CREATE INDEX "guides_blocks_tool_widget_path_idx" ON "guides_blocks_tool_widget" USING btree ("_path");
  CREATE INDEX "guides_blocks_tool_widget_crop_idx" ON "guides_blocks_tool_widget" USING btree ("crop_id");
  CREATE INDEX "guides_blocks_tool_widget_county_idx" ON "guides_blocks_tool_widget" USING btree ("county_id");
  CREATE INDEX "guides_blocks_tool_widget_base_idx" ON "guides_blocks_tool_widget" USING btree ("base_id");
  CREATE INDEX "_guides_v_blocks_tool_widget_order_idx" ON "_guides_v_blocks_tool_widget" USING btree ("_order");
  CREATE INDEX "_guides_v_blocks_tool_widget_parent_id_idx" ON "_guides_v_blocks_tool_widget" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_blocks_tool_widget_path_idx" ON "_guides_v_blocks_tool_widget" USING btree ("_path");
  CREATE INDEX "_guides_v_blocks_tool_widget_crop_idx" ON "_guides_v_blocks_tool_widget" USING btree ("crop_id");
  CREATE INDEX "_guides_v_blocks_tool_widget_county_idx" ON "_guides_v_blocks_tool_widget" USING btree ("county_id");
  CREATE INDEX "_guides_v_blocks_tool_widget_base_idx" ON "_guides_v_blocks_tool_widget" USING btree ("base_id");
  ALTER TABLE "guides" ADD CONSTRAINT "guides_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_brief_expert_id_people_id_fk" FOREIGN KEY ("brief_expert_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_brief_expert_id_people_id_fk" FOREIGN KEY ("version_brief_expert_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "guides_cover_idx" ON "guides" USING btree ("cover_id");
  CREATE INDEX "guides_brief_brief_expert_idx" ON "guides" USING btree ("brief_expert_id");
  CREATE INDEX "guides_rels_products_id_idx" ON "guides_rels" USING btree ("products_id");
  CREATE INDEX "_guides_v_version_version_cover_idx" ON "_guides_v" USING btree ("version_cover_id");
  CREATE INDEX "_guides_v_version_brief_version_brief_expert_idx" ON "_guides_v" USING btree ("version_brief_expert_id");
  CREATE INDEX "_guides_v_rels_products_id_idx" ON "_guides_v_rels" USING btree ("products_id");
  UPDATE "guides" SET "published_at" = "created_at" WHERE "published_at" IS NULL;
  UPDATE "_guides_v" SET "version_published_at" = "version_created_at" WHERE "version_published_at" IS NULL;`)

  // Existing people get a slug from their name (unique), then the column becomes required.
  const people = await db.execute(sql`SELECT "id", "name" FROM "people" ORDER BY "id"`)
  const taken = new Set<string>()
  for (const row of people.rows as { id: number; name: string }[]) {
    let slug = slugify(row.name) || `persoana-${row.id}`
    if (taken.has(slug)) slug = `${slug}-${row.id}`
    taken.add(slug)
    await db.execute(sql`UPDATE "people" SET "slug" = ${slug} WHERE "id" = ${row.id}`)
  }
  await db.execute(sql`
  ALTER TABLE "people" ALTER COLUMN "slug" SET NOT NULL;
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "guides_blocks_tool_widget" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_blocks_tool_widget" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "guides_blocks_tool_widget" CASCADE;
  DROP TABLE "_guides_v_blocks_tool_widget" CASCADE;
  ALTER TABLE "guides" DROP CONSTRAINT "guides_cover_id_media_id_fk";
  
  ALTER TABLE "guides" DROP CONSTRAINT "guides_brief_expert_id_people_id_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_products_fk";
  
  ALTER TABLE "_guides_v" DROP CONSTRAINT "_guides_v_version_cover_id_media_id_fk";
  
  ALTER TABLE "_guides_v" DROP CONSTRAINT "_guides_v_version_brief_expert_id_people_id_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_products_fk";
  
  ALTER TABLE "guides" ALTER COLUMN "section" SET DATA TYPE text;
  ALTER TABLE "guides" ALTER COLUMN "section" SET DEFAULT 'finantare'::text;
  DROP TYPE "public"."enum_guides_section";
  CREATE TYPE "public"."enum_guides_section" AS ENUM('finantare', 'pagina-finantare', 'stiri', 'piata');
  ALTER TABLE "guides" ALTER COLUMN "section" SET DEFAULT 'finantare'::"public"."enum_guides_section";
  ALTER TABLE "guides" ALTER COLUMN "section" SET DATA TYPE "public"."enum_guides_section" USING "section"::"public"."enum_guides_section";
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DATA TYPE text;
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DEFAULT 'finantare'::text;
  DROP TYPE "public"."enum__guides_v_version_section";
  CREATE TYPE "public"."enum__guides_v_version_section" AS ENUM('finantare', 'pagina-finantare', 'stiri', 'piata');
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DEFAULT 'finantare'::"public"."enum__guides_v_version_section";
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DATA TYPE "public"."enum__guides_v_version_section" USING "version_section"::"public"."enum__guides_v_version_section";
  ALTER TABLE "outbox" ALTER COLUMN "template" SET DATA TYPE text;
  DROP TYPE "public"."enum_outbox_template";
  CREATE TYPE "public"."enum_outbox_template" AS ENUM('price-alert', 'frost-alert', 'newsletter', 'subscription-confirm');
  ALTER TABLE "outbox" ALTER COLUMN "template" SET DATA TYPE "public"."enum_outbox_template" USING "template"::"public"."enum_outbox_template";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'fetchEuCereal', 'fetchEuFertiliser', 'fetchOilBulletin', 'ingestNews', 'evaluateAlerts', 'draftMarketNote', 'buildNewsletter');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'fetchEuCereal', 'fetchEuFertiliser', 'fetchOilBulletin', 'ingestNews', 'evaluateAlerts', 'draftMarketNote', 'buildNewsletter');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "guides_cover_idx";
  DROP INDEX "guides_brief_brief_expert_idx";
  DROP INDEX "guides_rels_products_id_idx";
  DROP INDEX "_guides_v_version_version_cover_idx";
  DROP INDEX "_guides_v_version_brief_version_brief_expert_idx";
  DROP INDEX "_guides_v_rels_products_id_idx";
  DROP INDEX "people_slug_idx";
  ALTER TABLE "guides" DROP COLUMN "pillar";
  ALTER TABLE "guides" DROP COLUMN "published_at";
  ALTER TABLE "guides" DROP COLUMN "cover_id";
  ALTER TABLE "guides" DROP COLUMN "brief_status";
  ALTER TABLE "guides" DROP COLUMN "brief_intent";
  ALTER TABLE "guides" DROP COLUMN "brief_planned_for";
  ALTER TABLE "guides" DROP COLUMN "brief_serp_notes";
  ALTER TABLE "guides" DROP COLUMN "brief_outline";
  ALTER TABLE "guides" DROP COLUMN "brief_links";
  ALTER TABLE "guides" DROP COLUMN "brief_faq_ideas";
  ALTER TABLE "guides" DROP COLUMN "brief_expert_id";
  ALTER TABLE "guides" DROP COLUMN "brief_refresh_by";
  ALTER TABLE "guides_locales" DROP COLUMN "brief_primary_keyword";
  ALTER TABLE "guides_locales" DROP COLUMN "brief_secondary_keywords";
  ALTER TABLE "guides_rels" DROP COLUMN "products_id";
  ALTER TABLE "_guides_v" DROP COLUMN "version_pillar";
  ALTER TABLE "_guides_v" DROP COLUMN "version_published_at";
  ALTER TABLE "_guides_v" DROP COLUMN "version_cover_id";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_status";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_intent";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_planned_for";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_serp_notes";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_outline";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_links";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_faq_ideas";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_expert_id";
  ALTER TABLE "_guides_v" DROP COLUMN "version_brief_refresh_by";
  ALTER TABLE "_guides_v_locales" DROP COLUMN "version_brief_primary_keyword";
  ALTER TABLE "_guides_v_locales" DROP COLUMN "version_brief_secondary_keywords";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "people" DROP COLUMN "generate_slug";
  ALTER TABLE "people" DROP COLUMN "slug";
  DROP TYPE "public"."enum_guides_blocks_tool_widget_widget";
  DROP TYPE "public"."enum_guides_pillar";
  DROP TYPE "public"."enum_guides_brief_status";
  DROP TYPE "public"."enum_guides_brief_intent";
  DROP TYPE "public"."enum__guides_v_blocks_tool_widget_widget";
  DROP TYPE "public"."enum__guides_v_version_pillar";
  DROP TYPE "public"."enum__guides_v_version_brief_status";
  DROP TYPE "public"."enum__guides_v_version_brief_intent";`)
}
