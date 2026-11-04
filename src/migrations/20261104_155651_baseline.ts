import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_pages_blocks_service_grid_items_icon" AS ENUM('silo', 'truck', 'pin', 'leaf', 'scale', 'drop', 'coins', 'clock', 'handshake', 'document', 'phone', 'mail', 'wheat', 'maize', 'sunflower', 'rapeseed', 'barley');
  CREATE TYPE "public"."enum_pages_blocks_service_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_tone" AS ENUM('forest', 'surface');
  CREATE TYPE "public"."enum_pages_blocks_lead_form_extra_fields" AS ENUM('company', 'county', 'base', 'crop');
  CREATE TYPE "public"."enum_pages_blocks_lead_form_lead_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  CREATE TYPE "public"."enum_pages_blocks_callout_tone" AS ENUM('info', 'note', 'warning');
  CREATE TYPE "public"."enum_pages_languages" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_service_grid_items_icon" AS ENUM('silo', 'truck', 'pin', 'leaf', 'scale', 'drop', 'coins', 'clock', 'handshake', 'document', 'phone', 'mail', 'wheat', 'maize', 'sunflower', 'rapeseed', 'barley');
  CREATE TYPE "public"."enum__pages_v_blocks_service_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_tone" AS ENUM('forest', 'surface');
  CREATE TYPE "public"."enum__pages_v_blocks_lead_form_extra_fields" AS ENUM('company', 'county', 'base', 'crop');
  CREATE TYPE "public"."enum__pages_v_blocks_lead_form_lead_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_tone" AS ENUM('info', 'note', 'warning');
  CREATE TYPE "public"."enum__pages_v_version_languages" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_bases_services" AS ENUM('reception', 'drying', 'cleaning', 'weighing', 'storage');
  CREATE TYPE "public"."enum_bases_hours_days" AS ENUM('Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su');
  CREATE TYPE "public"."enum_bases_capacity_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_bases_services_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_bases_location_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_bases_contact_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_bases_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__bases_v_version_services" AS ENUM('reception', 'drying', 'cleaning', 'weighing', 'storage');
  CREATE TYPE "public"."enum__bases_v_version_hours_days" AS ENUM('Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su');
  CREATE TYPE "public"."enum__bases_v_version_capacity_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__bases_v_version_services_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__bases_v_version_location_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__bases_v_version_contact_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__bases_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__bases_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_crops_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__crops_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__crops_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_products_variants_unit" AS ENUM('l', 'ml', 'kg', 'g', 't', 'seeds', 'pieces');
  CREATE TYPE "public"."enum_products_variants_stock" AS ENUM('in-stock', 'on-request', 'out-of-stock');
  CREATE TYPE "public"."enum_products_commerce_status" AS ENUM('pilot', 'live');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('protection', 'seed', 'fertiliser', 'other');
  CREATE TYPE "public"."enum_products_verification_price_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_products_verification_technical_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_products_verification_doses_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_variants_unit" AS ENUM('l', 'ml', 'kg', 'g', 't', 'seeds', 'pieces');
  CREATE TYPE "public"."enum__products_v_version_variants_stock" AS ENUM('in-stock', 'on-request', 'out-of-stock');
  CREATE TYPE "public"."enum__products_v_version_commerce_status" AS ENUM('pilot', 'live');
  CREATE TYPE "public"."enum__products_v_version_product_type" AS ENUM('protection', 'seed', 'fertiliser', 'other');
  CREATE TYPE "public"."enum__products_v_version_verification_price_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__products_v_version_verification_technical_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__products_v_version_verification_doses_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_categories_facets" AS ENUM('crop', 'brand', 'target', 'ingredient', 'formulation', 'stock');
  CREATE TYPE "public"."enum_categories_role" AS ENUM('group', 'category', 'theme');
  CREATE TYPE "public"."enum_categories_icon" AS ENUM('leaf', 'drop', 'silo', 'scale', 'document');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_facets" AS ENUM('crop', 'brand', 'target', 'ingredient', 'formulation', 'stock');
  CREATE TYPE "public"."enum__categories_v_version_role" AS ENUM('group', 'category', 'theme');
  CREATE TYPE "public"."enum__categories_v_version_icon" AS ENUM('leaf', 'drop', 'silo', 'scale', 'document');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_brands_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_active_ingredients_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__active_ingredients_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__active_ingredients_v_published_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_targets_kind" AS ENUM('weed', 'disease', 'pest', 'deficiency');
  CREATE TYPE "public"."enum_leads_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'closed');
  CREATE TYPE "public"."enum_leads_meta_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_media_rights" AS ENUM('owned', 'licensed', 'pending');
  CREATE TYPE "public"."enum_documents_kind" AS ENUM('technical', 'safety', 'label');
  CREATE TYPE "public"."enum_documents_language" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_documents_rights" AS ENUM('owned', 'licensed', 'pending');
  CREATE TYPE "public"."enum_figures_rows_status" AS ENUM('to-confirm', 'conflict', 'confirmed');
  CREATE TYPE "public"."enum_lead_routing_routes_type" AS ENUM('vanzare-cereale', 'depozitare', 'inputuri', 'finantare', 'logistica', 'parteneri', 'cariere', 'general');
  CREATE TABLE "pages_blocks_hero_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"hint" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"accent" varchar,
  	"lead" varchar,
  	"image_id" integer,
  	"video_id" integer,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_figure_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_figure_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"count_up" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_figure_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_service_grid_items_icon",
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "pages_blocks_service_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"columns" "enum_pages_blocks_service_grid_columns" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_finance_band_instalments" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_finance_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_story_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"reverse" boolean DEFAULT false,
  	"body" jsonb,
  	"media_id" integer,
  	"quote" varchar,
  	"person_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_base_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"show_map" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_crop_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"tone" "enum_pages_blocks_cta_band_tone" DEFAULT 'forest',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_lead_form_extra_fields" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_lead_form_extra_fields",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_lead_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"lead_type" "enum_pages_blocks_lead_form_lead_type",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"person_id" integer,
  	"need" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"youtube_id" varchar,
  	"title" varchar,
  	"description" varchar,
  	"poster_id" integer,
  	"upload_date" timestamp(3) with time zone,
  	"duration" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_pages_blocks_callout_tone" DEFAULT 'info',
  	"title" varchar,
  	"body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_pages_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"is_home" boolean DEFAULT false,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"path" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"counties_id" integer,
  	"crops_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"hint" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"accent" varchar,
  	"lead" varchar,
  	"image_id" integer,
  	"video_id" integer,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_figure_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_figure_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"count_up" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_figure_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_service_grid_items_icon",
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"columns" "enum__pages_v_blocks_service_grid_columns" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_finance_band_instalments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_finance_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_story_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"reverse" boolean DEFAULT false,
  	"body" jsonb,
  	"media_id" integer,
  	"quote" varchar,
  	"person_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_base_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"show_map" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_crop_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"tone" "enum__pages_v_blocks_cta_band_tone" DEFAULT 'forest',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lead_form_extra_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_lead_form_extra_fields",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_lead_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"lead_type" "enum__pages_v_blocks_lead_form_lead_type",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer,
  	"need" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"youtube_id" varchar,
  	"title" varchar,
  	"description" varchar,
  	"poster_id" integer,
  	"upload_date" timestamp(3) with time zone,
  	"duration" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tone" "enum__pages_v_blocks_callout_tone" DEFAULT 'info',
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_version_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_is_home" boolean DEFAULT false,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"counties_id" integer,
  	"crops_id" integer
  );
  
  CREATE TABLE "bases_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_bases_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "bases_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_bases_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "bases_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar,
  	"closes" varchar
  );
  
  CREATE TABLE "bases_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "bases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"capacity" numeric,
  	"capacity_status" "enum_bases_capacity_status" DEFAULT 'to-confirm',
  	"services_status" "enum_bases_services_status" DEFAULT 'to-confirm',
  	"county_id" integer,
  	"location_status" "enum_bases_location_status" DEFAULT 'to-confirm',
  	"address_street" varchar,
  	"address_locality" varchar,
  	"address_postal_code" varchar,
  	"geo_lat" numeric,
  	"geo_lng" numeric,
  	"phone" varchar,
  	"contact_id" integer,
  	"contact_status" "enum_bases_contact_status" DEFAULT 'to-confirm',
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_bases_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "bases_locales" (
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "bases_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_bases_v_version_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__bases_v_version_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_bases_v_version_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__bases_v_version_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_bases_v_version_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar,
  	"closes" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_bases_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_bases_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_capacity" numeric,
  	"version_capacity_status" "enum__bases_v_version_capacity_status" DEFAULT 'to-confirm',
  	"version_services_status" "enum__bases_v_version_services_status" DEFAULT 'to-confirm',
  	"version_county_id" integer,
  	"version_location_status" "enum__bases_v_version_location_status" DEFAULT 'to-confirm',
  	"version_address_street" varchar,
  	"version_address_locality" varchar,
  	"version_address_postal_code" varchar,
  	"version_geo_lat" numeric,
  	"version_geo_lng" numeric,
  	"version_phone" varchar,
  	"version_contact_id" integer,
  	"version_contact_status" "enum__bases_v_version_contact_status" DEFAULT 'to-confirm',
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__bases_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__bases_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_bases_v_locales" (
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_bases_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "counties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"centroid_lat" numeric,
  	"centroid_lng" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "crops_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "crops" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"is_grain" boolean DEFAULT false,
  	"quality_moisture" numeric,
  	"quality_impurities" numeric,
  	"quality_hectolitre" numeric,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"shop_indexable" boolean DEFAULT false,
  	"shop_seo_image_id" integer,
  	"shop_seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_crops_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "crops_locales" (
  	"name" varchar,
  	"intro" varchar,
  	"quality_notes" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"shop_intro" varchar,
  	"shop_seo_title" varchar,
  	"shop_seo_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_crops_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_crops_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_is_grain" boolean DEFAULT false,
  	"version_quality_moisture" numeric,
  	"version_quality_impurities" numeric,
  	"version_quality_hectolitre" numeric,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_shop_indexable" boolean DEFAULT false,
  	"version_shop_seo_image_id" integer,
  	"version_shop_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__crops_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__crops_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_crops_v_locales" (
  	"version_name" varchar,
  	"version_intro" varchar,
  	"version_quality_notes" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_shop_intro" varchar,
  	"version_shop_seo_title" varchar,
  	"version_shop_seo_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar,
  	"size" numeric,
  	"unit" "enum_products_variants_unit",
  	"price" numeric,
  	"vat_rate" numeric,
  	"stock" "enum_products_variants_stock" DEFAULT 'in-stock',
  	"unit_price" numeric
  );
  
  CREATE TABLE "product_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"concentration" numeric,
  	"unit" varchar
  );
  
  CREATE TABLE "products_protection_doses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"crop_id" integer,
  	"bbch" varchar,
  	"dose_min" numeric,
  	"dose_max" numeric,
  	"dose_unit" varchar,
  	"water_volume" varchar,
  	"max_treatments" numeric,
  	"waiting_period" numeric
  );
  
  CREATE TABLE "products_protection_doses_locales" (
  	"notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_fertiliser_nutrients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nutrient" varchar,
  	"percent" numeric
  );
  
  CREATE TABLE "products_fertiliser_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"crop_id" integer,
  	"rate_min" numeric,
  	"rate_max" numeric,
  	"rate_unit" varchar
  );
  
  CREATE TABLE "products_fertiliser_rates_locales" (
  	"timing" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"commerce_status" "enum_products_commerce_status" DEFAULT 'pilot',
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"product_type" "enum_products_product_type",
  	"primary_category_id" integer,
  	"brand_id" integer,
  	"protection_formulation" varchar,
  	"protection_registration_number" varchar,
  	"protection_registration_valid_until" timestamp(3) with time zone,
  	"protection_resistance_group" varchar,
  	"protection_toxicity_class" varchar,
  	"protection_professional_use" boolean DEFAULT true,
  	"seed_variety" varchar,
  	"seed_fao_group" varchar,
  	"fertiliser_granule_size" varchar,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"verification_price_status" "enum_products_verification_price_status" DEFAULT 'to-confirm',
  	"verification_price_source" varchar,
  	"verification_technical_status" "enum_products_verification_technical_status" DEFAULT 'to-confirm',
  	"verification_technical_source" varchar,
  	"verification_doses_status" "enum_products_verification_doses_status" DEFAULT 'to-confirm',
  	"verification_doses_source" varchar,
  	"source_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"name" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"protection_mode_of_action" varchar,
  	"protection_safety" varchar,
  	"protection_compatibility" varchar,
  	"seed_species" varchar,
  	"seed_maturity" varchar,
  	"seed_sowing_density" varchar,
  	"seed_sowing_rate" varchar,
  	"seed_yield_potential" varchar,
  	"seed_resistances" varchar,
  	"seed_recommended_zones" varchar,
  	"seed_seed_treatment" varchar,
  	"fertiliser_form" varchar,
  	"fertiliser_storage" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"crops_id" integer,
  	"targets_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar,
  	"size" numeric,
  	"unit" "enum__products_v_version_variants_unit",
  	"price" numeric,
  	"vat_rate" numeric,
  	"stock" "enum__products_v_version_variants_stock" DEFAULT 'in-stock',
  	"unit_price" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_ingredients_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingredient_id" integer,
  	"concentration" numeric,
  	"unit" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_protection_doses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"crop_id" integer,
  	"bbch" varchar,
  	"dose_min" numeric,
  	"dose_max" numeric,
  	"dose_unit" varchar,
  	"water_volume" varchar,
  	"max_treatments" numeric,
  	"waiting_period" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_protection_doses_locales" (
  	"notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_fertiliser_nutrients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nutrient" varchar,
  	"percent" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_fertiliser_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"crop_id" integer,
  	"rate_min" numeric,
  	"rate_max" numeric,
  	"rate_unit" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_fertiliser_rates_locales" (
  	"timing" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_commerce_status" "enum__products_v_version_commerce_status" DEFAULT 'pilot',
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_product_type" "enum__products_v_version_product_type",
  	"version_primary_category_id" integer,
  	"version_brand_id" integer,
  	"version_protection_formulation" varchar,
  	"version_protection_registration_number" varchar,
  	"version_protection_registration_valid_until" timestamp(3) with time zone,
  	"version_protection_resistance_group" varchar,
  	"version_protection_toxicity_class" varchar,
  	"version_protection_professional_use" boolean DEFAULT true,
  	"version_seed_variety" varchar,
  	"version_seed_fao_group" varchar,
  	"version_fertiliser_granule_size" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_verification_price_status" "enum__products_v_version_verification_price_status" DEFAULT 'to-confirm',
  	"version_verification_price_source" varchar,
  	"version_verification_technical_status" "enum__products_v_version_verification_technical_status" DEFAULT 'to-confirm',
  	"version_verification_technical_source" varchar,
  	"version_verification_doses_status" "enum__products_v_version_verification_doses_status" DEFAULT 'to-confirm',
  	"version_verification_doses_source" varchar,
  	"version_source_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_name" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_protection_mode_of_action" varchar,
  	"version_protection_safety" varchar,
  	"version_protection_compatibility" varchar,
  	"version_seed_species" varchar,
  	"version_seed_maturity" varchar,
  	"version_seed_sowing_density" varchar,
  	"version_seed_sowing_rate" varchar,
  	"version_seed_yield_potential" varchar,
  	"version_seed_resistances" varchar,
  	"version_seed_recommended_zones" varchar,
  	"version_seed_seed_treatment" varchar,
  	"version_fertiliser_form" varchar,
  	"version_fertiliser_storage" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"crops_id" integer,
  	"targets_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "categories_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "categories_facets" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_categories_facets",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_categories_role" DEFAULT 'category',
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"icon" "enum_categories_icon",
  	"indexable" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"buying_advice" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_categories_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_categories_v_version_facets" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__categories_v_version_facets",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_role" "enum__categories_v_version_role" DEFAULT 'category',
  	"version_parent_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_icon" "enum__categories_v_version_icon",
  	"version_indexable" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_categories_v_locales" (
  	"version_name" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_buying_advice" jsonb,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_categories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "brands_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"website" varchar,
  	"indexable" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_brands_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "brands_locales" (
  	"country" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "brands_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_brands_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_logo_id" integer,
  	"version_website" varchar,
  	"version_indexable" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__brands_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__brands_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_brands_v_locales" (
  	"version_country" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_brands_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "active_ingredients_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "active_ingredients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"resistance_group" varchar,
  	"indexable" boolean DEFAULT false,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_active_ingredients_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "active_ingredients_locales" (
  	"name" varchar,
  	"chemical_group" varchar,
  	"intro" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "active_ingredients_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_active_ingredients_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_active_ingredients_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_resistance_group" varchar,
  	"version_indexable" boolean DEFAULT false,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__active_ingredients_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__active_ingredients_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_active_ingredients_v_locales" (
  	"version_name" varchar,
  	"version_chemical_group" varchar,
  	"version_intro" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_active_ingredients_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "targets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_targets_kind" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "targets_locales" (
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "targets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"crops_id" integer
  );
  
  CREATE TABLE "price_history" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"sku" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people_author_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"phone" varchar,
  	"publish_phone" boolean DEFAULT false,
  	"email" varchar,
  	"publish_email" boolean DEFAULT false,
  	"is_author" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people_locales" (
  	"role" varchar,
  	"author_bio" varchar,
  	"author_credentials" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_leads_type" NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"cui" varchar,
  	"county_id" integer,
  	"base_id" integer,
  	"crop_id" integer,
  	"message" varchar,
  	"meta_locale" "enum_leads_meta_locale",
  	"meta_source_path" varchar,
  	"meta_consent_version" varchar,
  	"meta_utm_source" varchar,
  	"meta_utm_medium" varchar,
  	"meta_utm_campaign" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"rights" "enum_media_rights" DEFAULT 'owned' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_documents_kind" NOT NULL,
  	"language" "enum_documents_language" DEFAULT 'ro' NOT NULL,
  	"version" varchar,
  	"source" varchar,
  	"rights" "enum_documents_rights" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"bases_id" integer,
  	"counties_id" integer,
  	"crops_id" integer,
  	"products_id" integer,
  	"categories_id" integer,
  	"brands_id" integer,
  	"active_ingredients_id" integer,
  	"targets_id" integer,
  	"price_history_id" integer,
  	"people_id" integer,
  	"leads_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "figures_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"status" "enum_figures_rows_status" DEFAULT 'to-confirm' NOT NULL,
  	"number" numeric,
  	"source" varchar,
  	"confirmed_by" varchar,
  	"confirmed_at" timestamp(3) with time zone,
  	"note" varchar
  );
  
  CREATE TABLE "figures_rows_locales" (
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"unit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "figures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL,
  	"blurb" varchar
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_locales" (
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"legal" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "seo_defaults_organization_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Agrinvest' NOT NULL,
  	"title_template" varchar DEFAULT '%s · Agrinvest' NOT NULL,
  	"og_image_id" integer,
  	"organization_legal_name" varchar DEFAULT 'Agrinvest SRL',
  	"organization_ifn_legal_name" varchar DEFAULT 'Agrinvest Credit IFN SA',
  	"verification_google" varchar,
  	"verification_bing" varchar,
  	"analytics_ga4" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "lead_routing_routes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_lead_routing_routes_type" NOT NULL,
  	"primary_id" integer NOT NULL,
  	"fallback_id" integer
  );
  
  CREATE TABLE "lead_routing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_hero_needs" ADD CONSTRAINT "pages_blocks_hero_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_figure_strip_items" ADD CONSTRAINT "pages_blocks_figure_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_figure_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_figure_strip" ADD CONSTRAINT "pages_blocks_figure_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_figure_table" ADD CONSTRAINT "pages_blocks_figure_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_grid_items" ADD CONSTRAINT "pages_blocks_service_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_grid" ADD CONSTRAINT "pages_blocks_service_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_finance_band_instalments" ADD CONSTRAINT "pages_blocks_finance_band_instalments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_finance_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_finance_band" ADD CONSTRAINT "pages_blocks_finance_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_section" ADD CONSTRAINT "pages_blocks_story_section_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_section" ADD CONSTRAINT "pages_blocks_story_section_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_section" ADD CONSTRAINT "pages_blocks_story_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_base_list" ADD CONSTRAINT "pages_blocks_base_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_crop_list" ADD CONSTRAINT "pages_blocks_crop_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lead_form_extra_fields" ADD CONSTRAINT "pages_blocks_lead_form_extra_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_lead_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lead_form" ADD CONSTRAINT "pages_blocks_lead_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_cards_cards" ADD CONSTRAINT "pages_blocks_contact_cards_cards_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_cards_cards" ADD CONSTRAINT "pages_blocks_contact_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_cards" ADD CONSTRAINT "pages_blocks_contact_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_embed" ADD CONSTRAINT "pages_blocks_video_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_embed" ADD CONSTRAINT "pages_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faq" ADD CONSTRAINT "pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_languages" ADD CONSTRAINT "pages_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_counties_fk" FOREIGN KEY ("counties_id") REFERENCES "public"."counties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_needs" ADD CONSTRAINT "_pages_v_blocks_hero_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_figure_strip_items" ADD CONSTRAINT "_pages_v_blocks_figure_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_figure_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_figure_strip" ADD CONSTRAINT "_pages_v_blocks_figure_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_figure_table" ADD CONSTRAINT "_pages_v_blocks_figure_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_grid_items" ADD CONSTRAINT "_pages_v_blocks_service_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_grid" ADD CONSTRAINT "_pages_v_blocks_service_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_finance_band_instalments" ADD CONSTRAINT "_pages_v_blocks_finance_band_instalments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_finance_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_finance_band" ADD CONSTRAINT "_pages_v_blocks_finance_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_section" ADD CONSTRAINT "_pages_v_blocks_story_section_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_section" ADD CONSTRAINT "_pages_v_blocks_story_section_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_section" ADD CONSTRAINT "_pages_v_blocks_story_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_base_list" ADD CONSTRAINT "_pages_v_blocks_base_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_crop_list" ADD CONSTRAINT "_pages_v_blocks_crop_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lead_form_extra_fields" ADD CONSTRAINT "_pages_v_blocks_lead_form_extra_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_lead_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lead_form" ADD CONSTRAINT "_pages_v_blocks_lead_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_cards_cards" ADD CONSTRAINT "_pages_v_blocks_contact_cards_cards_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_cards_cards" ADD CONSTRAINT "_pages_v_blocks_contact_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_cards" ADD CONSTRAINT "_pages_v_blocks_contact_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_embed" ADD CONSTRAINT "_pages_v_blocks_video_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_embed" ADD CONSTRAINT "_pages_v_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_faq" ADD CONSTRAINT "_pages_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_languages" ADD CONSTRAINT "_pages_v_version_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_counties_fk" FOREIGN KEY ("counties_id") REFERENCES "public"."counties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases_services" ADD CONSTRAINT "bases_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases_hours_days" ADD CONSTRAINT "bases_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bases_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases_hours" ADD CONSTRAINT "bases_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases_faq" ADD CONSTRAINT "bases_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases" ADD CONSTRAINT "bases_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bases" ADD CONSTRAINT "bases_contact_id_people_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bases" ADD CONSTRAINT "bases_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bases_locales" ADD CONSTRAINT "bases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases_rels" ADD CONSTRAINT "bases_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bases_rels" ADD CONSTRAINT "bases_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v_version_services" ADD CONSTRAINT "_bases_v_version_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_bases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v_version_hours_days" ADD CONSTRAINT "_bases_v_version_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_bases_v_version_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v_version_hours" ADD CONSTRAINT "_bases_v_version_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_bases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v_version_faq" ADD CONSTRAINT "_bases_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_bases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v" ADD CONSTRAINT "_bases_v_parent_id_bases_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bases_v" ADD CONSTRAINT "_bases_v_version_county_id_counties_id_fk" FOREIGN KEY ("version_county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bases_v" ADD CONSTRAINT "_bases_v_version_contact_id_people_id_fk" FOREIGN KEY ("version_contact_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bases_v" ADD CONSTRAINT "_bases_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bases_v_locales" ADD CONSTRAINT "_bases_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_bases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v_rels" ADD CONSTRAINT "_bases_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_bases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bases_v_rels" ADD CONSTRAINT "_bases_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "crops_faq" ADD CONSTRAINT "crops_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "crops" ADD CONSTRAINT "crops_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crops" ADD CONSTRAINT "crops_shop_seo_image_id_media_id_fk" FOREIGN KEY ("shop_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crops_locales" ADD CONSTRAINT "crops_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_crops_v_version_faq" ADD CONSTRAINT "_crops_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_crops_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_crops_v" ADD CONSTRAINT "_crops_v_parent_id_crops_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_crops_v" ADD CONSTRAINT "_crops_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_crops_v" ADD CONSTRAINT "_crops_v_version_shop_seo_image_id_media_id_fk" FOREIGN KEY ("version_shop_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_crops_v_locales" ADD CONSTRAINT "_crops_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_crops_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_ingredient_id_active_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."active_ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_protection_doses" ADD CONSTRAINT "products_protection_doses_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_protection_doses" ADD CONSTRAINT "products_protection_doses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_protection_doses_locales" ADD CONSTRAINT "products_protection_doses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_protection_doses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_fertiliser_nutrients" ADD CONSTRAINT "products_fertiliser_nutrients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_fertiliser_rates" ADD CONSTRAINT "products_fertiliser_rates_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_fertiliser_rates" ADD CONSTRAINT "products_fertiliser_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_fertiliser_rates_locales" ADD CONSTRAINT "products_fertiliser_rates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_fertiliser_rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_targets_fk" FOREIGN KEY ("targets_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_ingredients_v" ADD CONSTRAINT "_product_ingredients_v_ingredient_id_active_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."active_ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_ingredients_v" ADD CONSTRAINT "_product_ingredients_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_protection_doses" ADD CONSTRAINT "_products_v_version_protection_doses_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_protection_doses" ADD CONSTRAINT "_products_v_version_protection_doses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_protection_doses_locales" ADD CONSTRAINT "_products_v_version_protection_doses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_protection_doses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_fertiliser_nutrients" ADD CONSTRAINT "_products_v_version_fertiliser_nutrients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_fertiliser_rates" ADD CONSTRAINT "_products_v_version_fertiliser_rates_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_fertiliser_rates" ADD CONSTRAINT "_products_v_version_fertiliser_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_fertiliser_rates_locales" ADD CONSTRAINT "_products_v_version_fertiliser_rates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_fertiliser_rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_primary_category_id_categories_id_fk" FOREIGN KEY ("version_primary_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_targets_fk" FOREIGN KEY ("targets_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_faq" ADD CONSTRAINT "categories_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_facets" ADD CONSTRAINT "categories_facets_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_version_faq" ADD CONSTRAINT "_categories_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_version_facets" ADD CONSTRAINT "_categories_v_version_facets_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_parent_id_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_faq" ADD CONSTRAINT "brands_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands_locales" ADD CONSTRAINT "brands_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_rels" ADD CONSTRAINT "brands_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_rels" ADD CONSTRAINT "brands_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brands_v_version_faq" ADD CONSTRAINT "_brands_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_brands_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v_locales" ADD CONSTRAINT "_brands_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_brands_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brands_v_rels" ADD CONSTRAINT "_brands_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_brands_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brands_v_rels" ADD CONSTRAINT "_brands_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_ingredients_faq" ADD CONSTRAINT "active_ingredients_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."active_ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_ingredients" ADD CONSTRAINT "active_ingredients_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "active_ingredients_locales" ADD CONSTRAINT "active_ingredients_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."active_ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_ingredients_rels" ADD CONSTRAINT "active_ingredients_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."active_ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_ingredients_rels" ADD CONSTRAINT "active_ingredients_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_active_ingredients_v_version_faq" ADD CONSTRAINT "_active_ingredients_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_active_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_active_ingredients_v" ADD CONSTRAINT "_active_ingredients_v_parent_id_active_ingredients_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."active_ingredients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_active_ingredients_v" ADD CONSTRAINT "_active_ingredients_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_active_ingredients_v_locales" ADD CONSTRAINT "_active_ingredients_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_active_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_active_ingredients_v_rels" ADD CONSTRAINT "_active_ingredients_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_active_ingredients_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_active_ingredients_v_rels" ADD CONSTRAINT "_active_ingredients_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "targets_locales" ADD CONSTRAINT "targets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "targets_rels" ADD CONSTRAINT "targets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "targets_rels" ADD CONSTRAINT "targets_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_author_same_as" ADD CONSTRAINT "people_author_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_people_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bases_fk" FOREIGN KEY ("bases_id") REFERENCES "public"."bases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_counties_fk" FOREIGN KEY ("counties_id") REFERENCES "public"."counties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_crops_fk" FOREIGN KEY ("crops_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_active_ingredients_fk" FOREIGN KEY ("active_ingredients_id") REFERENCES "public"."active_ingredients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_targets_fk" FOREIGN KEY ("targets_id") REFERENCES "public"."targets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_price_history_fk" FOREIGN KEY ("price_history_id") REFERENCES "public"."price_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "figures_rows" ADD CONSTRAINT "figures_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "figures_rows_locales" ADD CONSTRAINT "figures_rows_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."figures_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults_organization_same_as" ADD CONSTRAINT "seo_defaults_organization_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_defaults_locales" ADD CONSTRAINT "seo_defaults_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lead_routing_routes" ADD CONSTRAINT "lead_routing_routes_primary_id_people_id_fk" FOREIGN KEY ("primary_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lead_routing_routes" ADD CONSTRAINT "lead_routing_routes_fallback_id_people_id_fk" FOREIGN KEY ("fallback_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lead_routing_routes" ADD CONSTRAINT "lead_routing_routes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lead_routing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_needs_order_idx" ON "pages_blocks_hero_needs" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_needs_parent_id_idx" ON "pages_blocks_hero_needs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_needs_locale_idx" ON "pages_blocks_hero_needs" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_video_idx" ON "pages_blocks_hero" USING btree ("video_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_figure_strip_items_order_idx" ON "pages_blocks_figure_strip_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_figure_strip_items_parent_id_idx" ON "pages_blocks_figure_strip_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_figure_strip_items_locale_idx" ON "pages_blocks_figure_strip_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_figure_strip_order_idx" ON "pages_blocks_figure_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_figure_strip_parent_id_idx" ON "pages_blocks_figure_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_figure_strip_path_idx" ON "pages_blocks_figure_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_figure_strip_locale_idx" ON "pages_blocks_figure_strip" USING btree ("_locale");
  CREATE INDEX "pages_blocks_figure_table_order_idx" ON "pages_blocks_figure_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_figure_table_parent_id_idx" ON "pages_blocks_figure_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_figure_table_path_idx" ON "pages_blocks_figure_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_figure_table_locale_idx" ON "pages_blocks_figure_table" USING btree ("_locale");
  CREATE INDEX "pages_blocks_service_grid_items_order_idx" ON "pages_blocks_service_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_grid_items_parent_id_idx" ON "pages_blocks_service_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_grid_items_locale_idx" ON "pages_blocks_service_grid_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_service_grid_order_idx" ON "pages_blocks_service_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_grid_parent_id_idx" ON "pages_blocks_service_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_grid_path_idx" ON "pages_blocks_service_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_grid_locale_idx" ON "pages_blocks_service_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_items_locale_idx" ON "pages_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_locale_idx" ON "pages_blocks_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_finance_band_instalments_order_idx" ON "pages_blocks_finance_band_instalments" USING btree ("_order");
  CREATE INDEX "pages_blocks_finance_band_instalments_parent_id_idx" ON "pages_blocks_finance_band_instalments" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_finance_band_instalments_locale_idx" ON "pages_blocks_finance_band_instalments" USING btree ("_locale");
  CREATE INDEX "pages_blocks_finance_band_order_idx" ON "pages_blocks_finance_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_finance_band_parent_id_idx" ON "pages_blocks_finance_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_finance_band_path_idx" ON "pages_blocks_finance_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_finance_band_locale_idx" ON "pages_blocks_finance_band" USING btree ("_locale");
  CREATE INDEX "pages_blocks_story_section_order_idx" ON "pages_blocks_story_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_section_parent_id_idx" ON "pages_blocks_story_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_section_path_idx" ON "pages_blocks_story_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_story_section_locale_idx" ON "pages_blocks_story_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_story_section_media_idx" ON "pages_blocks_story_section" USING btree ("media_id");
  CREATE INDEX "pages_blocks_story_section_person_idx" ON "pages_blocks_story_section" USING btree ("person_id");
  CREATE INDEX "pages_blocks_base_list_order_idx" ON "pages_blocks_base_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_base_list_parent_id_idx" ON "pages_blocks_base_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_base_list_path_idx" ON "pages_blocks_base_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_base_list_locale_idx" ON "pages_blocks_base_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_crop_list_order_idx" ON "pages_blocks_crop_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_crop_list_parent_id_idx" ON "pages_blocks_crop_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_crop_list_path_idx" ON "pages_blocks_crop_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_crop_list_locale_idx" ON "pages_blocks_crop_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_band_locale_idx" ON "pages_blocks_cta_band" USING btree ("_locale");
  CREATE INDEX "pages_blocks_lead_form_extra_fields_order_idx" ON "pages_blocks_lead_form_extra_fields" USING btree ("order");
  CREATE INDEX "pages_blocks_lead_form_extra_fields_parent_idx" ON "pages_blocks_lead_form_extra_fields" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_lead_form_extra_fields_locale_idx" ON "pages_blocks_lead_form_extra_fields" USING btree ("locale");
  CREATE INDEX "pages_blocks_lead_form_order_idx" ON "pages_blocks_lead_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_lead_form_parent_id_idx" ON "pages_blocks_lead_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lead_form_path_idx" ON "pages_blocks_lead_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_lead_form_locale_idx" ON "pages_blocks_lead_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_cards_cards_order_idx" ON "pages_blocks_contact_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_cards_cards_parent_id_idx" ON "pages_blocks_contact_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_cards_cards_locale_idx" ON "pages_blocks_contact_cards_cards" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_cards_cards_person_idx" ON "pages_blocks_contact_cards_cards" USING btree ("person_id");
  CREATE INDEX "pages_blocks_contact_cards_order_idx" ON "pages_blocks_contact_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_cards_parent_id_idx" ON "pages_blocks_contact_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_cards_path_idx" ON "pages_blocks_contact_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_cards_locale_idx" ON "pages_blocks_contact_cards" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_embed_order_idx" ON "pages_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_embed_parent_id_idx" ON "pages_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_embed_path_idx" ON "pages_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_embed_locale_idx" ON "pages_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_embed_poster_idx" ON "pages_blocks_video_embed" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_locale_idx" ON "pages_blocks_callout" USING btree ("_locale");
  CREATE INDEX "pages_faq_order_idx" ON "pages_faq" USING btree ("_order");
  CREATE INDEX "pages_faq_parent_id_idx" ON "pages_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_locale_idx" ON "pages_faq" USING btree ("_locale");
  CREATE INDEX "pages_languages_order_idx" ON "pages_languages" USING btree ("order");
  CREATE INDEX "pages_languages_parent_idx" ON "pages_languages" USING btree ("parent_id");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE INDEX "pages_path_idx" ON "pages_locales" USING btree ("path","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "pages_texts_locale_parent" ON "pages_texts" USING btree ("locale","parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "pages_rels_counties_id_idx" ON "pages_rels" USING btree ("counties_id","locale");
  CREATE INDEX "pages_rels_crops_id_idx" ON "pages_rels" USING btree ("crops_id","locale");
  CREATE INDEX "_pages_v_blocks_hero_needs_order_idx" ON "_pages_v_blocks_hero_needs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_needs_parent_id_idx" ON "_pages_v_blocks_hero_needs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_needs_locale_idx" ON "_pages_v_blocks_hero_needs" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_video_idx" ON "_pages_v_blocks_hero" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_figure_strip_items_order_idx" ON "_pages_v_blocks_figure_strip_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_figure_strip_items_parent_id_idx" ON "_pages_v_blocks_figure_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_figure_strip_items_locale_idx" ON "_pages_v_blocks_figure_strip_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_figure_strip_order_idx" ON "_pages_v_blocks_figure_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_figure_strip_parent_id_idx" ON "_pages_v_blocks_figure_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_figure_strip_path_idx" ON "_pages_v_blocks_figure_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_figure_strip_locale_idx" ON "_pages_v_blocks_figure_strip" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_figure_table_order_idx" ON "_pages_v_blocks_figure_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_figure_table_parent_id_idx" ON "_pages_v_blocks_figure_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_figure_table_path_idx" ON "_pages_v_blocks_figure_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_figure_table_locale_idx" ON "_pages_v_blocks_figure_table" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_service_grid_items_order_idx" ON "_pages_v_blocks_service_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_grid_items_parent_id_idx" ON "_pages_v_blocks_service_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_grid_items_locale_idx" ON "_pages_v_blocks_service_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_service_grid_order_idx" ON "_pages_v_blocks_service_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_grid_parent_id_idx" ON "_pages_v_blocks_service_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_grid_path_idx" ON "_pages_v_blocks_service_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_grid_locale_idx" ON "_pages_v_blocks_service_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_items_locale_idx" ON "_pages_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_locale_idx" ON "_pages_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_finance_band_instalments_order_idx" ON "_pages_v_blocks_finance_band_instalments" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_finance_band_instalments_parent_id_idx" ON "_pages_v_blocks_finance_band_instalments" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_finance_band_instalments_locale_idx" ON "_pages_v_blocks_finance_band_instalments" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_finance_band_order_idx" ON "_pages_v_blocks_finance_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_finance_band_parent_id_idx" ON "_pages_v_blocks_finance_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_finance_band_path_idx" ON "_pages_v_blocks_finance_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_finance_band_locale_idx" ON "_pages_v_blocks_finance_band" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_story_section_order_idx" ON "_pages_v_blocks_story_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_section_parent_id_idx" ON "_pages_v_blocks_story_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_section_path_idx" ON "_pages_v_blocks_story_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_story_section_locale_idx" ON "_pages_v_blocks_story_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_story_section_media_idx" ON "_pages_v_blocks_story_section" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_story_section_person_idx" ON "_pages_v_blocks_story_section" USING btree ("person_id");
  CREATE INDEX "_pages_v_blocks_base_list_order_idx" ON "_pages_v_blocks_base_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_base_list_parent_id_idx" ON "_pages_v_blocks_base_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_base_list_path_idx" ON "_pages_v_blocks_base_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_base_list_locale_idx" ON "_pages_v_blocks_base_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_crop_list_order_idx" ON "_pages_v_blocks_crop_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_crop_list_parent_id_idx" ON "_pages_v_blocks_crop_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_crop_list_path_idx" ON "_pages_v_blocks_crop_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_crop_list_locale_idx" ON "_pages_v_blocks_crop_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_band_order_idx" ON "_pages_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_parent_id_idx" ON "_pages_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_path_idx" ON "_pages_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_band_locale_idx" ON "_pages_v_blocks_cta_band" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_lead_form_extra_fields_order_idx" ON "_pages_v_blocks_lead_form_extra_fields" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_lead_form_extra_fields_parent_idx" ON "_pages_v_blocks_lead_form_extra_fields" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_lead_form_extra_fields_locale_idx" ON "_pages_v_blocks_lead_form_extra_fields" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_lead_form_order_idx" ON "_pages_v_blocks_lead_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lead_form_parent_id_idx" ON "_pages_v_blocks_lead_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lead_form_path_idx" ON "_pages_v_blocks_lead_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lead_form_locale_idx" ON "_pages_v_blocks_lead_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_cards_cards_order_idx" ON "_pages_v_blocks_contact_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_cards_cards_parent_id_idx" ON "_pages_v_blocks_contact_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_cards_cards_locale_idx" ON "_pages_v_blocks_contact_cards_cards" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_cards_cards_person_idx" ON "_pages_v_blocks_contact_cards_cards" USING btree ("person_id");
  CREATE INDEX "_pages_v_blocks_contact_cards_order_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_cards_parent_id_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_cards_path_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_cards_locale_idx" ON "_pages_v_blocks_contact_cards" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_embed_order_idx" ON "_pages_v_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_embed_parent_id_idx" ON "_pages_v_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_embed_path_idx" ON "_pages_v_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_embed_locale_idx" ON "_pages_v_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_embed_poster_idx" ON "_pages_v_blocks_video_embed" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_locale_idx" ON "_pages_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_faq_order_idx" ON "_pages_v_version_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_version_faq_parent_id_idx" ON "_pages_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_faq_locale_idx" ON "_pages_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_languages_order_idx" ON "_pages_v_version_languages" USING btree ("order");
  CREATE INDEX "_pages_v_version_languages_parent_idx" ON "_pages_v_version_languages" USING btree ("parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v_locales" USING btree ("version_path","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_texts_locale_parent" ON "_pages_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_rels_counties_id_idx" ON "_pages_v_rels" USING btree ("counties_id","locale");
  CREATE INDEX "_pages_v_rels_crops_id_idx" ON "_pages_v_rels" USING btree ("crops_id","locale");
  CREATE INDEX "bases_services_order_idx" ON "bases_services" USING btree ("order");
  CREATE INDEX "bases_services_parent_idx" ON "bases_services" USING btree ("parent_id");
  CREATE INDEX "bases_hours_days_order_idx" ON "bases_hours_days" USING btree ("order");
  CREATE INDEX "bases_hours_days_parent_idx" ON "bases_hours_days" USING btree ("parent_id");
  CREATE INDEX "bases_hours_order_idx" ON "bases_hours" USING btree ("_order");
  CREATE INDEX "bases_hours_parent_id_idx" ON "bases_hours" USING btree ("_parent_id");
  CREATE INDEX "bases_faq_order_idx" ON "bases_faq" USING btree ("_order");
  CREATE INDEX "bases_faq_parent_id_idx" ON "bases_faq" USING btree ("_parent_id");
  CREATE INDEX "bases_faq_locale_idx" ON "bases_faq" USING btree ("_locale");
  CREATE INDEX "bases_county_idx" ON "bases" USING btree ("county_id");
  CREATE INDEX "bases_contact_idx" ON "bases" USING btree ("contact_id");
  CREATE INDEX "bases_seo_seo_image_idx" ON "bases" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "bases_slug_idx" ON "bases" USING btree ("slug");
  CREATE INDEX "bases_updated_at_idx" ON "bases" USING btree ("updated_at");
  CREATE INDEX "bases_created_at_idx" ON "bases" USING btree ("created_at");
  CREATE INDEX "bases__status_idx" ON "bases" USING btree ("_status");
  CREATE UNIQUE INDEX "bases_locales_locale_parent_id_unique" ON "bases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "bases_locales_parent_id_idx" ON "bases_locales" USING btree ("_parent_id");
  CREATE INDEX "bases_rels_order_idx" ON "bases_rels" USING btree ("order");
  CREATE INDEX "bases_rels_parent_idx" ON "bases_rels" USING btree ("parent_id");
  CREATE INDEX "bases_rels_path_idx" ON "bases_rels" USING btree ("path");
  CREATE INDEX "bases_rels_media_id_idx" ON "bases_rels" USING btree ("media_id");
  CREATE INDEX "_bases_v_version_services_order_idx" ON "_bases_v_version_services" USING btree ("order");
  CREATE INDEX "_bases_v_version_services_parent_idx" ON "_bases_v_version_services" USING btree ("parent_id");
  CREATE INDEX "_bases_v_version_hours_days_order_idx" ON "_bases_v_version_hours_days" USING btree ("order");
  CREATE INDEX "_bases_v_version_hours_days_parent_idx" ON "_bases_v_version_hours_days" USING btree ("parent_id");
  CREATE INDEX "_bases_v_version_hours_order_idx" ON "_bases_v_version_hours" USING btree ("_order");
  CREATE INDEX "_bases_v_version_hours_parent_id_idx" ON "_bases_v_version_hours" USING btree ("_parent_id");
  CREATE INDEX "_bases_v_version_faq_order_idx" ON "_bases_v_version_faq" USING btree ("_order");
  CREATE INDEX "_bases_v_version_faq_parent_id_idx" ON "_bases_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_bases_v_version_faq_locale_idx" ON "_bases_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_bases_v_parent_idx" ON "_bases_v" USING btree ("parent_id");
  CREATE INDEX "_bases_v_version_version_county_idx" ON "_bases_v" USING btree ("version_county_id");
  CREATE INDEX "_bases_v_version_version_contact_idx" ON "_bases_v" USING btree ("version_contact_id");
  CREATE INDEX "_bases_v_version_seo_version_seo_image_idx" ON "_bases_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_bases_v_version_version_slug_idx" ON "_bases_v" USING btree ("version_slug");
  CREATE INDEX "_bases_v_version_version_updated_at_idx" ON "_bases_v" USING btree ("version_updated_at");
  CREATE INDEX "_bases_v_version_version_created_at_idx" ON "_bases_v" USING btree ("version_created_at");
  CREATE INDEX "_bases_v_version_version__status_idx" ON "_bases_v" USING btree ("version__status");
  CREATE INDEX "_bases_v_created_at_idx" ON "_bases_v" USING btree ("created_at");
  CREATE INDEX "_bases_v_updated_at_idx" ON "_bases_v" USING btree ("updated_at");
  CREATE INDEX "_bases_v_snapshot_idx" ON "_bases_v" USING btree ("snapshot");
  CREATE INDEX "_bases_v_published_locale_idx" ON "_bases_v" USING btree ("published_locale");
  CREATE INDEX "_bases_v_latest_idx" ON "_bases_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_bases_v_locales_locale_parent_id_unique" ON "_bases_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_bases_v_locales_parent_id_idx" ON "_bases_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_bases_v_rels_order_idx" ON "_bases_v_rels" USING btree ("order");
  CREATE INDEX "_bases_v_rels_parent_idx" ON "_bases_v_rels" USING btree ("parent_id");
  CREATE INDEX "_bases_v_rels_path_idx" ON "_bases_v_rels" USING btree ("path");
  CREATE INDEX "_bases_v_rels_media_id_idx" ON "_bases_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "counties_slug_idx" ON "counties" USING btree ("slug");
  CREATE UNIQUE INDEX "counties_code_idx" ON "counties" USING btree ("code");
  CREATE INDEX "counties_updated_at_idx" ON "counties" USING btree ("updated_at");
  CREATE INDEX "counties_created_at_idx" ON "counties" USING btree ("created_at");
  CREATE INDEX "crops_faq_order_idx" ON "crops_faq" USING btree ("_order");
  CREATE INDEX "crops_faq_parent_id_idx" ON "crops_faq" USING btree ("_parent_id");
  CREATE INDEX "crops_faq_locale_idx" ON "crops_faq" USING btree ("_locale");
  CREATE UNIQUE INDEX "crops_key_idx" ON "crops" USING btree ("key");
  CREATE INDEX "crops_seo_seo_image_idx" ON "crops" USING btree ("seo_image_id");
  CREATE INDEX "crops_shop_seo_shop_seo_image_idx" ON "crops" USING btree ("shop_seo_image_id");
  CREATE INDEX "crops_updated_at_idx" ON "crops" USING btree ("updated_at");
  CREATE INDEX "crops_created_at_idx" ON "crops" USING btree ("created_at");
  CREATE INDEX "crops__status_idx" ON "crops" USING btree ("_status");
  CREATE UNIQUE INDEX "crops_slug_idx" ON "crops_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "crops_locales_locale_parent_id_unique" ON "crops_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "crops_locales_parent_id_idx" ON "crops_locales" USING btree ("_parent_id");
  CREATE INDEX "_crops_v_version_faq_order_idx" ON "_crops_v_version_faq" USING btree ("_order");
  CREATE INDEX "_crops_v_version_faq_parent_id_idx" ON "_crops_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_crops_v_version_faq_locale_idx" ON "_crops_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_crops_v_parent_idx" ON "_crops_v" USING btree ("parent_id");
  CREATE INDEX "_crops_v_version_version_key_idx" ON "_crops_v" USING btree ("version_key");
  CREATE INDEX "_crops_v_version_seo_version_seo_image_idx" ON "_crops_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_crops_v_version_shop_seo_version_shop_seo_image_idx" ON "_crops_v" USING btree ("version_shop_seo_image_id");
  CREATE INDEX "_crops_v_version_version_updated_at_idx" ON "_crops_v" USING btree ("version_updated_at");
  CREATE INDEX "_crops_v_version_version_created_at_idx" ON "_crops_v" USING btree ("version_created_at");
  CREATE INDEX "_crops_v_version_version__status_idx" ON "_crops_v" USING btree ("version__status");
  CREATE INDEX "_crops_v_created_at_idx" ON "_crops_v" USING btree ("created_at");
  CREATE INDEX "_crops_v_updated_at_idx" ON "_crops_v" USING btree ("updated_at");
  CREATE INDEX "_crops_v_snapshot_idx" ON "_crops_v" USING btree ("snapshot");
  CREATE INDEX "_crops_v_published_locale_idx" ON "_crops_v" USING btree ("published_locale");
  CREATE INDEX "_crops_v_latest_idx" ON "_crops_v" USING btree ("latest");
  CREATE INDEX "_crops_v_version_version_slug_idx" ON "_crops_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_crops_v_locales_locale_parent_id_unique" ON "_crops_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_crops_v_locales_parent_id_idx" ON "_crops_v_locales" USING btree ("_parent_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_variants_sku_idx" ON "products_variants" USING btree ("sku");
  CREATE INDEX "product_ingredients_order_idx" ON "product_ingredients" USING btree ("_order");
  CREATE INDEX "product_ingredients_parent_id_idx" ON "product_ingredients" USING btree ("_parent_id");
  CREATE INDEX "product_ingredients_ingredient_idx" ON "product_ingredients" USING btree ("ingredient_id");
  CREATE INDEX "products_protection_doses_order_idx" ON "products_protection_doses" USING btree ("_order");
  CREATE INDEX "products_protection_doses_parent_id_idx" ON "products_protection_doses" USING btree ("_parent_id");
  CREATE INDEX "products_protection_doses_crop_idx" ON "products_protection_doses" USING btree ("crop_id");
  CREATE UNIQUE INDEX "products_protection_doses_locales_locale_parent_id_unique" ON "products_protection_doses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_protection_doses_locales_parent_id_idx" ON "products_protection_doses_locales" USING btree ("_parent_id");
  CREATE INDEX "products_fertiliser_nutrients_order_idx" ON "products_fertiliser_nutrients" USING btree ("_order");
  CREATE INDEX "products_fertiliser_nutrients_parent_id_idx" ON "products_fertiliser_nutrients" USING btree ("_parent_id");
  CREATE INDEX "products_fertiliser_rates_order_idx" ON "products_fertiliser_rates" USING btree ("_order");
  CREATE INDEX "products_fertiliser_rates_parent_id_idx" ON "products_fertiliser_rates" USING btree ("_parent_id");
  CREATE INDEX "products_fertiliser_rates_crop_idx" ON "products_fertiliser_rates" USING btree ("crop_id");
  CREATE UNIQUE INDEX "products_fertiliser_rates_locales_locale_parent_id_unique" ON "products_fertiliser_rates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_fertiliser_rates_locales_parent_id_idx" ON "products_fertiliser_rates_locales" USING btree ("_parent_id");
  CREATE INDEX "products_faq_order_idx" ON "products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "products_faq" USING btree ("_parent_id");
  CREATE INDEX "products_faq_locale_idx" ON "products_faq" USING btree ("_locale");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_primary_category_idx" ON "products" USING btree ("primary_category_id");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_seo_seo_image_idx" ON "products" USING btree ("seo_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_locales_parent_id_idx" ON "products_locales" USING btree ("_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "products_rels_crops_id_idx" ON "products_rels" USING btree ("crops_id");
  CREATE INDEX "products_rels_targets_id_idx" ON "products_rels" USING btree ("targets_id");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_documents_id_idx" ON "products_rels" USING btree ("documents_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_variants_sku_idx" ON "_products_v_version_variants" USING btree ("sku");
  CREATE INDEX "_product_ingredients_v_order_idx" ON "_product_ingredients_v" USING btree ("_order");
  CREATE INDEX "_product_ingredients_v_parent_id_idx" ON "_product_ingredients_v" USING btree ("_parent_id");
  CREATE INDEX "_product_ingredients_v_ingredient_idx" ON "_product_ingredients_v" USING btree ("ingredient_id");
  CREATE INDEX "_products_v_version_protection_doses_order_idx" ON "_products_v_version_protection_doses" USING btree ("_order");
  CREATE INDEX "_products_v_version_protection_doses_parent_id_idx" ON "_products_v_version_protection_doses" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_protection_doses_crop_idx" ON "_products_v_version_protection_doses" USING btree ("crop_id");
  CREATE UNIQUE INDEX "_products_v_version_protection_doses_locales_locale_parent_i" ON "_products_v_version_protection_doses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_protection_doses_locales_parent_id_idx" ON "_products_v_version_protection_doses_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_fertiliser_nutrients_order_idx" ON "_products_v_version_fertiliser_nutrients" USING btree ("_order");
  CREATE INDEX "_products_v_version_fertiliser_nutrients_parent_id_idx" ON "_products_v_version_fertiliser_nutrients" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_fertiliser_rates_order_idx" ON "_products_v_version_fertiliser_rates" USING btree ("_order");
  CREATE INDEX "_products_v_version_fertiliser_rates_parent_id_idx" ON "_products_v_version_fertiliser_rates" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_fertiliser_rates_crop_idx" ON "_products_v_version_fertiliser_rates" USING btree ("crop_id");
  CREATE UNIQUE INDEX "_products_v_version_fertiliser_rates_locales_locale_parent_i" ON "_products_v_version_fertiliser_rates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_fertiliser_rates_locales_parent_id_idx" ON "_products_v_version_fertiliser_rates_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_locale_idx" ON "_products_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_primary_category_idx" ON "_products_v" USING btree ("version_primary_category_id");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_seo_version_seo_image_idx" ON "_products_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_locales_parent_id_idx" ON "_products_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "_products_v_rels_crops_id_idx" ON "_products_v_rels" USING btree ("crops_id");
  CREATE INDEX "_products_v_rels_targets_id_idx" ON "_products_v_rels" USING btree ("targets_id");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_documents_id_idx" ON "_products_v_rels" USING btree ("documents_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "categories_faq_order_idx" ON "categories_faq" USING btree ("_order");
  CREATE INDEX "categories_faq_parent_id_idx" ON "categories_faq" USING btree ("_parent_id");
  CREATE INDEX "categories_faq_locale_idx" ON "categories_faq" USING btree ("_locale");
  CREATE INDEX "categories_facets_order_idx" ON "categories_facets" USING btree ("order");
  CREATE INDEX "categories_facets_parent_idx" ON "categories_facets" USING btree ("parent_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_seo_seo_image_idx" ON "categories" USING btree ("seo_image_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_products_id_idx" ON "categories_rels" USING btree ("products_id");
  CREATE INDEX "_categories_v_version_faq_order_idx" ON "_categories_v_version_faq" USING btree ("_order");
  CREATE INDEX "_categories_v_version_faq_parent_id_idx" ON "_categories_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_version_faq_locale_idx" ON "_categories_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_categories_v_version_facets_order_idx" ON "_categories_v_version_facets" USING btree ("order");
  CREATE INDEX "_categories_v_version_facets_parent_idx" ON "_categories_v_version_facets" USING btree ("parent_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_parent_idx" ON "_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_categories_v_version_seo_version_seo_image_idx" ON "_categories_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_snapshot_idx" ON "_categories_v" USING btree ("snapshot");
  CREATE INDEX "_categories_v_published_locale_idx" ON "_categories_v" USING btree ("published_locale");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_categories_v_locales_locale_parent_id_unique" ON "_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_categories_v_locales_parent_id_idx" ON "_categories_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_rels_order_idx" ON "_categories_v_rels" USING btree ("order");
  CREATE INDEX "_categories_v_rels_parent_idx" ON "_categories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_categories_v_rels_path_idx" ON "_categories_v_rels" USING btree ("path");
  CREATE INDEX "_categories_v_rels_products_id_idx" ON "_categories_v_rels" USING btree ("products_id");
  CREATE INDEX "brands_faq_order_idx" ON "brands_faq" USING btree ("_order");
  CREATE INDEX "brands_faq_parent_id_idx" ON "brands_faq" USING btree ("_parent_id");
  CREATE INDEX "brands_faq_locale_idx" ON "brands_faq" USING btree ("_locale");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_seo_seo_image_idx" ON "brands" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "brands__status_idx" ON "brands" USING btree ("_status");
  CREATE UNIQUE INDEX "brands_locales_locale_parent_id_unique" ON "brands_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "brands_locales_parent_id_idx" ON "brands_locales" USING btree ("_parent_id");
  CREATE INDEX "brands_rels_order_idx" ON "brands_rels" USING btree ("order");
  CREATE INDEX "brands_rels_parent_idx" ON "brands_rels" USING btree ("parent_id");
  CREATE INDEX "brands_rels_path_idx" ON "brands_rels" USING btree ("path");
  CREATE INDEX "brands_rels_products_id_idx" ON "brands_rels" USING btree ("products_id");
  CREATE INDEX "_brands_v_version_faq_order_idx" ON "_brands_v_version_faq" USING btree ("_order");
  CREATE INDEX "_brands_v_version_faq_parent_id_idx" ON "_brands_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_brands_v_version_faq_locale_idx" ON "_brands_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_seo_version_seo_image_idx" ON "_brands_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version__status_idx" ON "_brands_v" USING btree ("version__status");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_snapshot_idx" ON "_brands_v" USING btree ("snapshot");
  CREATE INDEX "_brands_v_published_locale_idx" ON "_brands_v" USING btree ("published_locale");
  CREATE INDEX "_brands_v_latest_idx" ON "_brands_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_brands_v_locales_locale_parent_id_unique" ON "_brands_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_brands_v_locales_parent_id_idx" ON "_brands_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_brands_v_rels_order_idx" ON "_brands_v_rels" USING btree ("order");
  CREATE INDEX "_brands_v_rels_parent_idx" ON "_brands_v_rels" USING btree ("parent_id");
  CREATE INDEX "_brands_v_rels_path_idx" ON "_brands_v_rels" USING btree ("path");
  CREATE INDEX "_brands_v_rels_products_id_idx" ON "_brands_v_rels" USING btree ("products_id");
  CREATE INDEX "active_ingredients_faq_order_idx" ON "active_ingredients_faq" USING btree ("_order");
  CREATE INDEX "active_ingredients_faq_parent_id_idx" ON "active_ingredients_faq" USING btree ("_parent_id");
  CREATE INDEX "active_ingredients_faq_locale_idx" ON "active_ingredients_faq" USING btree ("_locale");
  CREATE INDEX "active_ingredients_seo_seo_image_idx" ON "active_ingredients" USING btree ("seo_image_id");
  CREATE INDEX "active_ingredients_updated_at_idx" ON "active_ingredients" USING btree ("updated_at");
  CREATE INDEX "active_ingredients_created_at_idx" ON "active_ingredients" USING btree ("created_at");
  CREATE INDEX "active_ingredients__status_idx" ON "active_ingredients" USING btree ("_status");
  CREATE UNIQUE INDEX "active_ingredients_slug_idx" ON "active_ingredients_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "active_ingredients_locales_locale_parent_id_unique" ON "active_ingredients_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "active_ingredients_locales_parent_id_idx" ON "active_ingredients_locales" USING btree ("_parent_id");
  CREATE INDEX "active_ingredients_rels_order_idx" ON "active_ingredients_rels" USING btree ("order");
  CREATE INDEX "active_ingredients_rels_parent_idx" ON "active_ingredients_rels" USING btree ("parent_id");
  CREATE INDEX "active_ingredients_rels_path_idx" ON "active_ingredients_rels" USING btree ("path");
  CREATE INDEX "active_ingredients_rels_products_id_idx" ON "active_ingredients_rels" USING btree ("products_id");
  CREATE INDEX "_active_ingredients_v_version_faq_order_idx" ON "_active_ingredients_v_version_faq" USING btree ("_order");
  CREATE INDEX "_active_ingredients_v_version_faq_parent_id_idx" ON "_active_ingredients_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_active_ingredients_v_version_faq_locale_idx" ON "_active_ingredients_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_active_ingredients_v_parent_idx" ON "_active_ingredients_v" USING btree ("parent_id");
  CREATE INDEX "_active_ingredients_v_version_seo_version_seo_image_idx" ON "_active_ingredients_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_active_ingredients_v_version_version_updated_at_idx" ON "_active_ingredients_v" USING btree ("version_updated_at");
  CREATE INDEX "_active_ingredients_v_version_version_created_at_idx" ON "_active_ingredients_v" USING btree ("version_created_at");
  CREATE INDEX "_active_ingredients_v_version_version__status_idx" ON "_active_ingredients_v" USING btree ("version__status");
  CREATE INDEX "_active_ingredients_v_created_at_idx" ON "_active_ingredients_v" USING btree ("created_at");
  CREATE INDEX "_active_ingredients_v_updated_at_idx" ON "_active_ingredients_v" USING btree ("updated_at");
  CREATE INDEX "_active_ingredients_v_snapshot_idx" ON "_active_ingredients_v" USING btree ("snapshot");
  CREATE INDEX "_active_ingredients_v_published_locale_idx" ON "_active_ingredients_v" USING btree ("published_locale");
  CREATE INDEX "_active_ingredients_v_latest_idx" ON "_active_ingredients_v" USING btree ("latest");
  CREATE INDEX "_active_ingredients_v_version_version_slug_idx" ON "_active_ingredients_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_active_ingredients_v_locales_locale_parent_id_unique" ON "_active_ingredients_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_active_ingredients_v_locales_parent_id_idx" ON "_active_ingredients_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_active_ingredients_v_rels_order_idx" ON "_active_ingredients_v_rels" USING btree ("order");
  CREATE INDEX "_active_ingredients_v_rels_parent_idx" ON "_active_ingredients_v_rels" USING btree ("parent_id");
  CREATE INDEX "_active_ingredients_v_rels_path_idx" ON "_active_ingredients_v_rels" USING btree ("path");
  CREATE INDEX "_active_ingredients_v_rels_products_id_idx" ON "_active_ingredients_v_rels" USING btree ("products_id");
  CREATE INDEX "targets_updated_at_idx" ON "targets" USING btree ("updated_at");
  CREATE INDEX "targets_created_at_idx" ON "targets" USING btree ("created_at");
  CREATE UNIQUE INDEX "targets_slug_idx" ON "targets_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "targets_locales_locale_parent_id_unique" ON "targets_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "targets_locales_parent_id_idx" ON "targets_locales" USING btree ("_parent_id");
  CREATE INDEX "targets_rels_order_idx" ON "targets_rels" USING btree ("order");
  CREATE INDEX "targets_rels_parent_idx" ON "targets_rels" USING btree ("parent_id");
  CREATE INDEX "targets_rels_path_idx" ON "targets_rels" USING btree ("path");
  CREATE INDEX "targets_rels_crops_id_idx" ON "targets_rels" USING btree ("crops_id");
  CREATE INDEX "price_history_product_idx" ON "price_history" USING btree ("product_id");
  CREATE INDEX "price_history_sku_idx" ON "price_history" USING btree ("sku");
  CREATE INDEX "price_history_date_idx" ON "price_history" USING btree ("date");
  CREATE INDEX "price_history_updated_at_idx" ON "price_history" USING btree ("updated_at");
  CREATE INDEX "price_history_created_at_idx" ON "price_history" USING btree ("created_at");
  CREATE INDEX "people_author_same_as_order_idx" ON "people_author_same_as" USING btree ("_order");
  CREATE INDEX "people_author_same_as_parent_id_idx" ON "people_author_same_as" USING btree ("_parent_id");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_locales_parent_id_idx" ON "people_locales" USING btree ("_parent_id");
  CREATE INDEX "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to_id");
  CREATE INDEX "leads_county_idx" ON "leads" USING btree ("county_id");
  CREATE INDEX "leads_base_idx" ON "leads" USING btree ("base_id");
  CREATE INDEX "leads_crop_idx" ON "leads" USING btree ("crop_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documents_locales_parent_id_idx" ON "documents_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_bases_id_idx" ON "payload_locked_documents_rels" USING btree ("bases_id");
  CREATE INDEX "payload_locked_documents_rels_counties_id_idx" ON "payload_locked_documents_rels" USING btree ("counties_id");
  CREATE INDEX "payload_locked_documents_rels_crops_id_idx" ON "payload_locked_documents_rels" USING btree ("crops_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_active_ingredients_id_idx" ON "payload_locked_documents_rels" USING btree ("active_ingredients_id");
  CREATE INDEX "payload_locked_documents_rels_targets_id_idx" ON "payload_locked_documents_rels" USING btree ("targets_id");
  CREATE INDEX "payload_locked_documents_rels_price_history_id_idx" ON "payload_locked_documents_rels" USING btree ("price_history_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "figures_rows_order_idx" ON "figures_rows" USING btree ("_order");
  CREATE INDEX "figures_rows_parent_id_idx" ON "figures_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "figures_rows_locales_locale_parent_id_unique" ON "figures_rows_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "figures_rows_locales_parent_id_idx" ON "figures_rows_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_children_order_idx" ON "navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_children_locale_idx" ON "navigation_items_children" USING btree ("_locale");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_locale_idx" ON "navigation_items" USING btree ("_locale");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_locales_parent_id_idx" ON "navigation_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_locale_idx" ON "footer_columns_links" USING btree ("_locale");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_locale_idx" ON "footer_columns" USING btree ("_locale");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_locales_parent_id_idx" ON "footer_locales" USING btree ("_parent_id");
  CREATE INDEX "seo_defaults_organization_same_as_order_idx" ON "seo_defaults_organization_same_as" USING btree ("_order");
  CREATE INDEX "seo_defaults_organization_same_as_parent_id_idx" ON "seo_defaults_organization_same_as" USING btree ("_parent_id");
  CREATE INDEX "seo_defaults_og_image_idx" ON "seo_defaults" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "seo_defaults_locales_locale_parent_id_unique" ON "seo_defaults_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_defaults_locales_parent_id_idx" ON "seo_defaults_locales" USING btree ("_parent_id");
  CREATE INDEX "lead_routing_routes_order_idx" ON "lead_routing_routes" USING btree ("_order");
  CREATE INDEX "lead_routing_routes_parent_id_idx" ON "lead_routing_routes" USING btree ("_parent_id");
  CREATE INDEX "lead_routing_routes_primary_idx" ON "lead_routing_routes" USING btree ("primary_id");
  CREATE INDEX "lead_routing_routes_fallback_idx" ON "lead_routing_routes" USING btree ("fallback_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_needs" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_figure_strip_items" CASCADE;
  DROP TABLE "pages_blocks_figure_strip" CASCADE;
  DROP TABLE "pages_blocks_figure_table" CASCADE;
  DROP TABLE "pages_blocks_service_grid_items" CASCADE;
  DROP TABLE "pages_blocks_service_grid" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_finance_band_instalments" CASCADE;
  DROP TABLE "pages_blocks_finance_band" CASCADE;
  DROP TABLE "pages_blocks_story_section" CASCADE;
  DROP TABLE "pages_blocks_base_list" CASCADE;
  DROP TABLE "pages_blocks_crop_list" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_lead_form_extra_fields" CASCADE;
  DROP TABLE "pages_blocks_lead_form" CASCADE;
  DROP TABLE "pages_blocks_contact_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_contact_cards" CASCADE;
  DROP TABLE "pages_blocks_video_embed" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_faq" CASCADE;
  DROP TABLE "pages_languages" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_needs" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_figure_strip_items" CASCADE;
  DROP TABLE "_pages_v_blocks_figure_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_figure_table" CASCADE;
  DROP TABLE "_pages_v_blocks_service_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_service_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_finance_band_instalments" CASCADE;
  DROP TABLE "_pages_v_blocks_finance_band" CASCADE;
  DROP TABLE "_pages_v_blocks_story_section" CASCADE;
  DROP TABLE "_pages_v_blocks_base_list" CASCADE;
  DROP TABLE "_pages_v_blocks_crop_list" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band" CASCADE;
  DROP TABLE "_pages_v_blocks_lead_form_extra_fields" CASCADE;
  DROP TABLE "_pages_v_blocks_lead_form" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_video_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_version_faq" CASCADE;
  DROP TABLE "_pages_v_version_languages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "bases_services" CASCADE;
  DROP TABLE "bases_hours_days" CASCADE;
  DROP TABLE "bases_hours" CASCADE;
  DROP TABLE "bases_faq" CASCADE;
  DROP TABLE "bases" CASCADE;
  DROP TABLE "bases_locales" CASCADE;
  DROP TABLE "bases_rels" CASCADE;
  DROP TABLE "_bases_v_version_services" CASCADE;
  DROP TABLE "_bases_v_version_hours_days" CASCADE;
  DROP TABLE "_bases_v_version_hours" CASCADE;
  DROP TABLE "_bases_v_version_faq" CASCADE;
  DROP TABLE "_bases_v" CASCADE;
  DROP TABLE "_bases_v_locales" CASCADE;
  DROP TABLE "_bases_v_rels" CASCADE;
  DROP TABLE "counties" CASCADE;
  DROP TABLE "crops_faq" CASCADE;
  DROP TABLE "crops" CASCADE;
  DROP TABLE "crops_locales" CASCADE;
  DROP TABLE "_crops_v_version_faq" CASCADE;
  DROP TABLE "_crops_v" CASCADE;
  DROP TABLE "_crops_v_locales" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "product_ingredients" CASCADE;
  DROP TABLE "products_protection_doses" CASCADE;
  DROP TABLE "products_protection_doses_locales" CASCADE;
  DROP TABLE "products_fertiliser_nutrients" CASCADE;
  DROP TABLE "products_fertiliser_rates" CASCADE;
  DROP TABLE "products_fertiliser_rates_locales" CASCADE;
  DROP TABLE "products_faq" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_product_ingredients_v" CASCADE;
  DROP TABLE "_products_v_version_protection_doses" CASCADE;
  DROP TABLE "_products_v_version_protection_doses_locales" CASCADE;
  DROP TABLE "_products_v_version_fertiliser_nutrients" CASCADE;
  DROP TABLE "_products_v_version_fertiliser_rates" CASCADE;
  DROP TABLE "_products_v_version_fertiliser_rates_locales" CASCADE;
  DROP TABLE "_products_v_version_faq" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "categories_faq" CASCADE;
  DROP TABLE "categories_facets" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "_categories_v_version_faq" CASCADE;
  DROP TABLE "_categories_v_version_facets" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_locales" CASCADE;
  DROP TABLE "_categories_v_rels" CASCADE;
  DROP TABLE "brands_faq" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "brands_locales" CASCADE;
  DROP TABLE "brands_rels" CASCADE;
  DROP TABLE "_brands_v_version_faq" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "_brands_v_locales" CASCADE;
  DROP TABLE "_brands_v_rels" CASCADE;
  DROP TABLE "active_ingredients_faq" CASCADE;
  DROP TABLE "active_ingredients" CASCADE;
  DROP TABLE "active_ingredients_locales" CASCADE;
  DROP TABLE "active_ingredients_rels" CASCADE;
  DROP TABLE "_active_ingredients_v_version_faq" CASCADE;
  DROP TABLE "_active_ingredients_v" CASCADE;
  DROP TABLE "_active_ingredients_v_locales" CASCADE;
  DROP TABLE "_active_ingredients_v_rels" CASCADE;
  DROP TABLE "targets" CASCADE;
  DROP TABLE "targets_locales" CASCADE;
  DROP TABLE "targets_rels" CASCADE;
  DROP TABLE "price_history" CASCADE;
  DROP TABLE "people_author_same_as" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "figures_rows" CASCADE;
  DROP TABLE "figures_rows_locales" CASCADE;
  DROP TABLE "figures" CASCADE;
  DROP TABLE "navigation_items_children" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "seo_defaults_organization_same_as" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TABLE "seo_defaults_locales" CASCADE;
  DROP TABLE "lead_routing_routes" CASCADE;
  DROP TABLE "lead_routing" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_service_grid_items_icon";
  DROP TYPE "public"."enum_pages_blocks_service_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_cta_band_tone";
  DROP TYPE "public"."enum_pages_blocks_lead_form_extra_fields";
  DROP TYPE "public"."enum_pages_blocks_lead_form_lead_type";
  DROP TYPE "public"."enum_pages_blocks_callout_tone";
  DROP TYPE "public"."enum_pages_languages";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_service_grid_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_service_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_tone";
  DROP TYPE "public"."enum__pages_v_blocks_lead_form_extra_fields";
  DROP TYPE "public"."enum__pages_v_blocks_lead_form_lead_type";
  DROP TYPE "public"."enum__pages_v_blocks_callout_tone";
  DROP TYPE "public"."enum__pages_v_version_languages";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_bases_services";
  DROP TYPE "public"."enum_bases_hours_days";
  DROP TYPE "public"."enum_bases_capacity_status";
  DROP TYPE "public"."enum_bases_services_status";
  DROP TYPE "public"."enum_bases_location_status";
  DROP TYPE "public"."enum_bases_contact_status";
  DROP TYPE "public"."enum_bases_status";
  DROP TYPE "public"."enum__bases_v_version_services";
  DROP TYPE "public"."enum__bases_v_version_hours_days";
  DROP TYPE "public"."enum__bases_v_version_capacity_status";
  DROP TYPE "public"."enum__bases_v_version_services_status";
  DROP TYPE "public"."enum__bases_v_version_location_status";
  DROP TYPE "public"."enum__bases_v_version_contact_status";
  DROP TYPE "public"."enum__bases_v_version_status";
  DROP TYPE "public"."enum__bases_v_published_locale";
  DROP TYPE "public"."enum_crops_status";
  DROP TYPE "public"."enum__crops_v_version_status";
  DROP TYPE "public"."enum__crops_v_published_locale";
  DROP TYPE "public"."enum_products_variants_unit";
  DROP TYPE "public"."enum_products_variants_stock";
  DROP TYPE "public"."enum_products_commerce_status";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_products_verification_price_status";
  DROP TYPE "public"."enum_products_verification_technical_status";
  DROP TYPE "public"."enum_products_verification_doses_status";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_variants_unit";
  DROP TYPE "public"."enum__products_v_version_variants_stock";
  DROP TYPE "public"."enum__products_v_version_commerce_status";
  DROP TYPE "public"."enum__products_v_version_product_type";
  DROP TYPE "public"."enum__products_v_version_verification_price_status";
  DROP TYPE "public"."enum__products_v_version_verification_technical_status";
  DROP TYPE "public"."enum__products_v_version_verification_doses_status";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_categories_facets";
  DROP TYPE "public"."enum_categories_role";
  DROP TYPE "public"."enum_categories_icon";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_facets";
  DROP TYPE "public"."enum__categories_v_version_role";
  DROP TYPE "public"."enum__categories_v_version_icon";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum__categories_v_published_locale";
  DROP TYPE "public"."enum_brands_status";
  DROP TYPE "public"."enum__brands_v_version_status";
  DROP TYPE "public"."enum__brands_v_published_locale";
  DROP TYPE "public"."enum_active_ingredients_status";
  DROP TYPE "public"."enum__active_ingredients_v_version_status";
  DROP TYPE "public"."enum__active_ingredients_v_published_locale";
  DROP TYPE "public"."enum_targets_kind";
  DROP TYPE "public"."enum_leads_type";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_meta_locale";
  DROP TYPE "public"."enum_media_rights";
  DROP TYPE "public"."enum_documents_kind";
  DROP TYPE "public"."enum_documents_language";
  DROP TYPE "public"."enum_documents_rights";
  DROP TYPE "public"."enum_figures_rows_status";
  DROP TYPE "public"."enum_lead_routing_routes_type";`)
}
