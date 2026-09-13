import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds admin-managed "Popular Destinations" content: a region (continent)
 * with a display image, and a list of destination names shown under it.
 * Replaces the previously hardcoded REGIONS array on the homepage.
 *  - regions: continent/region tiles (name, slug, image, sort_order)
 *  - region_destinations: destination names belonging to a region
 */
export class AddRegionsAndDestinations1794150000000 implements MigrationInterface {
  name = 'AddRegionsAndDestinations1794150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "regions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "image" varchar(500),
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_regions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_regions_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_regions_sort_order" ON "regions" ("sort_order")
    `);

    await queryRunner.query(`
      CREATE TABLE "region_destinations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "region_id" uuid NOT NULL,
        "name" varchar(150) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_region_destinations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rd_region" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_rd_region_id" ON "region_destinations" ("region_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "region_destinations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "regions"`);
  }
}
