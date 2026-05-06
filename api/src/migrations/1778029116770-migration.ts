import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1778029116770 implements MigrationInterface {
  name = 'Migration1778029116770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add a temporary column to hold the converted dates
    await queryRunner.query(`ALTER TABLE "meet" ADD "date_temp" date`);

    // Convert existing date strings (MM/DD/YY format) to proper dates
    // Handle 2-digit years: <50 = 20xx, >=50 = 19xx
    await queryRunner.query(`
            UPDATE "meet" 
            SET "date_temp" = TO_DATE(
                SPLIT_PART(date, '/', 3) || '-' || 
                SPLIT_PART(date, '/', 1) || '-' || 
                SPLIT_PART(date, '/', 2),
                'YY-MM-DD'
            )
        `);

    // Drop the old varchar column
    await queryRunner.query(`ALTER TABLE "meet" DROP COLUMN "date"`);

    // Rename the temp column to date
    await queryRunner.query(
      `ALTER TABLE "meet" RENAME COLUMN "date_temp" TO "date"`,
    );

    // Make it NOT NULL
    await queryRunner.query(
      `ALTER TABLE "meet" ALTER COLUMN "date" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add a temporary column to hold the converted dates back to strings
    await queryRunner.query(
      `ALTER TABLE "meet" ADD "date_temp" character varying`,
    );

    // Convert dates back to MM/DD/YY format
    await queryRunner.query(`
            UPDATE "meet" 
            SET "date_temp" = TO_CHAR(date, 'MM/DD/YY')
        `);

    // Drop the date column
    await queryRunner.query(`ALTER TABLE "meet" DROP COLUMN "date"`);

    // Rename temp column back to date
    await queryRunner.query(
      `ALTER TABLE "meet" RENAME COLUMN "date_temp" TO "date"`,
    );

    // Make it NOT NULL
    await queryRunner.query(
      `ALTER TABLE "meet" ALTER COLUMN "date" SET NOT NULL`,
    );
  }
}
