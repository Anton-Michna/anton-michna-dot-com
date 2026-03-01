import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Team } from './src/entities/team.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Team],
  migrations: ['src/migrations/*.ts'],
  ssl: { rejectUnauthorized: false },
});
