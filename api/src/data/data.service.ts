/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Athlete } from '../entities/athlete.entity';
import { DataSource, Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { Meet } from '../entities/meet.entity';
import { Result } from '../entities/result.entity';
import {
  AthleteResult,
  SingleMeetAthleteResult,
  TopKAverageResult,
} from './data-types';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Meet)
    private meetRepository: Repository<Meet>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getAthleteResults(athleteId: number): Promise<AthleteResult[]> {
    const results = await this.resultRepository.find({
      where: { athlete: { id: athleteId } },
      relations: ['athlete', 'team', 'meet'],
    });

    return results.map((result) => ({
      sport: 'Cross Country',
      gender: result.team.gender,
      teamName: result.team.name,
      meetName: result.meet.name,
      event: result.event,
      time: result.time,
      place: result.place,
    }));
  }

  async searchTeams(
    query: string,
  ): Promise<{ id: number; name: string; gender: string; sport: string }[]> {
    const teams = await this.teamRepository
      .createQueryBuilder('team')
      .select(['team.id', 'team.name', 'team.gender', 'team.sport'])
      .where('LOWER(team.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy(
        `CASE 
          WHEN LOWER(team.name) = LOWER(:exactMatch) THEN 1
          WHEN LOWER(team.name) LIKE LOWER(:startsWithMatch) THEN 2
          ELSE 3
        END`,
      )
      .addOrderBy('team.name', 'ASC')
      .setParameter('exactMatch', query)
      .setParameter('startsWithMatch', `${query}%`)
      .limit(10)
      .getMany();

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      gender: team.gender,
      sport: team.sport,
    }));
  }

  async searchAthletes(query: string): Promise<{ id: number; name: string }[]> {
    const athletes = await this.athleteRepository
      .createQueryBuilder('athlete')
      .select(['athlete.id', 'athlete.name'])
      .where('LOWER(athlete.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy(
        `CASE 
          WHEN LOWER(athlete.name) = LOWER(:exactMatch) THEN 1
          WHEN LOWER(athlete.name) LIKE LOWER(:startsWithMatch) THEN 2
          ELSE 3
        END`,
      )
      .addOrderBy('athlete.name', 'ASC')
      .setParameter('exactMatch', query)
      .setParameter('startsWithMatch', `${query}%`)
      .limit(10)
      .getMany();

    return athletes.map((athlete) => ({
      id: athlete.id,
      name: athlete.name,
    }));
  }

  async getFastestTeamAverages(params: {
    teamId: number;
    distance: string;
    sport: string;
    athleteCount: 5 | 7 | 9;
    resultCount: number;
  }): Promise<TopKAverageResult[]> {
    const { teamId, distance, sport, athleteCount, resultCount } = params;

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('ranked."meetId"')
      .addSelect('ranked."meetName"')
      .addSelect(`AVG(ranked."timeSeconds")`, 'averageTimeSeconds')
      .addSelect(
        `array_agg(
        json_build_object(
          'athleteName', ranked."athleteName",
          'athleteId', ranked."athleteId",
          'time', ranked.time,
          'place', ranked.place
        ) ORDER BY ranked."timeSeconds" ASC
      )`,
        'athleteResults',
      )
      .from((subQuery) => {
        return subQuery
          .select('r.time', 'time')
          .addSelect('r."timeSeconds"', 'timeSeconds')
          .addSelect('r.place', 'place')
          .addSelect('r."meetId"', 'meetId')
          .addSelect('m.name', 'meetName')
          .addSelect('a.name', 'athleteName')
          .addSelect('a.id', 'athleteId')
          .addSelect(
            `ROW_NUMBER() OVER (PARTITION BY r."meetId" ORDER BY r."timeSeconds" ASC)`,
            'rn',
          )
          .addSelect(
            'COUNT(*) OVER (PARTITION BY r."meetId")',
            'meetResultCount',
          )
          .from(Team, 't')
          .innerJoin(
            Result,
            'r',
            'r.teamId = t.id AND r."timeSeconds" IS NOT NULL',
          )
          .innerJoin(Athlete, 'a', 'a.id = r.athleteId')
          .innerJoin(Meet, 'm', 'm.id = r.meetId')
          .where('t.id = :teamId', { teamId })
          .andWhere('r.event = :distance', { distance })
          .andWhere('t.sport = :sport', { sport });
      }, 'ranked')
      .where('ranked.rn <= :limit', { limit: athleteCount })
      .andWhere('ranked."meetResultCount" >= :athleteCount', { athleteCount })
      .groupBy('ranked."meetId"')
      .addGroupBy('ranked."meetName"')
      .orderBy('"averageTimeSeconds"', 'ASC')
      .limit(resultCount)
      .getRawMany();

    return rows.map((row) => ({
      meetName: row.meetName,
      averageTime: this.secondsToTime(parseFloat(row.averageTimeSeconds)),
      athleteResults: row.athleteResults.map((r: SingleMeetAthleteResult) => ({
        athleteName: r.athleteName,
        athleteId: r.athleteId,
        time: r.time,
        place: r.place,
      })),
    }));
  }

  async getTeamDistancePossibilities(teamId: number): Promise<string[]> {
    const distances = await this.resultRepository
      .createQueryBuilder('r')
      .select('DISTINCT r.event', 'distance')
      .innerJoin('r.team', 't')
      .where('t.id = :teamId', { teamId })
      .getRawMany<{ distance: string }>();

    return distances.map((d) => d.distance);
  }

  private secondsToTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.round((seconds % 1) * 100);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }
}
