import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_profiles_outcome_type" AS ENUM('internship', 'co-op', 'new-position', 'full-time-offer', 'promotion', 'research-role', 'grad-school');
  ALTER TABLE "profiles" ADD COLUMN "outcome_type" "enum_profiles_outcome_type";
  ALTER TABLE "profiles" ADD COLUMN "outcome_detail" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "profiles" DROP COLUMN "outcome_type";
  ALTER TABLE "profiles" DROP COLUMN "outcome_detail";
  DROP TYPE "public"."enum_profiles_outcome_type";`)
}
