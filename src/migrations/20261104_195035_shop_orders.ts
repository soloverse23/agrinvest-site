import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('new', 'contacted', 'confirmed', 'paid', 'delivered', 'cancelled');
  CREATE TYPE "public"."enum_orders_buyer_type" AS ENUM('person', 'company');
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM('delivery', 'pickup');
  CREATE TYPE "public"."enum_orders_payment" AS ENUM('consultant', 'proforma');
  CREATE TYPE "public"."enum_orders_meta_locale" AS ENUM('ro', 'en');
  CREATE TABLE "carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"product_id" integer,
  	"name" varchar NOT NULL,
  	"pack" varchar,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric,
  	"line_total" numeric,
  	"price_confirmed" boolean
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"total" numeric,
  	"buyer_type" "enum_orders_buyer_type" NOT NULL,
  	"buyer_name" varchar NOT NULL,
  	"buyer_phone" varchar NOT NULL,
  	"buyer_email" varchar NOT NULL,
  	"buyer_company" varchar,
  	"buyer_cui" varchar,
  	"buyer_reg_com" varchar,
  	"buyer_billing_address" varchar,
  	"delivery_method" "enum_orders_delivery_method" NOT NULL,
  	"delivery_county_id" integer,
  	"delivery_base_id" integer,
  	"delivery_address" varchar,
  	"certificate_number" varchar,
  	"certificate_valid_until" timestamp(3) with time zone,
  	"payment" "enum_orders_payment" NOT NULL,
  	"message" varchar,
  	"staff_notes" varchar,
  	"meta_locale" "enum_orders_meta_locale",
  	"meta_consent_version" varchar,
  	"meta_terms_version" varchar,
  	"meta_adult_confirmed" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "products" ADD COLUMN "protection_ghs06" boolean;
  ALTER TABLE "products_locales" ADD COLUMN "sale_block" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_protection_ghs06" boolean;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_sale_block" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "carts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_to_id_people_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_county_id_counties_id_fk" FOREIGN KEY ("delivery_county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_base_id_bases_id_fk" FOREIGN KEY ("delivery_base_id") REFERENCES "public"."bases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
  CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "carts_token_idx" ON "carts" USING btree ("token");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  CREATE INDEX "orders_lines_order_idx" ON "orders_lines" USING btree ("_order");
  CREATE INDEX "orders_lines_parent_id_idx" ON "orders_lines" USING btree ("_parent_id");
  CREATE INDEX "orders_lines_product_idx" ON "orders_lines" USING btree ("product_id");
  CREATE UNIQUE INDEX "orders_reference_idx" ON "orders" USING btree ("reference");
  CREATE INDEX "orders_assigned_to_idx" ON "orders" USING btree ("assigned_to_id");
  CREATE INDEX "orders_delivery_delivery_county_idx" ON "orders" USING btree ("delivery_county_id");
  CREATE INDEX "orders_delivery_delivery_base_idx" ON "orders" USING btree ("delivery_base_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "leads_rels_order_idx" ON "leads_rels" USING btree ("order");
  CREATE INDEX "leads_rels_parent_idx" ON "leads_rels" USING btree ("parent_id");
  CREATE INDEX "leads_rels_path_idx" ON "leads_rels" USING btree ("path");
  CREATE INDEX "leads_rels_products_id_idx" ON "leads_rels" USING btree ("products_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "carts_items" CASCADE;
  DROP TABLE "carts" CASCADE;
  DROP TABLE "orders_lines" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "leads_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_carts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_carts_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "products" DROP COLUMN "protection_ghs06";
  ALTER TABLE "products_locales" DROP COLUMN "sale_block";
  ALTER TABLE "_products_v" DROP COLUMN "version_protection_ghs06";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_sale_block";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "carts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_buyer_type";
  DROP TYPE "public"."enum_orders_delivery_method";
  DROP TYPE "public"."enum_orders_payment";
  DROP TYPE "public"."enum_orders_meta_locale";`)
}
