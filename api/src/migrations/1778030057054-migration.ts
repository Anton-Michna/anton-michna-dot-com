import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1778030057054 implements MigrationInterface {
  name = 'Migration1778030057054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the timeSeconds column
    await queryRunner.query(
      `ALTER TABLE "result" ADD "timeSeconds" double precision`,
    );

    // Convert existing time strings to seconds
    // Format is "MM:SS.ss" where MM is minutes, SS.ss is seconds with decimal
    // For DNF, DNS, DQ values, leave as NULL
    await queryRunner.query(`
            UPDATE "result" 
            SET "timeSeconds" = (
                SPLIT_PART(time, ':', 1)::FLOAT * 60 + 
                SPLIT_PART(time, ':', 2)::FLOAT
            )
            WHERE time !~ '^(DNF|DNS|DQ)$'
            AND time ~ '^[0-9]+:[0-9]+\\.?[0-9]*$'
        `);

    // Create index on timeSeconds for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_fcea67053be7ee20000251b55b" ON "result" ("timeSeconds") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcea67053be7ee20000251b55b"`,
    );
    await queryRunner.query(`ALTER TABLE "result" DROP COLUMN "timeSeconds"`);
  }
}
