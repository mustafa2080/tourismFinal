/**
 * Migration: Add password reset fields to users table
 * Description: Add reset_token and reset_token_expires columns for password reset functionality
 */

export async function up(queryRunner) {
  // Add reset_token column
  await queryRunner.query(`
    ALTER TABLE "users"
    ADD COLUMN "reset_token" varchar(255) NULL;
  `);

  // Add reset_token_expires column
  await queryRunner.query(`
    ALTER TABLE "users"
    ADD COLUMN "reset_token_expires" TIMESTAMP NULL;
  `);

  console.log('✅ Migration completed: Added password reset fields');
}

export async function down(queryRunner) {
  // Remove reset_token column
  await queryRunner.query(`
    ALTER TABLE "users"
    DROP COLUMN "reset_token";
  `);

  // Remove reset_token_expires column
  await queryRunner.query(`
    ALTER TABLE "users"
    DROP COLUMN "reset_token_expires";
  `);

  console.log('✅ Migration rollback: Removed password reset fields');
}
