import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a "best time to visit" indicator to each destination: an array of
 * month numbers (1-12) the admin marks as the ideal months to travel there.
 * Shown on the Destinations megamenu and on package detail pages via the
 * package's destinationRef relation.
 */
export class AddBestMonthsToDestinations1794300000000 implements MigrationInterface {
  name = 'AddBestMonthsToDestinations1794300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "region_destinations"
      ADD COLUMN "best_months" integer[] NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "region_destinations" DROP COLUMN "best_months"
    `);
  }
}
