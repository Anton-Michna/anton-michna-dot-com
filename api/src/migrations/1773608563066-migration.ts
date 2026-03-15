import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773608563066 implements MigrationInterface {
  name = 'Migration1773608563066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team" RENAME COLUMN "tffrsName" TO "sourceTffrsId"`,
    );
    await queryRunner.query(`ALTER TABLE "athlete" DROP COLUMN "athleteId"`);
    await queryRunner.query(`ALTER TABLE "meet" DROP COLUMN "meetId"`);
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD "sourceTffrsAthleteId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD CONSTRAINT "UQ_db9617e8b1ac4d3cd7c367f5e45" UNIQUE ("sourceTffrsAthleteId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" ADD "sourceTffrsMeetId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" ADD CONSTRAINT "UQ_d7e1602c364254ac1cfc7cfffe0" UNIQUE ("sourceTffrsMeetId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" ADD "date" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD "sourceTffrsMeetId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD "sourceTffrsAthleteId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD "sourceTffrsTeamId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "UQ_2ae065647a95d933f5a4c54b19c" UNIQUE ("sourceTffrsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" DROP CONSTRAINT "FK_e0bfec0fa54ba8013b973368fa8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" DROP CONSTRAINT "REL_e0bfec0fa54ba8013b973368fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "FK_e2e7d81ee6c5f558afdfa94784d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "FK_f901450f29bf48d041721bc4053"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "FK_92bd6bed32e6084d5981069cef5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "REL_e2e7d81ee6c5f558afdfa94784"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "REL_f901450f29bf48d041721bc405"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "REL_92bd6bed32e6084d5981069cef"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ae065647a95d933f5a4c54b19" ON "team" ("sourceTffrsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db9617e8b1ac4d3cd7c367f5e4" ON "athlete" ("sourceTffrsAthleteId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7e1602c364254ac1cfc7cfffe" ON "meet" ("sourceTffrsMeetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b45be9d86f40983c6d3fac9324" ON "result" ("sourceTffrsMeetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93e9e1c8bc51912fb58871a638" ON "result" ("sourceTffrsAthleteId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1da8a03bc8f1c14d3fe7a1b4d9" ON "result" ("sourceTffrsTeamId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fcd0763239909924cf3d18ad84" ON "result" ("sourceTffrsMeetId", "sourceTffrsAthleteId", "event") `,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD CONSTRAINT "FK_e0bfec0fa54ba8013b973368fa8" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "FK_e2e7d81ee6c5f558afdfa94784d" FOREIGN KEY ("meetId") REFERENCES "meet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "FK_f901450f29bf48d041721bc4053" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "FK_92bd6bed32e6084d5981069cef5" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "FK_92bd6bed32e6084d5981069cef5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "FK_f901450f29bf48d041721bc4053"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP CONSTRAINT "FK_e2e7d81ee6c5f558afdfa94784d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" DROP CONSTRAINT "FK_e0bfec0fa54ba8013b973368fa8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcd0763239909924cf3d18ad84"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1da8a03bc8f1c14d3fe7a1b4d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93e9e1c8bc51912fb58871a638"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b45be9d86f40983c6d3fac9324"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d7e1602c364254ac1cfc7cfffe"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db9617e8b1ac4d3cd7c367f5e4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ae065647a95d933f5a4c54b19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "REL_92bd6bed32e6084d5981069cef" UNIQUE ("teamId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "REL_f901450f29bf48d041721bc405" UNIQUE ("athleteId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "REL_e2e7d81ee6c5f558afdfa94784" UNIQUE ("meetId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "FK_92bd6bed32e6084d5981069cef5" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "FK_f901450f29bf48d041721bc4053" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" ADD CONSTRAINT "FK_e2e7d81ee6c5f558afdfa94784d" FOREIGN KEY ("meetId") REFERENCES "meet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD CONSTRAINT "REL_e0bfec0fa54ba8013b973368fa" UNIQUE ("teamId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD CONSTRAINT "FK_e0bfec0fa54ba8013b973368fa8" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "UQ_2ae065647a95d933f5a4c54b19c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP COLUMN "sourceTffrsTeamId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP COLUMN "sourceTffrsAthleteId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "result" DROP COLUMN "sourceTffrsMeetId"`,
    );
    await queryRunner.query(`ALTER TABLE "meet" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "meet" DROP COLUMN "date"`);
    await queryRunner.query(`ALTER TABLE "meet" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "meet" DROP CONSTRAINT "UQ_d7e1602c364254ac1cfc7cfffe0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" DROP COLUMN "sourceTffrsMeetId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" DROP CONSTRAINT "UQ_db9617e8b1ac4d3cd7c367f5e45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" DROP COLUMN "sourceTffrsAthleteId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meet" ADD "meetId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "athlete" ADD "athleteId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" RENAME COLUMN "sourceTffrsId" TO "tffrsName"`,
    );
  }
}
