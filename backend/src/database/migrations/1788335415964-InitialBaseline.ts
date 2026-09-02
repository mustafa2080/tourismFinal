import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline migration.
 *
 * The schema at this point was built using TypeORM's `synchronize: true`
 * (now disabled — see src/config/database.ts). This migration does not
 * change anything; it exists only to mark this schema as the starting
 * point in the `migrations` history table, so future schema changes can
 * be added as proper, reviewable migrations from here on.
 */
export class InitialBaseline1788335415964 implements MigrationInterface {
  name = 'InitialBaseline1788335415964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty — schema already exists.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty — this baseline cannot be "undone".
  }
}
