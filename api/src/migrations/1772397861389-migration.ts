import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772397861389 implements MigrationInterface {
  name = 'Migration1772397861389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "gender" character varying NOT NULL, "sport" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team"`);
  }
}
