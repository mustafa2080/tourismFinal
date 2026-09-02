import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: Create package_translations table
 * For dynamic auto-translation system
 */
export class CreatePackageTranslations1705425600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'package_translations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'package_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'destination',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'short_desc',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'long_desc',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'trip_type',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'inclusions',
            type: 'text',
            isArray: true,
            default: "'{}'",
            isNullable: true,
          },
          {
            name: 'exclusions',
            type: 'text',
            isArray: true,
            default: "'{}'",
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_package_translations_package_id',
            columnNames: ['package_id'],
            referencedTableName: 'packages',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        uniques: [
          {
            name: 'UQ_package_translations_package_language',
            columnNames: ['package_id', 'language'],
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'package_translations',
      new TableIndex({
        name: 'IDX_package_translations_package_id',
        columnNames: ['package_id'],
      })
    );

    await queryRunner.createIndex(
      'package_translations',
      new TableIndex({
        name: 'IDX_package_translations_language',
        columnNames: ['language'],
      })
    );

    await queryRunner.createIndex(
      'package_translations',
      new TableIndex({
        name: 'IDX_package_translations_created_at',
        columnNames: ['created_at'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex(
      'package_translations',
      'IDX_package_translations_created_at'
    );

    await queryRunner.dropIndex(
      'package_translations',
      'IDX_package_translations_language'
    );

    await queryRunner.dropIndex(
      'package_translations',
      'IDX_package_translations_package_id'
    );

    // Drop table
    await queryRunner.dropTable('package_translations', true);
  }
}
