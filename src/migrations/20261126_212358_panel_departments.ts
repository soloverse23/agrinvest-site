import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_roles" ADD VALUE 'continut' BEFORE 'ifn';
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'magazin' BEFORE 'ifn';
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'preturi';
  ALTER TYPE "public"."enum_users_roles" ADD VALUE 'vanzari';
  ALTER TABLE "users" ADD COLUMN "name" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_roles";
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'ifn');
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_roles" USING "value"::"public"."enum_users_roles";
  ALTER TABLE "users" DROP COLUMN "name";`)
}
