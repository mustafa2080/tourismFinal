import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Custom Trips feature: customers build their own trip from
 * scratch (destination, dates, travelers, chosen items) independent
 * from the existing Packages system. Adds 3 tables:
 *  - trip_builder_options: admin-managed catalog of pickable items
 *  - custom_trip_requests: the request a customer submits
 *  - custom_trip_items: the items chosen inside a request
 */
export class AddCustomTrips1793958000000 implements MigrationInterface {
  name = 'AddCustomTrips1793958000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "trip_builder_options" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "item_type" varchar(20) NOT NULL,
        "destination" varchar(150) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "image" varchar(500),
        "price" numeric(12,2) NOT NULL DEFAULT 0,
        "price_unit" varchar(20) NOT NULL DEFAULT 'per_person',
        "tags" text[] NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trip_builder_options" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tbo_destination" ON "trip_builder_options" ("destination")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_tbo_item_type" ON "trip_builder_options" ("item_type")
    `);

    await queryRunner.query(`
      CREATE TABLE "custom_trip_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "request_number" varchar(50) NOT NULL,
        "user_id" uuid,
        "contact_name" varchar(255) NOT NULL,
        "contact_email" varchar(255) NOT NULL,
        "contact_phone" varchar(20),
        "destination" varchar(150) NOT NULL,
        "date_start" date NOT NULL,
        "date_end" date NOT NULL,
        "adults" integer NOT NULL,
        "children" integer NOT NULL DEFAULT 0,
        "budget_tier" varchar(20) NOT NULL DEFAULT 'mid_range',
        "pace" varchar(20) NOT NULL DEFAULT 'standard',
        "interests" text[] NOT NULL DEFAULT '{}',
        "special_requests" text,
        "estimated_total" numeric(12,2) NOT NULL DEFAULT 0,
        "display_currency" varchar(3) NOT NULL DEFAULT 'USD',
        "display_total" numeric(12,2),
        "status" varchar(20) NOT NULL DEFAULT 'submitted',
        "admin_notes" text,
        "quoted_price" numeric(12,2),
        "quote_message" text,
        "handled_by" uuid,
        "responded_at" TIMESTAMP,
        "converted_booking_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_custom_trip_requests" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_custom_trip_requests_number" UNIQUE ("request_number"),
        CONSTRAINT "FK_ctr_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ctr_status" ON "custom_trip_requests" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ctr_user_id" ON "custom_trip_requests" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ctr_created_at" ON "custom_trip_requests" ("created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "custom_trip_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "request_id" uuid NOT NULL,
        "item_type" varchar(20) NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "image" varchar(500),
        "quantity" integer NOT NULL DEFAULT 1,
        "unit_price" numeric(12,2) NOT NULL DEFAULT 0,
        "day_number" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_custom_trip_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cti_request" FOREIGN KEY ("request_id") REFERENCES "custom_trip_requests"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cti_request_id" ON "custom_trip_items" ("request_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "custom_trip_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "custom_trip_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trip_builder_options"`);
  }
}
