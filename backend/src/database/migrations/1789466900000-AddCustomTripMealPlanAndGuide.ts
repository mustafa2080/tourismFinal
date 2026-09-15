import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the "Meal Plan" and "Tour Guide" fields to Custom Trip requests
 * (matches the boss's sketch: hotel board basis b.b/half/full board,
 * plus an optional tour guide with a preferred language).
 */
export class AddCustomTripMealPlanAndGuide1789466900000 implements MigrationInterface {
  name = 'AddCustomTripMealPlanAndGuide1789466900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "meal_plan" varchar(20) NOT NULL DEFAULT 'none'
    `);
    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "wants_guide" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "custom_trip_requests"
      ADD COLUMN "guide_language" varchar(30)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "guide_language"`);
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "wants_guide"`);
    await queryRunner.query(`ALTER TABLE "custom_trip_requests" DROP COLUMN IF EXISTS "meal_plan"`);
  }
}
