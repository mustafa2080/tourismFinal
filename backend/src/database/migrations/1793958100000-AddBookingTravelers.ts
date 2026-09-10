import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds per-traveler details to bookings, and admin-controlled infant pricing.
 *  - booking_travelers: one row per adult/child/infant on a booking,
 *    storing name, nationality, passport/ID number, and date of birth.
 *  - packages.infant_price: price charged per infant traveler (default 0 / free),
 *    editable by admin per package.
 *  - bookings.persons_breakdown: JSON snapshot of {adults, children, infants}
 *    counts at time of booking (replaces the old adults/children/seniors split).
 */
export class AddBookingTravelers1793958100000 implements MigrationInterface {
  name = 'AddBookingTravelers1793958100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "packages"
      ADD COLUMN IF NOT EXISTS "infant_price" numeric(10,2) NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE TABLE "booking_travelers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "traveler_type" varchar(20) NOT NULL,
        "full_name" varchar(150) NOT NULL,
        "nationality" varchar(100) NOT NULL,
        "passport_number" varchar(50),
        "date_of_birth" date NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_travelers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bt_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bt_booking_id" ON "booking_travelers" ("booking_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_travelers"`);
    await queryRunner.query(`ALTER TABLE "packages" DROP COLUMN IF EXISTS "infant_price"`);
  }
}
