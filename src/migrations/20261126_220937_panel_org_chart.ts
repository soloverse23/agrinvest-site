import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Phase 9: departments follow the organisation chart. Shop becomes Comercial, Prețuri and
 * Vânzări go (each department keeps its own prices and requests), and every page names the
 * department that edits it. The old sample accounts are removed by `apply:panel`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_department" AS ENUM('cereale', 'comercial', 'ifn', 'logistica', 'motorina', 'continut');
  CREATE TYPE "public"."enum__pages_v_version_department" AS ENUM('cereale', 'comercial', 'ifn', 'logistica', 'motorina', 'continut');
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE text;
  UPDATE "users_roles" SET "value" = 'comercial' WHERE "value" = 'magazin';
  DELETE FROM "users_roles" WHERE "value" IN ('preturi', 'vanzari');
  DROP TYPE "public"."enum_users_roles";
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'cereale', 'comercial', 'ifn', 'logistica', 'motorina', 'continut');
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_roles" USING "value"::"public"."enum_users_roles";
  ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "department" "enum_pages_department";
  ALTER TABLE "_pages_v" ADD COLUMN "version_department" "enum__pages_v_version_department";
  ALTER TABLE "users" ADD COLUMN "username" varchar;
  CREATE INDEX "pages_department_idx" ON "pages" USING btree ("department");
  CREATE INDEX "_pages_v_version_version_department_idx" ON "_pages_v" USING btree ("version_department");
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");`)

  // Each page's department, by its Romanian path. The legal pages without one stay the admin's.
  await db.execute(sql`
  WITH owners(path, department) AS (VALUES
    ('/', 'continut'), ('/despre', 'continut'), ('/despre/cifre', 'continut'),
    ('/parteneri', 'continut'), ('/golden-relationship', 'continut'), ('/cariere', 'continut'),
    ('/contact', 'continut'),
    ('/cereale', 'cereale'), ('/depozitare', 'cereale'), ('/depozitare/uscare', 'cereale'),
    ('/termeni-de-vanzare', 'comercial'), ('/retur', 'comercial'), ('/reclamatii', 'comercial'),
    ('/finantare', 'ifn'),
    ('/logistica', 'logistica'), ('/livrare', 'logistica')
  ), found AS (
    SELECT l."_parent_id" AS id, o.department
    FROM "pages_locales" l JOIN owners o ON o.path = l."path"
    WHERE l."_locale" = 'ro'
  ), pages_done AS (
    UPDATE "pages" p SET "department" = f.department::"enum_pages_department"
    FROM found f WHERE p."id" = f.id
  )
  UPDATE "_pages_v" v SET "version_department" = f.department::"enum__pages_v_version_department"
  FROM found f WHERE v."parent_id" = f.id;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE text;
  UPDATE "users_roles" SET "value" = 'magazin' WHERE "value" = 'comercial';
  DELETE FROM "users_roles" WHERE "value" IN ('cereale', 'logistica', 'motorina');
  DROP TYPE "public"."enum_users_roles";
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'continut', 'magazin', 'ifn', 'preturi', 'vanzari');
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_roles" USING "value"::"public"."enum_users_roles";
  DROP INDEX "pages_department_idx";
  DROP INDEX "_pages_v_version_version_department_idx";
  DROP INDEX "users_username_idx";
  ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "pages" DROP COLUMN "department";
  ALTER TABLE "_pages_v" DROP COLUMN "version_department";
  ALTER TABLE "users" DROP COLUMN "username";
  DROP TYPE "public"."enum_pages_department";
  DROP TYPE "public"."enum__pages_v_version_department";`)
}
