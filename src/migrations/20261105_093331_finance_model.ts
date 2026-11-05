import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_finance_products_borrowers" AS ENUM('pfa', 'ii', 'if', 'srl', 'sa', 'agricultural-company');
  CREATE TYPE "public"."enum_finance_products_guarantees_kind" AS ENUM('promissory-note', 'crops', 'machinery', 'apia-subsidies', 'grain-contracts', 'mortgage');
  CREATE TYPE "public"."enum_finance_products_documents_audience" AS ENUM('all', 'individual', 'company');
  CREATE TYPE "public"."enum_finance_products_review_legal_status" AS ENUM('draft', 'ifn-reviewed', 'legal-approved');
  CREATE TYPE "public"."enum_finance_products_review_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_finance_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__finance_products_v_version_borrowers" AS ENUM('pfa', 'ii', 'if', 'srl', 'sa', 'agricultural-company');
  CREATE TYPE "public"."enum__finance_products_v_version_guarantees_kind" AS ENUM('promissory-note', 'crops', 'machinery', 'apia-subsidies', 'grain-contracts', 'mortgage');
  CREATE TYPE "public"."enum__finance_products_v_version_documents_audience" AS ENUM('all', 'individual', 'company');
  CREATE TYPE "public"."enum__finance_products_v_version_review_legal_status" AS ENUM('draft', 'ifn-reviewed', 'legal-approved');
  CREATE TYPE "public"."enum__finance_products_v_version_review_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__finance_products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__finance_products_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_guides_section" AS ENUM('finantare');
  CREATE TYPE "public"."enum_guides_review_legal_status" AS ENUM('draft', 'ifn-reviewed', 'legal-approved');
  CREATE TYPE "public"."enum_guides_review_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_version_section" AS ENUM('finantare');
  CREATE TYPE "public"."enum__guides_v_version_review_legal_status" AS ENUM('draft', 'ifn-reviewed', 'legal-approved');
  CREATE TYPE "public"."enum__guides_v_version_review_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_finance_applications_guarantees" AS ENUM('promissory-note', 'crops', 'machinery', 'apia-subsidies', 'grain-contracts', 'mortgage');
  CREATE TYPE "public"."enum_finance_applications_status" AS ENUM('new', 'contacted', 'in-analysis', 'closed');
  CREATE TYPE "public"."enum_finance_applications_borrower" AS ENUM('pfa', 'ii', 'if', 'srl', 'sa', 'agricultural-company');
  CREATE TYPE "public"."enum_finance_applications_meta_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'ifn');
  CREATE TABLE "finance_products_example_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "finance_products_borrowers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_finance_products_borrowers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "finance_products_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_finance_products_guarantees_kind",
  	"note" varchar
  );
  
  CREATE TABLE "finance_products_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"audience" "enum_finance_products_documents_audience" DEFAULT 'all',
  	"label" varchar
  );
  
  CREATE TABLE "finance_products_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "finance_products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "finance_products_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"retrieved" timestamp(3) with time zone
  );
  
  CREATE TABLE "finance_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"parent_id" integer,
  	"order" numeric DEFAULT 100,
  	"limits_amount_min" numeric,
  	"limits_amount_max" numeric,
  	"limits_term_months" numeric,
  	"advisor_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"review_legal_status" "enum_finance_products_review_legal_status" DEFAULT 'draft',
  	"review_status" "enum_finance_products_review_status" DEFAULT 'to-confirm',
  	"review_reviewed_at" timestamp(3) with time zone,
  	"review_reviewed_by" varchar,
  	"enrichment" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_finance_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "finance_products_locales" (
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"answer" varchar,
  	"fits" jsonb,
  	"not_for" jsonb,
  	"finances" jsonb,
  	"repayment" jsonb,
  	"example_title" varchar,
  	"example_scenario" jsonb,
  	"risks" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "finance_products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finance_products_id" integer,
  	"guides_id" integer
  );
  
  CREATE TABLE "_finance_products_v_version_example_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_finance_products_v_version_borrowers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__finance_products_v_version_borrowers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_finance_products_v_version_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__finance_products_v_version_guarantees_kind",
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_finance_products_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"audience" "enum__finance_products_v_version_documents_audience" DEFAULT 'all',
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_finance_products_v_version_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
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
  
  CREATE TABLE "_finance_products_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"retrieved" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_finance_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_parent_id" integer,
  	"version_order" numeric DEFAULT 100,
  	"version_limits_amount_min" numeric,
  	"version_limits_amount_max" numeric,
  	"version_limits_term_months" numeric,
  	"version_advisor_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_review_legal_status" "enum__finance_products_v_version_review_legal_status" DEFAULT 'draft',
  	"version_review_status" "enum__finance_products_v_version_review_status" DEFAULT 'to-confirm',
  	"version_review_reviewed_at" timestamp(3) with time zone,
  	"version_review_reviewed_by" varchar,
  	"version_enrichment" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__finance_products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__finance_products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_finance_products_v_locales" (
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_answer" varchar,
  	"version_fits" jsonb,
  	"version_not_for" jsonb,
  	"version_finances" jsonb,
  	"version_repayment" jsonb,
  	"version_example_title" varchar,
  	"version_example_scenario" jsonb,
  	"version_risks" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_finance_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finance_products_id" integer,
  	"guides_id" integer
  );
  
  CREATE TABLE "guides_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"definition" varchar
  );
  
  CREATE TABLE "guides_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "guides_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"retrieved" timestamp(3) with time zone
  );
  
  CREATE TABLE "guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"section" "enum_guides_section" DEFAULT 'finantare',
  	"author_id" integer,
  	"reviewer_id" integer,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"review_legal_status" "enum_guides_review_legal_status" DEFAULT 'draft',
  	"review_status" "enum_guides_review_status" DEFAULT 'to-confirm',
  	"review_reviewed_at" timestamp(3) with time zone,
  	"review_reviewed_by" varchar,
  	"enrichment" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "guides_locales" (
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"summary" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finance_products_id" integer,
  	"guides_id" integer
  );
  
  CREATE TABLE "_guides_v_version_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"definition" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"retrieved" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_section" "enum__guides_v_version_section" DEFAULT 'finantare',
  	"version_author_id" integer,
  	"version_reviewer_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_review_legal_status" "enum__guides_v_version_review_legal_status" DEFAULT 'draft',
  	"version_review_status" "enum__guides_v_version_review_status" DEFAULT 'to-confirm',
  	"version_review_reviewed_at" timestamp(3) with time zone,
  	"version_review_reviewed_by" varchar,
  	"version_enrichment" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__guides_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_guides_v_locales" (
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"finance_products_id" integer,
  	"guides_id" integer
  );
  
  CREATE TABLE "finance_applications_guarantees" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_finance_applications_guarantees",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "finance_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_finance_applications_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"borrower" "enum_finance_applications_borrower" NOT NULL,
  	"company" varchar,
  	"cui" varchar,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"product_id" integer,
  	"amount" numeric,
  	"term_months" numeric,
  	"county_id" integer,
  	"area" numeric,
  	"message" varchar,
  	"consents_data_processing" boolean DEFAULT false NOT NULL,
  	"consents_credit_bureau" boolean,
  	"consents_version" varchar,
  	"meta_locale" "enum_finance_applications_meta_locale",
  	"meta_source_path" varchar,
  	"meta_utm_source" varchar,
  	"meta_utm_campaign" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "finance_applications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"crops_id" integer
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "pages" ADD COLUMN "enrichment" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_enrichment" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "finance_products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "finance_applications_id" integer;
  ALTER TABLE "finance_products_example_rows" ADD CONSTRAINT "finance_products_example_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_borrowers" ADD CONSTRAINT "finance_products_borrowers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_guarantees" ADD CONSTRAINT "finance_products_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_documents" ADD CONSTRAINT "finance_products_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_process" ADD CONSTRAINT "finance_products_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_faq" ADD CONSTRAINT "finance_products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_sources" ADD CONSTRAINT "finance_products_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products" ADD CONSTRAINT "finance_products_parent_id_finance_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_products" ADD CONSTRAINT "finance_products_advisor_id_people_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_products" ADD CONSTRAINT "finance_products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_products_locales" ADD CONSTRAINT "finance_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_rels" ADD CONSTRAINT "finance_products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_rels" ADD CONSTRAINT "finance_products_rels_finance_products_fk" FOREIGN KEY ("finance_products_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_products_rels" ADD CONSTRAINT "finance_products_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_example_rows" ADD CONSTRAINT "_finance_products_v_version_example_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_borrowers" ADD CONSTRAINT "_finance_products_v_version_borrowers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_guarantees" ADD CONSTRAINT "_finance_products_v_version_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_documents" ADD CONSTRAINT "_finance_products_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_process" ADD CONSTRAINT "_finance_products_v_version_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_faq" ADD CONSTRAINT "_finance_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_version_sources" ADD CONSTRAINT "_finance_products_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v" ADD CONSTRAINT "_finance_products_v_parent_id_finance_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_products_v" ADD CONSTRAINT "_finance_products_v_version_parent_id_finance_products_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."finance_products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_products_v" ADD CONSTRAINT "_finance_products_v_version_advisor_id_people_id_fk" FOREIGN KEY ("version_advisor_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_products_v" ADD CONSTRAINT "_finance_products_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_finance_products_v_locales" ADD CONSTRAINT "_finance_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_rels" ADD CONSTRAINT "_finance_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_finance_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_rels" ADD CONSTRAINT "_finance_products_v_rels_finance_products_fk" FOREIGN KEY ("finance_products_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_finance_products_v_rels" ADD CONSTRAINT "_finance_products_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_terms" ADD CONSTRAINT "guides_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_faq" ADD CONSTRAINT "guides_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_sources" ADD CONSTRAINT "guides_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_author_id_people_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_reviewer_id_people_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_locales" ADD CONSTRAINT "guides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_finance_products_fk" FOREIGN KEY ("finance_products_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_terms" ADD CONSTRAINT "_guides_v_version_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_faq" ADD CONSTRAINT "_guides_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_sources" ADD CONSTRAINT "_guides_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_author_id_people_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_reviewer_id_people_id_fk" FOREIGN KEY ("version_reviewer_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_locales" ADD CONSTRAINT "_guides_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_finance_products_fk" FOREIGN KEY ("finance_products_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_applications_guarantees" ADD CONSTRAINT "finance_applications_guarantees_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_applications" ADD CONSTRAINT "finance_applications_assigned_to_id_people_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_applications" ADD CONSTRAINT "finance_applications_product_id_finance_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."finance_products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_applications" ADD CONSTRAINT "finance_applications_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_applications_rels" ADD CONSTRAINT "finance_applications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."finance_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "finance_applications_rels" ADD CONSTRAINT "finance_applications_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "finance_products_example_rows_order_idx" ON "finance_products_example_rows" USING btree ("_order");
  CREATE INDEX "finance_products_example_rows_parent_id_idx" ON "finance_products_example_rows" USING btree ("_parent_id");
  CREATE INDEX "finance_products_example_rows_locale_idx" ON "finance_products_example_rows" USING btree ("_locale");
  CREATE INDEX "finance_products_borrowers_order_idx" ON "finance_products_borrowers" USING btree ("order");
  CREATE INDEX "finance_products_borrowers_parent_idx" ON "finance_products_borrowers" USING btree ("parent_id");
  CREATE INDEX "finance_products_guarantees_order_idx" ON "finance_products_guarantees" USING btree ("_order");
  CREATE INDEX "finance_products_guarantees_parent_id_idx" ON "finance_products_guarantees" USING btree ("_parent_id");
  CREATE INDEX "finance_products_guarantees_locale_idx" ON "finance_products_guarantees" USING btree ("_locale");
  CREATE INDEX "finance_products_documents_order_idx" ON "finance_products_documents" USING btree ("_order");
  CREATE INDEX "finance_products_documents_parent_id_idx" ON "finance_products_documents" USING btree ("_parent_id");
  CREATE INDEX "finance_products_documents_locale_idx" ON "finance_products_documents" USING btree ("_locale");
  CREATE INDEX "finance_products_process_order_idx" ON "finance_products_process" USING btree ("_order");
  CREATE INDEX "finance_products_process_parent_id_idx" ON "finance_products_process" USING btree ("_parent_id");
  CREATE INDEX "finance_products_process_locale_idx" ON "finance_products_process" USING btree ("_locale");
  CREATE INDEX "finance_products_faq_order_idx" ON "finance_products_faq" USING btree ("_order");
  CREATE INDEX "finance_products_faq_parent_id_idx" ON "finance_products_faq" USING btree ("_parent_id");
  CREATE INDEX "finance_products_faq_locale_idx" ON "finance_products_faq" USING btree ("_locale");
  CREATE INDEX "finance_products_sources_order_idx" ON "finance_products_sources" USING btree ("_order");
  CREATE INDEX "finance_products_sources_parent_id_idx" ON "finance_products_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "finance_products_key_idx" ON "finance_products" USING btree ("key");
  CREATE INDEX "finance_products_parent_idx" ON "finance_products" USING btree ("parent_id");
  CREATE INDEX "finance_products_advisor_idx" ON "finance_products" USING btree ("advisor_id");
  CREATE INDEX "finance_products_seo_seo_image_idx" ON "finance_products" USING btree ("seo_image_id");
  CREATE INDEX "finance_products_updated_at_idx" ON "finance_products" USING btree ("updated_at");
  CREATE INDEX "finance_products_created_at_idx" ON "finance_products" USING btree ("created_at");
  CREATE INDEX "finance_products__status_idx" ON "finance_products" USING btree ("_status");
  CREATE UNIQUE INDEX "finance_products_slug_idx" ON "finance_products_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "finance_products_locales_locale_parent_id_unique" ON "finance_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "finance_products_locales_parent_id_idx" ON "finance_products_locales" USING btree ("_parent_id");
  CREATE INDEX "finance_products_rels_order_idx" ON "finance_products_rels" USING btree ("order");
  CREATE INDEX "finance_products_rels_parent_idx" ON "finance_products_rels" USING btree ("parent_id");
  CREATE INDEX "finance_products_rels_path_idx" ON "finance_products_rels" USING btree ("path");
  CREATE INDEX "finance_products_rels_finance_products_id_idx" ON "finance_products_rels" USING btree ("finance_products_id");
  CREATE INDEX "finance_products_rels_guides_id_idx" ON "finance_products_rels" USING btree ("guides_id");
  CREATE INDEX "_finance_products_v_version_example_rows_order_idx" ON "_finance_products_v_version_example_rows" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_example_rows_parent_id_idx" ON "_finance_products_v_version_example_rows" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_version_example_rows_locale_idx" ON "_finance_products_v_version_example_rows" USING btree ("_locale");
  CREATE INDEX "_finance_products_v_version_borrowers_order_idx" ON "_finance_products_v_version_borrowers" USING btree ("order");
  CREATE INDEX "_finance_products_v_version_borrowers_parent_idx" ON "_finance_products_v_version_borrowers" USING btree ("parent_id");
  CREATE INDEX "_finance_products_v_version_guarantees_order_idx" ON "_finance_products_v_version_guarantees" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_guarantees_parent_id_idx" ON "_finance_products_v_version_guarantees" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_version_guarantees_locale_idx" ON "_finance_products_v_version_guarantees" USING btree ("_locale");
  CREATE INDEX "_finance_products_v_version_documents_order_idx" ON "_finance_products_v_version_documents" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_documents_parent_id_idx" ON "_finance_products_v_version_documents" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_version_documents_locale_idx" ON "_finance_products_v_version_documents" USING btree ("_locale");
  CREATE INDEX "_finance_products_v_version_process_order_idx" ON "_finance_products_v_version_process" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_process_parent_id_idx" ON "_finance_products_v_version_process" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_version_process_locale_idx" ON "_finance_products_v_version_process" USING btree ("_locale");
  CREATE INDEX "_finance_products_v_version_faq_order_idx" ON "_finance_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_faq_parent_id_idx" ON "_finance_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_version_faq_locale_idx" ON "_finance_products_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_finance_products_v_version_sources_order_idx" ON "_finance_products_v_version_sources" USING btree ("_order");
  CREATE INDEX "_finance_products_v_version_sources_parent_id_idx" ON "_finance_products_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_parent_idx" ON "_finance_products_v" USING btree ("parent_id");
  CREATE INDEX "_finance_products_v_version_version_key_idx" ON "_finance_products_v" USING btree ("version_key");
  CREATE INDEX "_finance_products_v_version_version_parent_idx" ON "_finance_products_v" USING btree ("version_parent_id");
  CREATE INDEX "_finance_products_v_version_version_advisor_idx" ON "_finance_products_v" USING btree ("version_advisor_id");
  CREATE INDEX "_finance_products_v_version_seo_version_seo_image_idx" ON "_finance_products_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_finance_products_v_version_version_updated_at_idx" ON "_finance_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_finance_products_v_version_version_created_at_idx" ON "_finance_products_v" USING btree ("version_created_at");
  CREATE INDEX "_finance_products_v_version_version__status_idx" ON "_finance_products_v" USING btree ("version__status");
  CREATE INDEX "_finance_products_v_created_at_idx" ON "_finance_products_v" USING btree ("created_at");
  CREATE INDEX "_finance_products_v_updated_at_idx" ON "_finance_products_v" USING btree ("updated_at");
  CREATE INDEX "_finance_products_v_snapshot_idx" ON "_finance_products_v" USING btree ("snapshot");
  CREATE INDEX "_finance_products_v_published_locale_idx" ON "_finance_products_v" USING btree ("published_locale");
  CREATE INDEX "_finance_products_v_latest_idx" ON "_finance_products_v" USING btree ("latest");
  CREATE INDEX "_finance_products_v_version_version_slug_idx" ON "_finance_products_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_finance_products_v_locales_locale_parent_id_unique" ON "_finance_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_finance_products_v_locales_parent_id_idx" ON "_finance_products_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_finance_products_v_rels_order_idx" ON "_finance_products_v_rels" USING btree ("order");
  CREATE INDEX "_finance_products_v_rels_parent_idx" ON "_finance_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_finance_products_v_rels_path_idx" ON "_finance_products_v_rels" USING btree ("path");
  CREATE INDEX "_finance_products_v_rels_finance_products_id_idx" ON "_finance_products_v_rels" USING btree ("finance_products_id");
  CREATE INDEX "_finance_products_v_rels_guides_id_idx" ON "_finance_products_v_rels" USING btree ("guides_id");
  CREATE INDEX "guides_terms_order_idx" ON "guides_terms" USING btree ("_order");
  CREATE INDEX "guides_terms_parent_id_idx" ON "guides_terms" USING btree ("_parent_id");
  CREATE INDEX "guides_terms_locale_idx" ON "guides_terms" USING btree ("_locale");
  CREATE INDEX "guides_faq_order_idx" ON "guides_faq" USING btree ("_order");
  CREATE INDEX "guides_faq_parent_id_idx" ON "guides_faq" USING btree ("_parent_id");
  CREATE INDEX "guides_faq_locale_idx" ON "guides_faq" USING btree ("_locale");
  CREATE INDEX "guides_sources_order_idx" ON "guides_sources" USING btree ("_order");
  CREATE INDEX "guides_sources_parent_id_idx" ON "guides_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "guides_key_idx" ON "guides" USING btree ("key");
  CREATE INDEX "guides_author_idx" ON "guides" USING btree ("author_id");
  CREATE INDEX "guides_reviewer_idx" ON "guides" USING btree ("reviewer_id");
  CREATE INDEX "guides_seo_seo_image_idx" ON "guides" USING btree ("seo_image_id");
  CREATE INDEX "guides_updated_at_idx" ON "guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "guides" USING btree ("_status");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "guides_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "guides_locales_locale_parent_id_unique" ON "guides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides_locales_parent_id_idx" ON "guides_locales" USING btree ("_parent_id");
  CREATE INDEX "guides_rels_order_idx" ON "guides_rels" USING btree ("order");
  CREATE INDEX "guides_rels_parent_idx" ON "guides_rels" USING btree ("parent_id");
  CREATE INDEX "guides_rels_path_idx" ON "guides_rels" USING btree ("path");
  CREATE INDEX "guides_rels_finance_products_id_idx" ON "guides_rels" USING btree ("finance_products_id");
  CREATE INDEX "guides_rels_guides_id_idx" ON "guides_rels" USING btree ("guides_id");
  CREATE INDEX "_guides_v_version_terms_order_idx" ON "_guides_v_version_terms" USING btree ("_order");
  CREATE INDEX "_guides_v_version_terms_parent_id_idx" ON "_guides_v_version_terms" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_terms_locale_idx" ON "_guides_v_version_terms" USING btree ("_locale");
  CREATE INDEX "_guides_v_version_faq_order_idx" ON "_guides_v_version_faq" USING btree ("_order");
  CREATE INDEX "_guides_v_version_faq_parent_id_idx" ON "_guides_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_faq_locale_idx" ON "_guides_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_guides_v_version_sources_order_idx" ON "_guides_v_version_sources" USING btree ("_order");
  CREATE INDEX "_guides_v_version_sources_parent_id_idx" ON "_guides_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_parent_idx" ON "_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_key_idx" ON "_guides_v" USING btree ("version_key");
  CREATE INDEX "_guides_v_version_version_author_idx" ON "_guides_v" USING btree ("version_author_id");
  CREATE INDEX "_guides_v_version_version_reviewer_idx" ON "_guides_v" USING btree ("version_reviewer_id");
  CREATE INDEX "_guides_v_version_seo_version_seo_image_idx" ON "_guides_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_snapshot_idx" ON "_guides_v" USING btree ("snapshot");
  CREATE INDEX "_guides_v_published_locale_idx" ON "_guides_v" USING btree ("published_locale");
  CREATE INDEX "_guides_v_latest_idx" ON "_guides_v" USING btree ("latest");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "_guides_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_guides_v_locales_locale_parent_id_unique" ON "_guides_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_guides_v_locales_parent_id_idx" ON "_guides_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_rels_order_idx" ON "_guides_v_rels" USING btree ("order");
  CREATE INDEX "_guides_v_rels_parent_idx" ON "_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guides_v_rels_path_idx" ON "_guides_v_rels" USING btree ("path");
  CREATE INDEX "_guides_v_rels_finance_products_id_idx" ON "_guides_v_rels" USING btree ("finance_products_id");
  CREATE INDEX "_guides_v_rels_guides_id_idx" ON "_guides_v_rels" USING btree ("guides_id");
  CREATE INDEX "finance_applications_guarantees_order_idx" ON "finance_applications_guarantees" USING btree ("order");
  CREATE INDEX "finance_applications_guarantees_parent_idx" ON "finance_applications_guarantees" USING btree ("parent_id");
  CREATE UNIQUE INDEX "finance_applications_reference_idx" ON "finance_applications" USING btree ("reference");
  CREATE INDEX "finance_applications_assigned_to_idx" ON "finance_applications" USING btree ("assigned_to_id");
  CREATE INDEX "finance_applications_product_idx" ON "finance_applications" USING btree ("product_id");
  CREATE INDEX "finance_applications_county_idx" ON "finance_applications" USING btree ("county_id");
  CREATE INDEX "finance_applications_updated_at_idx" ON "finance_applications" USING btree ("updated_at");
  CREATE INDEX "finance_applications_created_at_idx" ON "finance_applications" USING btree ("created_at");
  CREATE INDEX "finance_applications_rels_order_idx" ON "finance_applications_rels" USING btree ("order");
  CREATE INDEX "finance_applications_rels_parent_idx" ON "finance_applications_rels" USING btree ("parent_id");
  CREATE INDEX "finance_applications_rels_path_idx" ON "finance_applications_rels" USING btree ("path");
  CREATE INDEX "finance_applications_rels_crops_id_idx" ON "finance_applications_rels" USING btree ("crops_id");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_finance_products_fk" FOREIGN KEY ("finance_products_id") REFERENCES "public"."finance_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_finance_applications_fk" FOREIGN KEY ("finance_applications_id") REFERENCES "public"."finance_applications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_finance_products_id_idx" ON "payload_locked_documents_rels" USING btree ("finance_products_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_finance_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("finance_applications_id");`)
  // Accounts from before roles: they stay in charge, or nobody could ever give out a role.
  await db.execute(sql`
   INSERT INTO "users_roles" ("order", "parent_id", "value")
   SELECT 1, "id", 'admin' FROM "users"
   WHERE NOT EXISTS (SELECT 1 FROM "users_roles" r WHERE r."parent_id" = "users"."id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "finance_products_example_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_borrowers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_guarantees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_example_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_borrowers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_guarantees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_finance_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_version_terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_applications_guarantees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "finance_applications_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_roles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "finance_products_example_rows" CASCADE;
  DROP TABLE "finance_products_borrowers" CASCADE;
  DROP TABLE "finance_products_guarantees" CASCADE;
  DROP TABLE "finance_products_documents" CASCADE;
  DROP TABLE "finance_products_process" CASCADE;
  DROP TABLE "finance_products_faq" CASCADE;
  DROP TABLE "finance_products_sources" CASCADE;
  DROP TABLE "finance_products" CASCADE;
  DROP TABLE "finance_products_locales" CASCADE;
  DROP TABLE "finance_products_rels" CASCADE;
  DROP TABLE "_finance_products_v_version_example_rows" CASCADE;
  DROP TABLE "_finance_products_v_version_borrowers" CASCADE;
  DROP TABLE "_finance_products_v_version_guarantees" CASCADE;
  DROP TABLE "_finance_products_v_version_documents" CASCADE;
  DROP TABLE "_finance_products_v_version_process" CASCADE;
  DROP TABLE "_finance_products_v_version_faq" CASCADE;
  DROP TABLE "_finance_products_v_version_sources" CASCADE;
  DROP TABLE "_finance_products_v" CASCADE;
  DROP TABLE "_finance_products_v_locales" CASCADE;
  DROP TABLE "_finance_products_v_rels" CASCADE;
  DROP TABLE "guides_terms" CASCADE;
  DROP TABLE "guides_faq" CASCADE;
  DROP TABLE "guides_sources" CASCADE;
  DROP TABLE "guides" CASCADE;
  DROP TABLE "guides_locales" CASCADE;
  DROP TABLE "guides_rels" CASCADE;
  DROP TABLE "_guides_v_version_terms" CASCADE;
  DROP TABLE "_guides_v_version_faq" CASCADE;
  DROP TABLE "_guides_v_version_sources" CASCADE;
  DROP TABLE "_guides_v" CASCADE;
  DROP TABLE "_guides_v_locales" CASCADE;
  DROP TABLE "_guides_v_rels" CASCADE;
  DROP TABLE "finance_applications_guarantees" CASCADE;
  DROP TABLE "finance_applications" CASCADE;
  DROP TABLE "finance_applications_rels" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_finance_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_guides_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_finance_applications_fk";
  
  DROP INDEX "payload_locked_documents_rels_finance_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_guides_id_idx";
  DROP INDEX "payload_locked_documents_rels_finance_applications_id_idx";
  ALTER TABLE "pages" DROP COLUMN "enrichment";
  ALTER TABLE "_pages_v" DROP COLUMN "version_enrichment";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "finance_products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "guides_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "finance_applications_id";
  DROP TYPE "public"."enum_finance_products_borrowers";
  DROP TYPE "public"."enum_finance_products_guarantees_kind";
  DROP TYPE "public"."enum_finance_products_documents_audience";
  DROP TYPE "public"."enum_finance_products_review_legal_status";
  DROP TYPE "public"."enum_finance_products_review_status";
  DROP TYPE "public"."enum_finance_products_status";
  DROP TYPE "public"."enum__finance_products_v_version_borrowers";
  DROP TYPE "public"."enum__finance_products_v_version_guarantees_kind";
  DROP TYPE "public"."enum__finance_products_v_version_documents_audience";
  DROP TYPE "public"."enum__finance_products_v_version_review_legal_status";
  DROP TYPE "public"."enum__finance_products_v_version_review_status";
  DROP TYPE "public"."enum__finance_products_v_version_status";
  DROP TYPE "public"."enum__finance_products_v_published_locale";
  DROP TYPE "public"."enum_guides_section";
  DROP TYPE "public"."enum_guides_review_legal_status";
  DROP TYPE "public"."enum_guides_review_status";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum__guides_v_version_section";
  DROP TYPE "public"."enum__guides_v_version_review_legal_status";
  DROP TYPE "public"."enum__guides_v_version_review_status";
  DROP TYPE "public"."enum__guides_v_version_status";
  DROP TYPE "public"."enum__guides_v_published_locale";
  DROP TYPE "public"."enum_finance_applications_guarantees";
  DROP TYPE "public"."enum_finance_applications_status";
  DROP TYPE "public"."enum_finance_applications_borrower";
  DROP TYPE "public"."enum_finance_applications_meta_locale";
  DROP TYPE "public"."enum_users_roles";`)
}
