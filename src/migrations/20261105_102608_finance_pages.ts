import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_guides_section" ADD VALUE 'pagina-finantare';
  ALTER TYPE "public"."enum__guides_v_version_section" ADD VALUE 'pagina-finantare';
  CREATE TABLE "pages_blocks_finance_products" (
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
  
  CREATE TABLE "_pages_v_blocks_finance_products" (
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
  
  ALTER TABLE "pages_blocks_finance_products" ADD CONSTRAINT "pages_blocks_finance_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_finance_products" ADD CONSTRAINT "_pages_v_blocks_finance_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_finance_products_order_idx" ON "pages_blocks_finance_products" USING btree ("_order");
  CREATE INDEX "pages_blocks_finance_products_parent_id_idx" ON "pages_blocks_finance_products" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_finance_products_path_idx" ON "pages_blocks_finance_products" USING btree ("_path");
  CREATE INDEX "pages_blocks_finance_products_locale_idx" ON "pages_blocks_finance_products" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_finance_products_order_idx" ON "_pages_v_blocks_finance_products" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_finance_products_parent_id_idx" ON "_pages_v_blocks_finance_products" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_finance_products_path_idx" ON "_pages_v_blocks_finance_products" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_finance_products_locale_idx" ON "_pages_v_blocks_finance_products" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_finance_products" CASCADE;
  DROP TABLE "_pages_v_blocks_finance_products" CASCADE;
  ALTER TABLE "guides" ALTER COLUMN "section" SET DATA TYPE text;
  ALTER TABLE "guides" ALTER COLUMN "section" SET DEFAULT 'finantare'::text;
  DROP TYPE "public"."enum_guides_section";
  CREATE TYPE "public"."enum_guides_section" AS ENUM('finantare');
  ALTER TABLE "guides" ALTER COLUMN "section" SET DEFAULT 'finantare'::"public"."enum_guides_section";
  ALTER TABLE "guides" ALTER COLUMN "section" SET DATA TYPE "public"."enum_guides_section" USING "section"::"public"."enum_guides_section";
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DATA TYPE text;
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DEFAULT 'finantare'::text;
  DROP TYPE "public"."enum__guides_v_version_section";
  CREATE TYPE "public"."enum__guides_v_version_section" AS ENUM('finantare');
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DEFAULT 'finantare'::"public"."enum__guides_v_version_section";
  ALTER TABLE "_guides_v" ALTER COLUMN "version_section" SET DATA TYPE "public"."enum__guides_v_version_section" USING "version_section"::"public"."enum__guides_v_version_section";`)
}
