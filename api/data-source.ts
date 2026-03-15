import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Team } from './src/entities/team.entity';
import { Athlete } from './src/entities/athlete.entity';
import { Meet } from './src/entities/meet.entity';
import { Result } from './src/entities/result.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Team, Athlete, Meet, Result],
  migrations: ['src/migrations/*.ts'],
  ssl: { rejectUnauthorized: false },
});
