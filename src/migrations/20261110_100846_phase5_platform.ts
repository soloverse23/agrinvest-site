import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_tool_widget_widget" AS ENUM('grainPrices', 'netPrice', 'diesel', 'weather', 'news');
  CREATE TYPE "public"."enum__pages_v_blocks_tool_widget_widget" AS ENUM('grainPrices', 'netPrice', 'diesel', 'weather', 'news');
  CREATE TYPE "public"."enum_buy_prices_basis" AS ENUM('la-baza', 'la-ferma');
  CREATE TYPE "public"."enum_buy_prices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_buy_prices_source" AS ENUM('manual', 'feed');
  CREATE TYPE "public"."enum_market_prices_source" AS ENUM('eu-agrifood', 'eu-fertiliser', 'eu-oil-bulletin');
  CREATE TYPE "public"."enum_diesel_prices_vat" AS ENUM('fara-tva', 'cu-tva');
  CREATE TYPE "public"."enum_diesel_prices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_news_items_source" AS ENUM('revista-ferma', 'agrointel');
  CREATE TYPE "public"."enum_news_items_status" AS ENUM('nou', 'aprobat', 'ascuns');
  CREATE TYPE "public"."enum_subscriptions_topics_kind" AS ENUM('price-alert', 'newsletter', 'frost-alert');
  CREATE TYPE "public"."enum_subscriptions_topics_rule" AS ENUM('any', 'above', 'below');
  CREATE TYPE "public"."enum_subscriptions_channel" AS ENUM('email', 'whatsapp');
  CREATE TYPE "public"."enum_subscriptions_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_subscriptions_status" AS ENUM('pending', 'confirmed', 'unsubscribed');
  CREATE TYPE "public"."enum_outbox_channel" AS ENUM('email', 'whatsapp');
  CREATE TYPE "public"."enum_outbox_template" AS ENUM('price-alert', 'frost-alert', 'newsletter', 'subscription-confirm');
  CREATE TYPE "public"."enum_outbox_status" AS ENUM('stubbed', 'sent', 'failed');
  CREATE TYPE "public"."enum_newsletters_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'approved', 'queued');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'fetchEuCereal', 'fetchEuFertiliser', 'fetchOilBulletin', 'ingestNews', 'evaluateAlerts', 'buildNewsletter');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'fetchEuCereal', 'fetchEuFertiliser', 'fetchOilBulletin', 'ingestNews', 'evaluateAlerts', 'buildNewsletter');
  ALTER TYPE "public"."enum_pages_blocks_lead_form_lead_type" ADD VALUE 'motorina' BEFORE 'parteneri';
  ALTER TYPE "public"."enum__pages_v_blocks_lead_form_lead_type" ADD VALUE 'motorina' BEFORE 'parteneri';
  ALTER TYPE "public"."enum_guides_section" ADD VALUE 'stiri';
  ALTER TYPE "public"."enum_guides_section" ADD VALUE 'piata';
  ALTER TYPE "public"."enum__guides_v_version_section" ADD VALUE 'stiri';
  ALTER TYPE "public"."enum__guides_v_version_section" ADD VALUE 'piata';
  ALTER TYPE "public"."enum_leads_type" ADD VALUE 'motorina' BEFORE 'parteneri';
  ALTER TYPE "public"."enum_lead_routing_routes_type" ADD VALUE 'motorina' BEFORE 'parteneri';
  CREATE TABLE "pages_blocks_tool_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"widget" "enum_pages_blocks_tool_widget_widget",
  	"heading" varchar,
  	"crop_id" integer,
  	"county_id" integer,
  	"base_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tool_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"widget" "enum__pages_v_blocks_tool_widget_widget",
  	"heading" varchar,
  	"crop_id" integer,
  	"county_id" integer,
  	"base_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "buy_prices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"crop_id" integer NOT NULL,
  	"base_id" integer,
  	"price" numeric NOT NULL,
  	"basis" "enum_buy_prices_basis" DEFAULT 'la-baza' NOT NULL,
  	"valid_from" timestamp(3) with time zone NOT NULL,
  	"status" "enum_buy_prices_status" DEFAULT 'draft' NOT NULL,
  	"source" "enum_buy_prices_source" DEFAULT 'manual' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "buy_prices_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "market_prices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"source" "enum_market_prices_source" NOT NULL,
  	"series" varchar NOT NULL,
  	"market" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"currency" varchar DEFAULT 'EUR' NOT NULL,
  	"unit" varchar NOT NULL,
  	"period" timestamp(3) with time zone NOT NULL,
  	"fetched_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "diesel_prices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"price" numeric NOT NULL,
  	"vat" "enum_diesel_prices_vat" DEFAULT 'fara-tva' NOT NULL,
  	"valid_from" timestamp(3) with time zone NOT NULL,
  	"minimum_litres" numeric,
  	"status" "enum_diesel_prices_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "diesel_prices_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "diesel_prices_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"counties_id" integer
  );
  
  CREATE TABLE "news_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"source" "enum_news_items_source" NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"excerpt" varchar,
  	"status" "enum_news_items_status" DEFAULT 'nou' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"crops_id" integer
  );
  
  CREATE TABLE "subscriptions_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_subscriptions_topics_kind" NOT NULL,
  	"crop_id" integer,
  	"rule" "enum_subscriptions_topics_rule",
  	"threshold" numeric,
  	"county_id" integer
  );
  
  CREATE TABLE "subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"channel" "enum_subscriptions_channel" DEFAULT 'email' NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"locale" "enum_subscriptions_locale" NOT NULL,
  	"status" "enum_subscriptions_status" DEFAULT 'pending' NOT NULL,
  	"consent_version" varchar NOT NULL,
  	"consent_at" timestamp(3) with time zone NOT NULL,
  	"consent_text" varchar NOT NULL,
  	"consent_source_path" varchar,
  	"token" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "outbox" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"channel" "enum_outbox_channel" NOT NULL,
  	"to" varchar NOT NULL,
  	"template" "enum_outbox_template" NOT NULL,
  	"subject" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"payload" jsonb,
  	"status" "enum_outbox_status" DEFAULT 'stubbed' NOT NULL,
  	"subscription_id" integer,
  	"dedupe_key" varchar,
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"week" timestamp(3) with time zone NOT NULL,
  	"locale" "enum_newsletters_locale" NOT NULL,
  	"subject" varchar NOT NULL,
  	"intro" varchar,
  	"content" jsonb,
  	"status" "enum_newsletters_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "crops" ADD COLUMN "gdd_base" numeric;
  ALTER TABLE "_crops_v" ADD COLUMN "version_gdd_base" numeric;
  ALTER TABLE "leads" ADD COLUMN "quantity" numeric;
  ALTER TABLE "leads" ADD COLUMN "delivery_date" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "buy_prices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "market_prices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "diesel_prices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscriptions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "outbox_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletters_id" integer;
  ALTER TABLE "pages_blocks_tool_widget" ADD CONSTRAINT "pages_blocks_tool_widget_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tool_widget" ADD CONSTRAINT "pages_blocks_tool_widget_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tool_widget" ADD CONSTRAINT "pages_blocks_tool_widget_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tool_widget" ADD CONSTRAINT "pages_blocks_tool_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tool_widget" ADD CONSTRAINT "_pages_v_blocks_tool_widget_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tool_widget" ADD CONSTRAINT "_pages_v_blocks_tool_widget_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tool_widget" ADD CONSTRAINT "_pages_v_blocks_tool_widget_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tool_widget" ADD CONSTRAINT "_pages_v_blocks_tool_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buy_prices" ADD CONSTRAINT "buy_prices_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buy_prices" ADD CONSTRAINT "buy_prices_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buy_prices_locales" ADD CONSTRAINT "buy_prices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."buy_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "diesel_prices_locales" ADD CONSTRAINT "diesel_prices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."diesel_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "diesel_prices_rels" ADD CONSTRAINT "diesel_prices_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."diesel_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "diesel_prices_rels" ADD CONSTRAINT "diesel_prices_rels_counties_fk" FOREIGN KEY ("counties_id") REFERENCES "public"."counties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_items_rels" ADD CONSTRAINT "news_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_items_rels" ADD CONSTRAINT "news_items_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscriptions_topics" ADD CONSTRAINT "subscriptions_topics_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions_topics" ADD CONSTRAINT "subscriptions_topics_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions_topics" ADD CONSTRAINT "subscriptions_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "outbox" ADD CONSTRAINT "outbox_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_tool_widget_order_idx" ON "pages_blocks_tool_widget" USING btree ("_order");
  CREATE INDEX "pages_blocks_tool_widget_parent_id_idx" ON "pages_blocks_tool_widget" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tool_widget_path_idx" ON "pages_blocks_tool_widget" USING btree ("_path");
  CREATE INDEX "pages_blocks_tool_widget_locale_idx" ON "pages_blocks_tool_widget" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tool_widget_crop_idx" ON "pages_blocks_tool_widget" USING btree ("crop_id");
  CREATE INDEX "pages_blocks_tool_widget_county_idx" ON "pages_blocks_tool_widget" USING btree ("county_id");
  CREATE INDEX "pages_blocks_tool_widget_base_idx" ON "pages_blocks_tool_widget" USING btree ("base_id");
  CREATE INDEX "_pages_v_blocks_tool_widget_order_idx" ON "_pages_v_blocks_tool_widget" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tool_widget_parent_id_idx" ON "_pages_v_blocks_tool_widget" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tool_widget_path_idx" ON "_pages_v_blocks_tool_widget" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tool_widget_locale_idx" ON "_pages_v_blocks_tool_widget" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tool_widget_crop_idx" ON "_pages_v_blocks_tool_widget" USING btree ("crop_id");
  CREATE INDEX "_pages_v_blocks_tool_widget_county_idx" ON "_pages_v_blocks_tool_widget" USING btree ("county_id");
  CREATE INDEX "_pages_v_blocks_tool_widget_base_idx" ON "_pages_v_blocks_tool_widget" USING btree ("base_id");
  CREATE INDEX "buy_prices_crop_idx" ON "buy_prices" USING btree ("crop_id");
  CREATE INDEX "buy_prices_base_idx" ON "buy_prices" USING btree ("base_id");
  CREATE INDEX "buy_prices_valid_from_idx" ON "buy_prices" USING btree ("valid_from");
  CREATE INDEX "buy_prices_status_idx" ON "buy_prices" USING btree ("status");
  CREATE INDEX "buy_prices_updated_at_idx" ON "buy_prices" USING btree ("updated_at");
  CREATE INDEX "buy_prices_created_at_idx" ON "buy_prices" USING btree ("created_at");
  CREATE UNIQUE INDEX "buy_prices_locales_locale_parent_id_unique" ON "buy_prices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "buy_prices_locales_parent_id_idx" ON "buy_prices_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "market_prices_key_idx" ON "market_prices" USING btree ("key");
  CREATE INDEX "market_prices_source_idx" ON "market_prices" USING btree ("source");
  CREATE INDEX "market_prices_series_idx" ON "market_prices" USING btree ("series");
  CREATE INDEX "market_prices_period_idx" ON "market_prices" USING btree ("period");
  CREATE INDEX "market_prices_updated_at_idx" ON "market_prices" USING btree ("updated_at");
  CREATE INDEX "market_prices_created_at_idx" ON "market_prices" USING btree ("created_at");
  CREATE INDEX "diesel_prices_valid_from_idx" ON "diesel_prices" USING btree ("valid_from");
  CREATE INDEX "diesel_prices_status_idx" ON "diesel_prices" USING btree ("status");
  CREATE INDEX "diesel_prices_updated_at_idx" ON "diesel_prices" USING btree ("updated_at");
  CREATE INDEX "diesel_prices_created_at_idx" ON "diesel_prices" USING btree ("created_at");
  CREATE UNIQUE INDEX "diesel_prices_locales_locale_parent_id_unique" ON "diesel_prices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "diesel_prices_locales_parent_id_idx" ON "diesel_prices_locales" USING btree ("_parent_id");
  CREATE INDEX "diesel_prices_rels_order_idx" ON "diesel_prices_rels" USING btree ("order");
  CREATE INDEX "diesel_prices_rels_parent_idx" ON "diesel_prices_rels" USING btree ("parent_id");
  CREATE INDEX "diesel_prices_rels_path_idx" ON "diesel_prices_rels" USING btree ("path");
  CREATE INDEX "diesel_prices_rels_counties_id_idx" ON "diesel_prices_rels" USING btree ("counties_id");
  CREATE UNIQUE INDEX "news_items_url_idx" ON "news_items" USING btree ("url");
  CREATE INDEX "news_items_source_idx" ON "news_items" USING btree ("source");
  CREATE INDEX "news_items_published_at_idx" ON "news_items" USING btree ("published_at");
  CREATE INDEX "news_items_status_idx" ON "news_items" USING btree ("status");
  CREATE INDEX "news_items_updated_at_idx" ON "news_items" USING btree ("updated_at");
  CREATE INDEX "news_items_created_at_idx" ON "news_items" USING btree ("created_at");
  CREATE INDEX "news_items_rels_order_idx" ON "news_items_rels" USING btree ("order");
  CREATE INDEX "news_items_rels_parent_idx" ON "news_items_rels" USING btree ("parent_id");
  CREATE INDEX "news_items_rels_path_idx" ON "news_items_rels" USING btree ("path");
  CREATE INDEX "news_items_rels_crops_id_idx" ON "news_items_rels" USING btree ("crops_id");
  CREATE INDEX "subscriptions_topics_order_idx" ON "subscriptions_topics" USING btree ("_order");
  CREATE INDEX "subscriptions_topics_parent_id_idx" ON "subscriptions_topics" USING btree ("_parent_id");
  CREATE INDEX "subscriptions_topics_crop_idx" ON "subscriptions_topics" USING btree ("crop_id");
  CREATE INDEX "subscriptions_topics_county_idx" ON "subscriptions_topics" USING btree ("county_id");
  CREATE INDEX "subscriptions_email_idx" ON "subscriptions" USING btree ("email");
  CREATE INDEX "subscriptions_phone_idx" ON "subscriptions" USING btree ("phone");
  CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");
  CREATE UNIQUE INDEX "subscriptions_token_idx" ON "subscriptions" USING btree ("token");
  CREATE INDEX "subscriptions_updated_at_idx" ON "subscriptions" USING btree ("updated_at");
  CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions" USING btree ("created_at");
  CREATE INDEX "outbox_to_idx" ON "outbox" USING btree ("to");
  CREATE INDEX "outbox_status_idx" ON "outbox" USING btree ("status");
  CREATE INDEX "outbox_subscription_idx" ON "outbox" USING btree ("subscription_id");
  CREATE UNIQUE INDEX "outbox_dedupe_key_idx" ON "outbox" USING btree ("dedupe_key");
  CREATE INDEX "outbox_updated_at_idx" ON "outbox" USING btree ("updated_at");
  CREATE INDEX "outbox_created_at_idx" ON "outbox" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletters_key_idx" ON "newsletters" USING btree ("key");
  CREATE INDEX "newsletters_week_idx" ON "newsletters" USING btree ("week");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buy_prices_fk" FOREIGN KEY ("buy_prices_id") REFERENCES "public"."buy_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_market_prices_fk" FOREIGN KEY ("market_prices_id") REFERENCES "public"."market_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diesel_prices_fk" FOREIGN KEY ("diesel_prices_id") REFERENCES "public"."diesel_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_items_fk" FOREIGN KEY ("news_items_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscriptions_fk" FOREIGN KEY ("subscriptions_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_outbox_fk" FOREIGN KEY ("outbox_id") REFERENCES "public"."outbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_buy_prices_id_idx" ON "payload_locked_documents_rels" USING btree ("buy_prices_id");
  CREATE INDEX "payload_locked_documents_rels_market_prices_id_idx" ON "payload_locked_documents_rels" USING btree ("market_prices_id");
  CREATE INDEX "payload_locked_documents_rels_diesel_prices_id_idx" ON "payload_locked_documents_rels" USING btree ("diesel_prices_id");
  CREATE INDEX "payload_locked_documents_rels_news_items_id_idx" ON "payload_locked_documents_rels" USING btree ("news_items_id");
  CREATE INDEX "payload_locked_documents_rels_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_outbox_id_idx" ON "payload_locked_documents_rels" USING btree ("outbox_id");
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_tool_widget" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tool_widget" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "buy_prices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "buy_prices_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "market_prices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "diesel_prices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "diesel_prices_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "diesel_prices_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_items_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscriptions_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "outbox" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_tool_widget" CASCADE;
  DROP TABLE "_pages_v_blocks_tool_widget" CASCADE;
  DROP TABLE "buy_prices" CASCADE;
  DROP TABLE "buy_prices_locales" CASCADE;
  DROP TABLE "market_prices" CASCADE;
  DROP TABLE "diesel_prices" CASCADE;
  DROP TABLE "diesel_prices_locales" CASCADE;
  DROP TABLE "diesel_prices_rels" CASCADE;
  DROP TABLE "news_items" CASCADE;
  DROP TABLE "news_items_rels" CASCADE;
  DROP TABLE "subscriptions_topics" CASCADE;
  DROP TABLE "subscriptions" CASCADE;
  DROP TABLE "outbox" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_buy_prices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_market_prices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_diesel_prices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscriptions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_outbox_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletters_fk";
  
  ALTER TABLE "pages_blocks_lead_form" ALTER COLUMN "lead_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_lead_form_lead_type";
  CREATE TYPE "public"."enum_pages_blocks_lead_form_lead_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  ALTER TABLE "pages_blocks_lead_form" ALTER COLUMN "lead_type" SET DATA TYPE "public"."enum_pages_blocks_lead_form_lead_type" USING "lead_type"::"public"."enum_pages_blocks_lead_form_lead_type";
  ALTER TABLE "_pages_v_blocks_lead_form" ALTER COLUMN "lead_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_lead_form_lead_type";
  CREATE TYPE "public"."enum__pages_v_blocks_lead_form_lead_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  ALTER TABLE "_pages_v_blocks_lead_form" ALTER COLUMN "lead_type" SET DATA TYPE "public"."enum__pages_v_blocks_lead_form_lead_type" USING "lead_type"::"public"."enum__pages_v_blocks_lead_form_lead_type";
  ALTER TABLE "guides" ALTER COLUMN "section" SET DATA TYPE text;
  ALTER TABLE "guides" ALTER COLUMN "section" SET DEFAULT 'finantare'::text;
  DROP TYPE "public"."enum_guides_section";
  CREATE TYPE "public"."enum_guides_section" AS ENUM('finantare', 'pagina-finantare');
  ALTER TABLE "guides" ALTER COLUMN "section" SET DEFAULT 'finantare'::"public"."enum_guides_section";
  ALTER TABLE "guides" ALTER COLUMN "section" SET DATA TYPE "public"."enum_guides_section" USING "section"::"public"."enum_guides_section";
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DATA TYPE text;
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DEFAULT 'finantare'::text;
  DROP TYPE "public"."enum__guides_v_version_section";
  CREATE TYPE "public"."enum__guides_v_version_section" AS ENUM('finantare', 'pagina-finantare');
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DEFAULT 'finantare'::"public"."enum__guides_v_version_section";
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DATA TYPE "public"."enum__guides_v_version_section" USING "version_section"::"public"."enum__guides_v_version_section";
  ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_leads_type";
  CREATE TYPE "public"."enum_leads_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE "public"."enum_leads_type" USING "type"::"public"."enum_leads_type";
  ALTER TABLE "lead_routing_routes" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_lead_routing_routes_type";
  CREATE TYPE "public"."enum_lead_routing_routes_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  ALTER TABLE "lead_routing_routes" ALTER COLUMN "type" SET DATA TYPE "public"."enum_lead_routing_routes_type" USING "type"::"public"."enum_lead_routing_routes_type";
  DROP INDEX "payload_locked_documents_rels_buy_prices_id_idx";
  DROP INDEX "payload_locked_documents_rels_market_prices_id_idx";
  DROP INDEX "payload_locked_documents_rels_diesel_prices_id_idx";
  DROP INDEX "payload_locked_documents_rels_news_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_subscriptions_id_idx";
  DROP INDEX "payload_locked_documents_rels_outbox_id_idx";
  DROP INDEX "payload_locked_documents_rels_newsletters_id_idx";
  ALTER TABLE "crops" DROP COLUMN "gdd_base";
  ALTER TABLE "_crops_v" DROP COLUMN "version_gdd_base";
  ALTER TABLE "leads" DROP COLUMN "quantity";
  ALTER TABLE "leads" DROP COLUMN "delivery_date";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "buy_prices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "market_prices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "diesel_prices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscriptions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "outbox_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletters_id";
  DROP TYPE "public"."enum_pages_blocks_tool_widget_widget";
  DROP TYPE "public"."enum__pages_v_blocks_tool_widget_widget";
  DROP TYPE "public"."enum_buy_prices_basis";
  DROP TYPE "public"."enum_buy_prices_status";
  DROP TYPE "public"."enum_buy_prices_source";
  DROP TYPE "public"."enum_market_prices_source";
  DROP TYPE "public"."enum_diesel_prices_vat";
  DROP TYPE "public"."enum_diesel_prices_status";
  DROP TYPE "public"."enum_news_items_source";
  DROP TYPE "public"."enum_news_items_status";
  DROP TYPE "public"."enum_subscriptions_topics_kind";
  DROP TYPE "public"."enum_subscriptions_topics_rule";
  DROP TYPE "public"."enum_subscriptions_channel";
  DROP TYPE "public"."enum_subscriptions_locale";
  DROP TYPE "public"."enum_subscriptions_status";
  DROP TYPE "public"."enum_outbox_channel";
  DROP TYPE "public"."enum_outbox_template";
  DROP TYPE "public"."enum_outbox_status";
  DROP TYPE "public"."enum_newsletters_locale";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
