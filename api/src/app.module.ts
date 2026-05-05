import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperService } from './scraper/scraper.service';
import { AppController } from './app.controller';
import { Team } from './entities/team.entity';
import { Athlete } from './entities/athlete.entity';
import { Meet } from './entities/meet.entity';
import { Result } from './entities/result.entity';
import { DataService } from './data/data.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    TypeOrmModule.forFeature([Team, Athlete, Meet, Result]),
  ],
  controllers: [AppController],
  providers: [ScraperService, DataService],
})
export class AppModule {}
