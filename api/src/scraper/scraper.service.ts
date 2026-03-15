/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { makeHttpRequest } from '../http-request';
import * as parser from 'htmlparser2';
import { selectAll, selectOne } from 'css-select';
import { Athlete } from '../entities/athlete.entity';
import { Team } from '../entities/team.entity';
import { Meet } from '../entities/meet.entity';
import { Result } from '../entities/result.entity';
import { AnyNode } from 'domhandler';

const SEARCH_RESULT_URL_START =
  'https://www.tfrrs.org/results_search_page.html?page=';

const SEARCH_RESULT_URL_END =
  '&search_query=&with_month=&with_sports=xc&with_states=&with_year=';

const RESULTS_BASE_URL = 'https://www.tfrrs.org';

export interface SearchPageScrapeResults {
  raceName: string;
  raceDate: string;
  urlToResults: string;
}

export interface TeamData {
  sourceTffrsId: string;
  name: string;
  gender: string;
  sport: string;
}

export interface AthleteData {
  sourceTffrsAthleteId: string;
  name: string;
  sport: string;
  sourceTffrsTeamId: string;
}

export interface MeetData {
  sourceTffrsMeetId: string;
  name: string;
  date: string;
}

export interface ResultData {
  sourceTffrsMeetId: string;
  sourceTffrsAthleteId: string;
  sourceTffrsTeamId: string;
  event: string;
  time: string;
  place: number;
}

@Injectable()
export class ScraperService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Meet)
    private meetRepository: Repository<Meet>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}

  @Cron('0 2 * * *') // Runs at 2 AM every day
  async runNightlyScrape() {
    // console.log("Starting nightly scrape");
    // await this.scrapeWebsite();
  }

  async getMeetById(sourceTffrsMeetId: string): Promise<Meet | null> {
    return await this.meetRepository.findOne({
      where: { sourceTffrsMeetId },
    });
  }

  async getResultUrlsFromList(params: {
    pageNum: number;
    teamName: string;
    gender: string;
  }): Promise<SearchPageScrapeResults[]> {
    const { pageNum } = params;

    const urlToScrape =
      SEARCH_RESULT_URL_START + pageNum + SEARCH_RESULT_URL_END;

    const searchPageListResponse = await makeHttpRequest(urlToScrape, 'GET');
    const dom = parser.parseDocument(searchPageListResponse.data);
    const tables = parser.DomUtils.getElementsByTagName('table', dom, true);
    const table = tables[0];
    const raceRows = parser.DomUtils.getElementsByTagName('tr', table, true);

    const raceNameDateUrl: SearchPageScrapeResults[] = raceRows
      .map((row) => {
        const eachTd = selectAll('td', row);
        const valueRow = selectOne('td a', row);
        const dateTd = eachTd.find((td) => td !== valueRow);
        let date = '';
        if (dateTd) {
          date = parser.DomUtils.textContent(dateTd);
        }

        let url = '';
        if (valueRow?.attribs['href'].includes('/xc/')) {
          url = RESULTS_BASE_URL + valueRow?.attribs['href'];
        }

        let raceName = '';
        if (valueRow) {
          raceName = parser.DomUtils.textContent(valueRow);
        }

        return { raceName: raceName, raceDate: date, urlToResults: url };
      })
      .filter((val) => val.urlToResults !== '')
      .filter((val) => val.raceDate !== '')
      .filter((val) => val.raceName !== '');

    return raceNameDateUrl;
  }

  async scrapeFullIndividualXcRaceResults(params: {
    vals: SearchPageScrapeResults;
    meet: Meet;
  }) {
    const { vals } = params;
    const url = vals.urlToResults;

    const response = await makeHttpRequest(url, 'GET');

    const dom = parser.parseDocument(response.data);

    const genders = ['Men', 'Women'] as const;

    const fullUpsertableTeams: TeamData[] = [];
    const fullUpsertableAthletes: AthleteData[] = [];
    const fullResultsToSave: ResultData[] = [];

    for (const gender of genders) {
      const { resultsToSave, upsertableAthletes, upsertableTeams } =
        this.scrapeGenderedMeetResults(dom, params.meet, gender) || {
          resultsToSave: [],
          upsertableAthletes: [],
          upsertableTeams: [],
        };

      fullResultsToSave.push(...resultsToSave);
      fullUpsertableAthletes.push(...upsertableAthletes);
      fullUpsertableTeams.push(...upsertableTeams);
    }

    await this.upsertTeams(fullUpsertableTeams);
    console.log('Teams finished upserting.');
    await this.upsertAthletes(fullUpsertableAthletes);
    console.log('Athletes finished upserting.');
    await this.upsertResults(fullResultsToSave);
    console.log('Results finished upserting.');
  }

  private scrapeGenderedMeetResults(
    dom: ReturnType<typeof parser.parseDocument>,
    meet: Meet,
    gender: 'Men' | 'Women',
  ): {
    resultsToSave: ResultData[];
    upsertableAthletes: AthleteData[];
    upsertableTeams: TeamData[];
  } | void {
    const individualResultsDiv = parser.DomUtils.findAll((elem) => {
      return (
        elem.type === 'tag' &&
        elem.name === 'h3' &&
        parser.DomUtils.textContent(elem).includes(gender) &&
        parser.DomUtils.textContent(elem).includes('Individual')
      );
    }, dom.children);

    if (!individualResultsDiv || individualResultsDiv.length === 0) {
      console.warn(`No individual results found for gender: ${gender}`);
      return;
    }

    const titleContent = parser.DomUtils.textContent(individualResultsDiv[0]);
    const match = titleContent.match(/\(([^)]+)\)/);
    const raceDistance = match ? match[1] : null;

    if (!raceDistance) {
      console.warn(`No race distance found for gender: ${gender}`);
      return;
    }

    const tables = parser.DomUtils.getElementsByTagName('table', dom, true);

    const filteredTables = tables
      .map((table) => {
        const matchingResult = individualResultsDiv.find(
          (result) => table.parentNode === result.parent?.parentNode,
        );

        if (matchingResult) {
          return table;
        }
      })
      .filter((table) => table !== undefined);

    const resultsToSave: ResultData[] = [];

    const upsertableAthletes: AthleteData[] = [];

    const upsertableTeams: TeamData[] = [];

    filteredTables.forEach((table) => {
      const rows = parser.DomUtils.getElementsByTagName(
        'tr',
        table as AnyNode,
        true,
      );

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const valueRow = selectAll('td', row);

        const teamLink = selectOne(
          'td:nth-child(4) a[href*="/teams/"]',
          valueRow,
        );
        if (!teamLink) {
          continue;
        }
        const teamHref = teamLink?.attribs?.href;
        const teamValue = teamHref?.match(/\/teams\/xc\/([^/.]+)/)?.[1];
        if (!teamValue) {
          continue;
        }

        const teamName = parser.DomUtils.textContent(teamLink);
        upsertableTeams.push({
          sourceTffrsId: teamValue,
          name: teamName,
          gender: gender,
          sport: 'xc',
        });

        const athleteLink = selectOne('a[href*="/athletes/"]', valueRow);
        const athleteHref = athleteLink?.attribs?.href;
        if (!athleteLink) {
          continue;
        }
        const athleteId = athleteHref?.match(/\/athletes\/(\d+)/)?.[1];
        if (!athleteId) {
          continue;
        }
        const athleteName = parser.DomUtils.textContent(athleteLink);
        upsertableAthletes.push({
          sourceTffrsAthleteId: athleteId,
          name: athleteName,
          sport: 'xc',
          sourceTffrsTeamId: teamValue,
        });

        const event = raceDistance;
        const time = parser.DomUtils.textContent(valueRow[5]);
        const placeText = parser.DomUtils.textContent(valueRow[0]);
        const place =
          placeText && typeof placeText === 'string'
            ? parseInt(placeText, 10)
            : 0;

        const result: {
          sourceTffrsMeetId: string;
          sourceTffrsAthleteId: string;
          sourceTffrsTeamId: string;
          event: string;
          time: string;
          place: number;
        } = {
          sourceTffrsMeetId: meet.sourceTffrsMeetId.toString(),
          sourceTffrsAthleteId: athleteId,
          sourceTffrsTeamId: teamValue,
          event,
          time,
          place,
        };

        resultsToSave.push(result);
      }
    });

    const uniqueTeams = Array.from(
      new Map(
        upsertableTeams.map((team) => [
          `${team.sourceTffrsId}-${team.gender}`,
          team,
        ]),
      ).values(),
    );

    return {
      resultsToSave,
      upsertableAthletes,
      upsertableTeams: uniqueTeams,
    };
  }

  async upsertTeam(teamData: TeamData) {
    const { sourceTffrsId, name, gender, sport } = teamData;

    const existingTeam = await this.teamRepository.findOne({
      where: { sourceTffrsId },
    });

    if (existingTeam) {
      existingTeam.name = name;
      existingTeam.gender = gender;
      existingTeam.sport = sport;
      return await this.teamRepository.save(existingTeam);
    } else {
      const newTeam = this.teamRepository.create({
        sourceTffrsId,
        name,
        gender,
        sport,
      });
      return await this.teamRepository.save(newTeam);
    }
  }

  async upsertTeams(teamsData: TeamData[]) {
    for (const teamData of teamsData) {
      await this.upsertTeam(teamData);
    }
  }

  async upsertAthlete(athleteData: AthleteData) {
    const { sourceTffrsAthleteId, name, sport, sourceTffrsTeamId } =
      athleteData;

    const team = await this.teamRepository.findOne({
      where: { sourceTffrsId: sourceTffrsTeamId },
    });

    if (!team) {
      console.warn(
        `Team with sourceTffrsId ${sourceTffrsTeamId} not found, skipping athlete.`,
      );
      return null;
    }

    const existingAthlete = await this.athleteRepository.findOne({
      where: { sourceTffrsAthleteId },
      relations: ['team'],
    });

    if (existingAthlete) {
      existingAthlete.name = name;
      existingAthlete.sport = sport;
      existingAthlete.team = team;
      return await this.athleteRepository.save(existingAthlete);
    } else {
      const newAthlete = this.athleteRepository.create({
        sourceTffrsAthleteId,
        name,
        sport,
        team,
      });
      return await this.athleteRepository.save(newAthlete);
    }
  }

  async upsertAthletes(athletesData: AthleteData[]) {
    for (const athleteData of athletesData) {
      await this.upsertAthlete(athleteData);
    }
  }

  async upsertMeet(meetData: MeetData) {
    const { sourceTffrsMeetId, name, date } = meetData;

    const existingMeet = await this.meetRepository.findOne({
      where: { sourceTffrsMeetId },
    });

    if (existingMeet) {
      existingMeet.name = name;
      existingMeet.date = date;
      return await this.meetRepository.save(existingMeet);
    } else {
      const newMeet = this.meetRepository.create({
        sourceTffrsMeetId,
        name,
        date,
      });
      return await this.meetRepository.save(newMeet);
    }
  }

  async upsertResult(resultData: ResultData) {
    const {
      sourceTffrsMeetId,
      sourceTffrsAthleteId,
      sourceTffrsTeamId,
      event,
      time,
      place,
    } = resultData;
    const meet = await this.meetRepository.findOne({
      where: { sourceTffrsMeetId },
    });

    if (!meet) {
      console.warn(
        `Meet with sourceTffrsMeetId ${sourceTffrsMeetId} not found, skipping result.`,
      );
      return null;
    }

    const athlete = await this.athleteRepository.findOne({
      where: { sourceTffrsAthleteId },
    });

    if (!athlete) {
      console.warn(
        `Athlete with sourceTffrsAthleteId ${sourceTffrsAthleteId} not found, skipping result.`,
      );
      return null;
    }

    const team = await this.teamRepository.findOne({
      where: { sourceTffrsId: sourceTffrsTeamId },
    });

    if (!team) {
      console.warn(
        `Team with sourceTffrsId ${sourceTffrsTeamId} not found, skipping result.`,
      );
      return null;
    }

    const existingResult = await this.resultRepository.findOne({
      where: {
        sourceTffrsMeetId,
        sourceTffrsAthleteId,
        event,
      },
      relations: ['meet', 'athlete', 'team'],
    });

    if (existingResult) {
      existingResult.time = time;
      existingResult.place = place;
      existingResult.team = team;
      existingResult.meet = meet;
      existingResult.athlete = athlete;
      existingResult.sourceTffrsTeamId = sourceTffrsTeamId;
      return await this.resultRepository.save(existingResult);
    } else {
      const newResult = this.resultRepository.create({
        meet,
        athlete,
        team,
        sourceTffrsMeetId,
        sourceTffrsAthleteId,
        sourceTffrsTeamId,
        event,
        time,
        place,
      });
      return await this.resultRepository.save(newResult);
    }
  }

  async upsertResults(resultsData: ResultData[]) {
    for (const resultData of resultsData) {
      await this.upsertResult(resultData);
    }
  }

  private async scrapeWebsite() {
    // Your scraping logic here
    // Example:
    // - Fetch website HTML
    // - Parse data
    // - Check database for duplicates
    // - Insert new records
  }
}
