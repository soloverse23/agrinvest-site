import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_news_items_topics" AS ENUM('preturi', 'subventii', 'vreme', 'inputuri', 'boli', 'comert', 'finantare', 'ferma');
  CREATE TYPE "public"."enum_news_items_lang" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_news_stories_topics" AS ENUM('preturi', 'subventii', 'vreme', 'inputuri', 'boli', 'comert', 'finantare', 'ferma');
  CREATE TYPE "public"."enum_news_stories_sources" AS ENUM('revista-ferma', 'agrointel', 'reuters', 'zf', 'mediafax', 'g4media', 'profit', 'madr', 'ec-agri');
  CREATE TYPE "public"."enum_news_stories_topic" AS ENUM('preturi', 'subventii', 'vreme', 'inputuri', 'boli', 'comert', 'finantare', 'ferma');
  CREATE TYPE "public"."enum_news_stories_lang" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_news_stories_status" AS ENUM('visible', 'hidden');
  CREATE TYPE "public"."enum_news_editions_status" AS ENUM('published', 'removed');
  CREATE TYPE "public"."enum_news_runs_status" AS ENUM('running', 'ok', 'partial', 'failed');
  CREATE TYPE "public"."enum_news_settings_disabled_sources" AS ENUM('revista-ferma', 'agrointel', 'reuters', 'zf', 'mediafax', 'g4media', 'profit', 'madr', 'ec-agri');
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'reuters';
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'zf';
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'mediafax';
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'g4media';
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'profit';
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'madr';
  ALTER TYPE "public"."enum_news_items_source" ADD VALUE 'ec-agri';
  ALTER TYPE "public"."enum_outbox_template" ADD VALUE 'news-health';
  CREATE TABLE "news_items_topics" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_news_items_topics",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "news_stories_topics" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_news_stories_topics",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "news_stories_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_news_stories_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "news_stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"topic" "enum_news_stories_topic" NOT NULL,
  	"source_count" numeric,
  	"lang" "enum_news_stories_lang",
  	"base_score" numeric,
  	"score_parts" jsonb,
  	"first_seen" timestamp(3) with time zone NOT NULL,
  	"last_seen" timestamp(3) with time zone NOT NULL,
  	"status" "enum_news_stories_status" DEFAULT 'visible' NOT NULL,
  	"pinned_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"news_items_id" integer
  );
  
  CREATE TABLE "news_editions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar NOT NULL,
  	"count" numeric,
  	"entries" jsonb NOT NULL,
  	"frozen" boolean DEFAULT false,
  	"status" "enum_news_editions_status" DEFAULT 'published' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"finished_at" timestamp(3) with time zone,
  	"status" "enum_news_runs_status" NOT NULL,
  	"created" numeric DEFAULT 0,
  	"summary" varchar,
  	"sources" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_blocked" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_settings_disabled_sources" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_news_settings_disabled_sources",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "news_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"index_editions" boolean DEFAULT false,
  	"weights_official" numeric DEFAULT 1.3,
  	"weights_wire" numeric DEFAULT 1.3,
  	"weights_farm" numeric DEFAULT 1.1,
  	"weights_general" numeric DEFAULT 1,
  	"weights_romania" numeric DEFAULT 1.5,
  	"weights_region" numeric DEFAULT 1.2,
  	"weights_half_life_hours" numeric DEFAULT 12,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "news_items" ADD COLUMN "lang" "enum_news_items_lang";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_stories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_editions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_runs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_blocked_id" integer;
  ALTER TABLE "news_items_topics" ADD CONSTRAINT "news_items_topics_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_stories_topics" ADD CONSTRAINT "news_stories_topics_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_stories_sources" ADD CONSTRAINT "news_stories_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_stories_rels" ADD CONSTRAINT "news_stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_stories_rels" ADD CONSTRAINT "news_stories_rels_news_items_fk" FOREIGN KEY ("news_items_id") REFERENCES "public"."news_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_settings_disabled_sources" ADD CONSTRAINT "news_settings_disabled_sources_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "news_items_topics_order_idx" ON "news_items_topics" USING btree ("order");
  CREATE INDEX "news_items_topics_parent_idx" ON "news_items_topics" USING btree ("parent_id");
  CREATE INDEX "news_stories_topics_order_idx" ON "news_stories_topics" USING btree ("order");
  CREATE INDEX "news_stories_topics_parent_idx" ON "news_stories_topics" USING btree ("parent_id");
  CREATE INDEX "news_stories_sources_order_idx" ON "news_stories_sources" USING btree ("order");
  CREATE INDEX "news_stories_sources_parent_idx" ON "news_stories_sources" USING btree ("parent_id");
  CREATE UNIQUE INDEX "news_stories_key_idx" ON "news_stories" USING btree ("key");
  CREATE INDEX "news_stories_topic_idx" ON "news_stories" USING btree ("topic");
  CREATE INDEX "news_stories_base_score_idx" ON "news_stories" USING btree ("base_score");
  CREATE INDEX "news_stories_first_seen_idx" ON "news_stories" USING btree ("first_seen");
  CREATE INDEX "news_stories_last_seen_idx" ON "news_stories" USING btree ("last_seen");
  CREATE INDEX "news_stories_status_idx" ON "news_stories" USING btree ("status");
  CREATE INDEX "news_stories_updated_at_idx" ON "news_stories" USING btree ("updated_at");
  CREATE INDEX "news_stories_created_at_idx" ON "news_stories" USING btree ("created_at");
  CREATE INDEX "news_stories_rels_order_idx" ON "news_stories_rels" USING btree ("order");
  CREATE INDEX "news_stories_rels_parent_idx" ON "news_stories_rels" USING btree ("parent_id");
  CREATE INDEX "news_stories_rels_path_idx" ON "news_stories_rels" USING btree ("path");
  CREATE INDEX "news_stories_rels_news_items_id_idx" ON "news_stories_rels" USING btree ("news_items_id");
  CREATE UNIQUE INDEX "news_editions_date_idx" ON "news_editions" USING btree ("date");
  CREATE INDEX "news_editions_status_idx" ON "news_editions" USING btree ("status");
  CREATE INDEX "news_editions_updated_at_idx" ON "news_editions" USING btree ("updated_at");
  CREATE INDEX "news_editions_created_at_idx" ON "news_editions" USING btree ("created_at");
  CREATE INDEX "news_runs_started_at_idx" ON "news_runs" USING btree ("started_at");
  CREATE INDEX "news_runs_status_idx" ON "news_runs" USING btree ("status");
  CREATE INDEX "news_runs_updated_at_idx" ON "news_runs" USING btree ("updated_at");
  CREATE INDEX "news_runs_created_at_idx" ON "news_runs" USING btree ("created_at");
  CREATE UNIQUE INDEX "news_blocked_url_idx" ON "news_blocked" USING btree ("url");
  CREATE INDEX "news_blocked_updated_at_idx" ON "news_blocked" USING btree ("updated_at");
  CREATE INDEX "news_blocked_created_at_idx" ON "news_blocked" USING btree ("created_at");
  CREATE INDEX "news_settings_disabled_sources_order_idx" ON "news_settings_disabled_sources" USING btree ("order");
  CREATE INDEX "news_settings_disabled_sources_parent_idx" ON "news_settings_disabled_sources" USING btree ("parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_stories_fk" FOREIGN KEY ("news_stories_id") REFERENCES "public"."news_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_editions_fk" FOREIGN KEY ("news_editions_id") REFERENCES "public"."news_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_runs_fk" FOREIGN KEY ("news_runs_id") REFERENCES "public"."news_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_blocked_fk" FOREIGN KEY ("news_blocked_id") REFERENCES "public"."news_blocked"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_news_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("news_stories_id");
  CREATE INDEX "payload_locked_documents_rels_news_editions_id_idx" ON "payload_locked_documents_rels" USING btree ("news_editions_id");
  CREATE INDEX "payload_locked_documents_rels_news_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("news_runs_id");
  CREATE INDEX "payload_locked_documents_rels_news_blocked_id_idx" ON "payload_locked_documents_rels" USING btree ("news_blocked_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_items_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_stories_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_stories_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_stories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_stories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_editions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_runs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_blocked" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_settings_disabled_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "news_items_topics" CASCADE;
  DROP TABLE "news_stories_topics" CASCADE;
  DROP TABLE "news_stories_sources" CASCADE;
  DROP TABLE "news_stories" CASCADE;
  DROP TABLE "news_stories_rels" CASCADE;
  DROP TABLE "news_editions" CASCADE;
  DROP TABLE "news_runs" CASCADE;
  DROP TABLE "news_blocked" CASCADE;
  DROP TABLE "news_settings_disabled_sources" CASCADE;
  DROP TABLE "news_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_stories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_editions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_runs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_blocked_fk";
  
  ALTER TABLE "news_items" ALTER COLUMN "source" SET DATA TYPE text;
  DROP TYPE "public"."enum_news_items_source";
  CREATE TYPE "public"."enum_news_items_source" AS ENUM('revista-ferma', 'agrointel');
  ALTER TABLE "news_items" ALTER COLUMN "source" SET DATA TYPE "public"."enum_news_items_source" USING "source"::"public"."enum_news_items_source";
  ALTER TABLE "outbox" ALTER COLUMN "template" SET DATA TYPE text;
  DROP TYPE "public"."enum_outbox_template";
  CREATE TYPE "public"."enum_outbox_template" AS ENUM('price-alert', 'frost-alert', 'newsletter', 'subscription-confirm', 'editorial-digest');
  ALTER TABLE "outbox" ALTER COLUMN "template" SET DATA TYPE "public"."enum_outbox_template" USING "template"::"public"."enum_outbox_template";
  DROP INDEX "payload_locked_documents_rels_news_stories_id_idx";
  DROP INDEX "payload_locked_documents_rels_news_editions_id_idx";
  DROP INDEX "payload_locked_documents_rels_news_runs_id_idx";
  DROP INDEX "payload_locked_documents_rels_news_blocked_id_idx";
  ALTER TABLE "news_items" DROP COLUMN "lang";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_stories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_editions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_runs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_blocked_id";
  DROP TYPE "public"."enum_news_items_topics";
  DROP TYPE "public"."enum_news_items_lang";
  DROP TYPE "public"."enum_news_stories_topics";
  DROP TYPE "public"."enum_news_stories_sources";
  DROP TYPE "public"."enum_news_stories_topic";
  DROP TYPE "public"."enum_news_stories_lang";
  DROP TYPE "public"."enum_news_stories_status";
  DROP TYPE "public"."enum_news_editions_status";
  DROP TYPE "public"."enum_news_runs_status";
  DROP TYPE "public"."enum_news_settings_disabled_sources";`)
}
