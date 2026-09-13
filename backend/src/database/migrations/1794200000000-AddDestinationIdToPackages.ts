import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Links packages to a real destination row instead of a free-text string.
 * Adds a nullable destination_id FK -> region_destinations, backfills it
 * from the existing free-text "destination" column (case-insensitive match
 * on name), and indexes it for lookups/joins.
 *
 * The old "destination" text column is intentionally left in place as a
 * temporary fallback. A later migration will drop it once every package is
 * verified to have a correct destination_id (see verify-backfill.sql).
 */
export class AddDestinationIdToPackages1794200000000 implements MigrationInterface {
  name = 'AddDestinationIdToPackages1794200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "packages" ADD COLUMN "destination_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "packages"
      ADD CONSTRAINT "FK_packages_destination"
      FOREIGN KEY ("destination_id") REFERENCES "region_destinations"("id")
      ON DELETE SET NULL
    `);

    // Backfill: match old free-text destination to region_destinations.name
    // (case-insensitive, trimmed)
    await queryRunner.query(`
      UPDATE "packages" p
      SET "destination_id" = rd.id
      FROM "region_destinations" rd
      WHERE LOWER(TRIM(p."destination")) = LOWER(TRIM(rd."name"))
        AND p."destination_id" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_packages_destination_id" ON "packages" ("destination_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_packages_destination_id"`);
    await queryRunner.query(`ALTER TABLE "packages" DROP CONSTRAINT "FK_packages_destination"`);
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN "destination_id"`);
  }
}
