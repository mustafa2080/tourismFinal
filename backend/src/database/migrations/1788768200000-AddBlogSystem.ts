import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Full-featured Blog system.
 *
 * `blog_posts` already exists (created by InitialBaseline) but only with
 * the minimal columns (title, slug, excerpt, body, featured_image,
 * published, author_id, timestamps). This migration ALTERs it to add
 * everything a real admin-managed blog needs: category, tags, view
 * count, read time estimate, and basic SEO meta fields, plus a new
 * blog_categories table so the admin can manage blog categories the
 * same way tour categories are managed.
 */
export class AddBlogSystem1788768200000 implements MigrationInterface {
  name = 'AddBlogSystem1788768200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blog_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_categories_slug" UNIQUE ("slug")
      )
    `);

    // blog_posts already exists — widen it instead of creating it.
    await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "featured_image" TYPE text`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "category_id" uuid`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "tags" text[] NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "published_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "views_count" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "read_time_minutes" integer NOT NULL DEFAULT 1`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "meta_title" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "blog_posts" ADD COLUMN "meta_description" varchar(500)`);

    // author_id was NOT NULL with an ON DELETE SET NULL FK, which is
    // contradictory (a delete would try to null a NOT NULL column) —
    // relax it to nullable to match the FK's actual behavior.
    await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "author_id" DROP NOT NULL`);

    await queryRunner.query(`
      ALTER TABLE "blog_posts"
      ADD CONSTRAINT "FK_blog_posts_category"
      FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL
    `);

    // Backfill published_at for any posts already marked published, and
    // give existing rows a sane read-time estimate from their body length.
    await queryRunner.query(`
      UPDATE "blog_posts" SET "published_at" = "created_at" WHERE "published" = true AND "published_at" IS NULL
    `);
    await queryRunner.query(`
      UPDATE "blog_posts"
      SET "read_time_minutes" = GREATEST(1, CEIL(LENGTH("body")::decimal / 1000))
    `);

    await queryRunner.query(`CREATE INDEX "IDX_blog_posts_category_id" ON "blog_posts" ("category_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blog_posts_category_id"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "FK_blog_posts_category"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "category_id"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "tags"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "published_at"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "views_count"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "read_time_minutes"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_title"`);
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_description"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_categories"`);
  }
}
