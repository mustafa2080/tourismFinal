import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Extends Custom Trips to match the updated "Build Your Trip" flow:
 *  - destinations_detail: structured [{ country, cities: [] }] picks,
 *    supporting multiple country/city blocks (Step 1 "+" add another).
 *    `destination` (varchar) is kept as a human-readable summary built
 *    from this, so existing emails/notifications/admin views keep working.
 *  - activity_tags: multi-select activity categories (Step 2 "+" add another),
 *    separate from the existing catalog-based item picker.
 *  - budget_min / budget_max / budget_currency: replaces the fixed
 *    budget_tier picker with a From→To range plus a currency dropdown.
 *    budget_tier is kept (with its existing default) for backward
 *    compatibility with any old clients/reports.
 */
export class AddCustomTripDestinationsAndBudgetRange1789463845000 implements MigrationInterface {
  name = 'AddCustomTripDestinationsAndBudgetRange1789463845000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "destinations_detail" jsonb NOT NULL DEFAULT '[]'
    `);

    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "activity_tags" text[] NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "budget_min" numeric(12,2)
    `);
    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "budget_max" numeric(12,2)
    `);
    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "budget_currency" varchar(3) NOT NULL DEFAULT 'USD'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "budget_currency"`);
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "budget_max"`);
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "budget_min"`);
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "activity_tags"`);
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "destinations_detail"`);
  }
}
