import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773600821635 implements MigrationInterface {
  name = 'Migration1773600821635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "athlete" ("id" SERIAL NOT NULL, "athleteId" character varying NOT NULL, "name" character varying NOT NULL, "sport" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "teamId" integer, CONSTRAINT "REL_e0bfec0fa54ba8013b973368fa" UNIQUE ("teamId"), CONSTRAINT "PK_8bf51e0689529ca963f10949596" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meet" ("id" SERIAL NOT NULL, "meetId" character varying NOT NULL, CONSTRAINT "PK_9bd21c06b21abbe6c6306349d35" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "result" ("id" SERIAL NOT NULL, "event" character varying NOT NULL, "time" character varying NOT NULL, "place" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "meetId" integer, "athleteId" integer, "teamId" integer, CONSTRAINT "REL_e2e7d81ee6c5f558afdfa94784" UNIQUE ("meetId"), CONSTRAINT "REL_f901450f29bf48d041721bc405" UNIQUE ("athleteId"), CONSTRAINT "REL_92bd6bed32e6084d5981069cef" UNIQUE ("teamId"), CONSTRAINT "PK_c93b145f3c2e95f6d9e21d188e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" ADD "tffrsName" character varying NOT NULL`,
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
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "tffrsName"`);
    await queryRunner.query(`DROP TABLE "result"`);
    await queryRunner.query(`DROP TABLE "meet"`);
    await queryRunner.query(`DROP TABLE "athlete"`);
  }
}
