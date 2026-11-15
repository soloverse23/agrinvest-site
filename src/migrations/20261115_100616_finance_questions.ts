import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_finance_questions_topic" AS ENUM('eligibility', 'cost', 'guarantees', 'repayment', 'process', 'apia', 'investment', 'grain', 'hardship', 'ifn');
  CREATE TYPE "public"."enum_finance_questions_review_legal_status" AS ENUM('draft', 'ifn-reviewed', 'legal-approved');
  CREATE TYPE "public"."enum_finance_questions_review_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_finance_questions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__finance_questions_v_version_topic" AS ENUM('eligibility', 'cost', 'guarantees', 'repayment', 'process', 'apia', 'investment', 'grain', 'hardship', 'ifn');
  CREATE TYPE "public"."enum__finance_questions_v_version_review_legal_status" AS ENUM('draft', 'ifn-reviewed', 'legal-approved');
  CREATE TYPE "public"."enum__finance_questions_v_version_review_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__finance_questions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__finance_questions_v_published_locale" AS ENUM('ro', 'en');
  CREATE TABLE "finance_questions_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "finance_questions_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"retrieved" timestamp(3) with time zone
  );
  
  CREATE TABLE "finance_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"topic" "enum_finance_questions_topic",
  	"order" numeric DEFAULT 100,
  	"popular" boolean DEFAULT false,
  	"product_id" integer,
  	"guide_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"review_legal_status" "enum_finance_questions_review_legal_status" DEFAULT 'draft',
  	"review_status" "enum_finance_questions_review_status" DEFAULT 'to-confirm',
  	"review_reviewed_at" timestamp(3) with time zone,
  	"review_reviewed_by" varchar,
  	"enrichment" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_finance_questions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "finance_questions_locales" (
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"answer" varchar,
  	"practice" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "finance_questions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finance_questions_id" integer
  );
  
  CREATE TABLE "_finance_questions_v_version_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_finance_questions_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"retrieved" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_finance_questions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_topic" "enum__finance_questions_v_version_topic",
  	"version_order" numeric DEFAULT 100,
  	"version_popular" boolean DEFAULT false,
  	"version_product_id" integer,
  	"version_guide_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_review_legal_status" "enum__finance_questions_v_version_review_legal_status" DEFAULT 'draft',
  	"version_review_status" "enum__finance_questions_v_version_review_status" DEFAULT 'to-confirm',
  	"version_review_reviewed_at" timestamp(3) with time zone,
  	"version_review_reviewed_by" varchar,
  	"version_enrichment" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__finance_questions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__finance_questions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_finance_questions_v_locales" (
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_answer" varchar,
  	"version_practice" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_finance_questions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finance_questions_id" integer
  );
  
  ALTER TABLE "finance_products_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_faq" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "finance_products_faq" CASCADE;
  DROP TABLE "_finance_products_v_version_faq" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "finance_questions_id" integer;
  ALTER TABLE "finance_questions_factors" ADD CONSTRAINT "finance_questions_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_questions_sources" ADD CONSTRAINT "finance_questions_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_questions" ADD CONSTRAINT "finance_questions_product_id_finance_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."finance_products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_questions" ADD CONSTRAINT "finance_questions_guide_id_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_questions" ADD CONSTRAINT "finance_questions_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_questions_locales" ADD CONSTRAINT "finance_questions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_questions_rels" ADD CONSTRAINT "finance_questions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_questions_rels" ADD CONSTRAINT "finance_questions_rels_finance_questions_fk" FOREIGN KEY ("finance_questions_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_questions_v_version_factors" ADD CONSTRAINT "_finance_questions_v_version_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_questions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_questions_v_version_sources" ADD CONSTRAINT "_finance_questions_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_questions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_questions_v" ADD CONSTRAINT "_finance_questions_v_parent_id_finance_questions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_questions_v" ADD CONSTRAINT "_finance_questions_v_version_product_id_finance_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."finance_products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_questions_v" ADD CONSTRAINT "_finance_questions_v_version_guide_id_guides_id_fk" FOREIGN KEY ("version_guide_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_questions_v" ADD CONSTRAINT "_finance_questions_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_questions_v_locales" ADD CONSTRAINT "_finance_questions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_questions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_questions_v_rels" ADD CONSTRAINT "_finance_questions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_finance_questions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_questions_v_rels" ADD CONSTRAINT "_finance_questions_v_rels_finance_questions_fk" FOREIGN KEY ("finance_questions_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "finance_questions_factors_order_idx" ON "finance_questions_factors" USING btree ("_order");
  CREATE INDEX "finance_questions_factors_parent_id_idx" ON "finance_questions_factors" USING btree ("_parent_id");
  CREATE INDEX "finance_questions_factors_locale_idx" ON "finance_questions_factors" USING btree ("_locale");
  CREATE INDEX "finance_questions_sources_order_idx" ON "finance_questions_sources" USING btree ("_order");
  CREATE INDEX "finance_questions_sources_parent_id_idx" ON "finance_questions_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "finance_questions_key_idx" ON "finance_questions" USING btree ("key");
  CREATE INDEX "finance_questions_product_idx" ON "finance_questions" USING btree ("product_id");
  CREATE INDEX "finance_questions_guide_idx" ON "finance_questions" USING btree ("guide_id");
  CREATE INDEX "finance_questions_seo_seo_image_idx" ON "finance_questions" USING btree ("seo_image_id");
  CREATE INDEX "finance_questions_updated_at_idx" ON "finance_questions" USING btree ("updated_at");
  CREATE INDEX "finance_questions_created_at_idx" ON "finance_questions" USING btree ("created_at");
  CREATE INDEX "finance_questions__status_idx" ON "finance_questions" USING btree ("_status");
  CREATE UNIQUE INDEX "finance_questions_slug_idx" ON "finance_questions_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "finance_questions_locales_locale_parent_id_unique" ON "finance_questions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "finance_questions_locales_parent_id_idx" ON "finance_questions_locales" USING btree ("_parent_id");
  CREATE INDEX "finance_questions_rels_order_idx" ON "finance_questions_rels" USING btree ("order");
  CREATE INDEX "finance_questions_rels_parent_idx" ON "finance_questions_rels" USING btree ("parent_id");
  CREATE INDEX "finance_questions_rels_path_idx" ON "finance_questions_rels" USING btree ("path");
  CREATE INDEX "finance_questions_rels_finance_questions_id_idx" ON "finance_questions_rels" USING btree ("finance_questions_id");
  CREATE INDEX "_finance_questions_v_version_factors_order_idx" ON "_finance_questions_v_version_factors" USING btree ("_order");
  CREATE INDEX "_finance_questions_v_version_factors_parent_id_idx" ON "_finance_questions_v_version_factors" USING btree ("_parent_id");
  CREATE INDEX "_finance_questions_v_version_factors_locale_idx" ON "_finance_questions_v_version_factors" USING btree ("_locale");
  CREATE INDEX "_finance_questions_v_version_sources_order_idx" ON "_finance_questions_v_version_sources" USING btree ("_order");
  CREATE INDEX "_finance_questions_v_version_sources_parent_id_idx" ON "_finance_questions_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_finance_questions_v_parent_idx" ON "_finance_questions_v" USING btree ("parent_id");
  CREATE INDEX "_finance_questions_v_version_version_key_idx" ON "_finance_questions_v" USING btree ("version_key");
  CREATE INDEX "_finance_questions_v_version_version_product_idx" ON "_finance_questions_v" USING btree ("version_product_id");
  CREATE INDEX "_finance_questions_v_version_version_guide_idx" ON "_finance_questions_v" USING btree ("version_guide_id");
  CREATE INDEX "_finance_questions_v_version_seo_version_seo_image_idx" ON "_finance_questions_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_finance_questions_v_version_version_updated_at_idx" ON "_finance_questions_v" USING btree ("version_updated_at");
  CREATE INDEX "_finance_questions_v_version_version_created_at_idx" ON "_finance_questions_v" USING btree ("version_created_at");
  CREATE INDEX "_finance_questions_v_version_version__status_idx" ON "_finance_questions_v" USING btree ("version__status");
  CREATE INDEX "_finance_questions_v_created_at_idx" ON "_finance_questions_v" USING btree ("created_at");
  CREATE INDEX "_finance_questions_v_updated_at_idx" ON "_finance_questions_v" USING btree ("updated_at");
  CREATE INDEX "_finance_questions_v_snapshot_idx" ON "_finance_questions_v" USING btree ("snapshot");
  CREATE INDEX "_finance_questions_v_published_locale_idx" ON "_finance_questions_v" USING btree ("published_locale");
  CREATE INDEX "_finance_questions_v_latest_idx" ON "_finance_questions_v" USING btree ("latest");
  CREATE INDEX "_finance_questions_v_version_version_slug_idx" ON "_finance_questions_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_finance_questions_v_locales_locale_parent_id_unique" ON "_finance_questions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_finance_questions_v_locales_parent_id_idx" ON "_finance_questions_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_finance_questions_v_rels_order_idx" ON "_finance_questions_v_rels" USING btree ("order");
  CREATE INDEX "_finance_questions_v_rels_parent_idx" ON "_finance_questions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_finance_questions_v_rels_path_idx" ON "_finance_questions_v_rels" USING btree ("path");
  CREATE INDEX "_finance_questions_v_rels_finance_questions_id_idx" ON "_finance_questions_v_rels" USING btree ("finance_questions_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_finance_questions_fk" FOREIGN KEY ("finance_questions_id") REFERENCES "public"."finance_questions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_finance_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("finance_questions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "finance_products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_finance_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "finance_questions_factors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_questions_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_questions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_questions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_questions_v_version_factors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_questions_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_questions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_questions_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_questions_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "finance_questions_factors" CASCADE;
  DROP TABLE "finance_questions_sources" CASCADE;
  DROP TABLE "finance_questions" CASCADE;
  DROP TABLE "finance_questions_locales" CASCADE;
  DROP TABLE "finance_questions_rels" CASCADE;
  DROP TABLE "_finance_questions_v_version_factors" CASCADE;
  DROP TABLE "_finance_questions_v_version_sources" CASCADE;
  DROP TABLE "_finance_questions_v" CASCADE;
  DROP TABLE "_finance_questions_v_locales" CASCADE;
  DROP TABLE "_finance_questions_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_finance_questions_fk";
  
  DROP INDEX "payload_locked_documents_rels_finance_questions_id_idx";
  ALTER TABLE "finance_products_faq" ADD CONSTRAINT "finance_products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_faq" ADD CONSTRAINT "_finance_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "finance_products_faq_order_idx" ON "finance_products_faq" USING btree ("_order");
  CREATE INDEX "finance_products_faq_parent_id_idx" ON "finance_products_faq" USING btree ("_parent_id");
  CREATE INDEX "finance_products_faq_locale_idx" ON "finance_products_faq" USING btree ("_locale");
  CREATE INDEX "_finance_products_v_version_faq_order_idx" ON "_finance_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_faq_parent_id_idx" ON "_finance_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_version_faq_locale_idx" ON "_finance_products_v_version_faq" USING btree ("_locale");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "finance_questions_id";
  DROP TYPE "public"."enum_finance_questions_topic";
  DROP TYPE "public"."enum_finance_questions_review_legal_status";
  DROP TYPE "public"."enum_finance_questions_review_status";
  DROP TYPE "public"."enum_finance_questions_status";
  DROP TYPE "public"."enum__finance_questions_v_version_topic";
  DROP TYPE "public"."enum__finance_questions_v_version_review_legal_status";
  DROP TYPE "public"."enum__finance_questions_v_version_review_status";
  DROP TYPE "public"."enum__finance_questions_v_version_status";
  DROP TYPE "public"."enum__finance_questions_v_published_locale";`)
}
