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

const TFFRS_SEARCH_RESULT_URL =
  'https://www.tfrrs.org/results_search_page.html';

const RESULTS_BASE_URL = 'https://www.tfrrs.org';

export interface SearchPageScrapeResults {
  raceName: string;
  raceDate: string;
  urlToResults: string;
  sourceTffrsMeetId: string;
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
  // Cache for database lookups
  private teamCache = new Map<string, Team>();
  private athleteCache = new Map<string, Athlete>();
  private meetCache = new Map<string, Meet>();

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
    // Check cache first
    if (this.meetCache.has(sourceTffrsMeetId)) {
      return this.meetCache.get(sourceTffrsMeetId)!;
    }
    const meet = await this.meetRepository.findOne({
      where: { sourceTffrsMeetId },
    });

    // Store in cache if found
    if (meet) {
      this.meetCache.set(sourceTffrsMeetId, meet);
    }

    return meet;
  }

  async fullScrapeXcResults(params: { month?: string; year?: string }) {
    const { month, year } = params;
    const totalPages = await this.getTotalXcPagesByMonth(month, year);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const urls = await this.getResultUrlsFromList({ pageNum, month, year });

      const MEET_BATCH_SIZE = 5;
      for (let i = 0; i < urls.length; i += MEET_BATCH_SIZE) {
        const batch = urls.slice(i, i + MEET_BATCH_SIZE);

        await Promise.all(
          batch.map(async (vals) => {
            const meet = await this.getMeetById(vals.sourceTffrsMeetId);
            if (!meet) {
              console.warn(
                `Meet with sourceTffrsMeetId ${vals.sourceTffrsMeetId} not found, skipping scrape for this meet.`,
              );
              return;
            }
            await this.scrapeFullIndividualXcRaceResults({
              vals,
              meet,
            });
          }),
        );
      }
    }
  }

  async getTotalXcPagesByMonth(month?: string, year?: string): Promise<number> {
    const searchUrl =
      TFFRS_SEARCH_RESULT_URL +
      this.buildSearchUrlEnd({
        month,
        year,
        sport: 'xc',
      });

    const response = await makeHttpRequest(searchUrl, 'GET');
    const dom = parser.parseDocument(response.data);

    const numResultsDiv = selectOne(
      '.card.card-body.bg-light.d-block.p-3.my-3',
      dom,
    );

    let numResults = '';

    if (numResultsDiv) {
      const bTags = selectAll('b', numResultsDiv);
      if (bTags[1]) {
        const numRow = bTags[1];
        numResults = parser.DomUtils.textContent(numRow);
      }
    }

    if (numResults === '') {
      return 0;
    }
    const numPages = Math.ceil(parseInt(numResults) / 30);
    return numPages;
  }

  async getResultUrlsFromList(params: {
    pageNum: number;
    month?: string;
    year?: string;
  }): Promise<SearchPageScrapeResults[]> {
    const { pageNum, month, year } = params;
    const urlToScrape =
      TFFRS_SEARCH_RESULT_URL +
      this.buildSearchUrlEnd({
        month,
        year,
        sport: 'xc',
        page: pageNum,
      });

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
        let sourceTffrsMeetId = '';
        if (valueRow?.attribs['href'].includes('/xc/')) {
          url = RESULTS_BASE_URL + valueRow?.attribs['href'];
          const match = valueRow.attribs['href'].match(/\/xc\/(\d+)/);
          sourceTffrsMeetId = match ? match[1] : '';
        }

        let raceName = '';
        if (valueRow) {
          raceName = parser.DomUtils.textContent(valueRow);
        }

        return {
          raceName: raceName,
          raceDate: date,
          urlToResults: url,
          sourceTffrsMeetId,
        };
      })
      .filter((val) => val.urlToResults !== '')
      .filter((val) => val.raceDate !== '')
      .filter((val) => val.raceName !== '');

    const meetsToSave: MeetData[] = raceNameDateUrl.map((result) => ({
      sourceTffrsMeetId: result.sourceTffrsMeetId,
      name: result.raceName,
      date: result.raceDate,
    }));

    await this.upsertMeets(meetsToSave);
    console.log(`Page ${pageNum}: Meets finished upserting.`);

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

    for (const gender of genders) {
      const { resultsToSave, upsertableAthletes, upsertableTeams } =
        this.scrapeGenderedMeetResults(dom, params.meet, gender) || {
          resultsToSave: [],
          upsertableAthletes: [],
          upsertableTeams: [],
        };

      await this.upsertTeams(upsertableTeams);
      console.log(
        `${gender} Teams for meet ${params.meet.name} finished upserting.`,
      );
      await this.upsertAthletes(upsertableAthletes);
      console.log(
        `${gender} Athletes for meet ${params.meet.name} finished upserting.`,
      );
      await this.upsertResults(resultsToSave);
      console.log(
        `${gender} Results for meet ${params.meet.name} finished upserting.`,
      );
    }
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
        // Id is only numbers when club team or unattached. skip those
        if (typeof teamValue === 'string' && /^\d+$/.test(teamValue)) {
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

    if (this.teamCache.has(sourceTffrsId)) {
      return this.teamCache.get(sourceTffrsId)!;
    }

    const existingTeam = await this.teamRepository.findOne({
      where: { sourceTffrsId },
    });

    if (!existingTeam) {
      const newTeam = this.teamRepository.create({
        sourceTffrsId,
        name,
        gender,
        sport,
      });
      const savedTeam = await this.teamRepository.save(newTeam);
      this.teamCache.set(sourceTffrsId, savedTeam);
      return savedTeam;
    } else {
      this.teamCache.set(sourceTffrsId, existingTeam);
      return existingTeam;
    }
  }

  async upsertTeams(teamsData: TeamData[]) {
    if (teamsData.length === 0) return;

    await this.teamRepository.upsert(
      teamsData.map((data) => ({
        sourceTffrsId: data.sourceTffrsId,
        name: data.name,
        gender: data.gender,
        sport: data.sport,
      })),
      ['sourceTffrsId'], // conflict target
    );

    // Update cache with newly upserted teams
    const upsertedTeams = await this.teamRepository.find({
      where: teamsData.map((data) => ({
        sourceTffrsId: data.sourceTffrsId,
      })),
    });

    upsertedTeams.forEach((team) => {
      this.teamCache.set(team.sourceTffrsId, team);
    });
  }

  async upsertAthlete(athleteData: AthleteData) {
    const { sourceTffrsAthleteId, name, sport, sourceTffrsTeamId } =
      athleteData;

    if (this.athleteCache.has(sourceTffrsAthleteId)) {
      return this.athleteCache.get(sourceTffrsAthleteId)!;
    }

    // Get team from cache or database
    let team = this.teamCache.get(sourceTffrsTeamId);
    if (!team) {
      const foundTeam = await this.teamRepository.findOne({
        where: { sourceTffrsId: sourceTffrsTeamId },
      });
      if (foundTeam) {
        team = foundTeam;
        this.teamCache.set(sourceTffrsTeamId, foundTeam);
      }
    }

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

    if (!existingAthlete) {
      const newAthlete = this.athleteRepository.create({
        sourceTffrsAthleteId,
        name,
        sport,
        team,
      });
      const savedAthlete = await this.athleteRepository.save(newAthlete);
      this.athleteCache.set(sourceTffrsAthleteId, savedAthlete);
      return savedAthlete;
    } else {
      this.athleteCache.set(sourceTffrsAthleteId, existingAthlete);
      return existingAthlete;
    }
  }

  async upsertAthletes(athletesData: AthleteData[]) {
    if (athletesData.length === 0) return;

    // --- Fetch all relevant teams ---
    const teamIds = [...new Set(athletesData.map((a) => a.sourceTffrsTeamId))];
    const teams = await this.teamRepository.find({
      where: teamIds.map((id) => ({ sourceTffrsId: id })),
    });

    // --- Create team lookup map ---
    const teamMap = new Map(teams.map((t) => [String(t.sourceTffrsId), t.id]));

    // Update team cache
    teams.forEach((team) => this.teamCache.set(team.sourceTffrsId, team));

    // --- Filter valid athletes ---
    const validAthletes = athletesData
      .filter((athlete) => {
        const hasValidTeam = teamMap.has(String(athlete.sourceTffrsTeamId));
        if (!hasValidTeam) {
          console.warn(
            `Team with sourceTffrsId ${athlete.sourceTffrsTeamId} not found, skipping athlete.`,
          );
        }
        return hasValidTeam;
      })
      .map((athlete) => ({
        sourceTffrsAthleteId: String(athlete.sourceTffrsAthleteId),
        name: athlete.name,
        sport: athlete.sport,
        team: { id: teamMap.get(String(athlete.sourceTffrsTeamId))! },
      }));

    if (validAthletes.length === 0) return;

    // --- Deduplicate athletes ---
    const athleteMap = new Map<string, (typeof validAthletes)[0]>();
    validAthletes.forEach((athlete) => {
      const key = athlete.sourceTffrsAthleteId;
      if (athleteMap.has(key)) {
        console.warn(
          `Duplicate athlete detected: ID=${key}, Name=${athlete.name}`,
        );
      } else {
        athleteMap.set(key, athlete);
      }
    });

    const uniqueAthletes = Array.from(athleteMap.values());

    if (uniqueAthletes.length < validAthletes.length) {
      console.warn(
        `Removed ${validAthletes.length - uniqueAthletes.length} duplicate athletes`,
      );
      const removedIds = validAthletes
        .map((a) => a.sourceTffrsAthleteId)
        .filter((id) => !athleteMap.has(id));
      console.warn(`Duplicate athlete IDs removed: ${removedIds.join(', ')}`);
    }

    // --- Bulk upsert ---
    await this.athleteRepository.upsert(uniqueAthletes, [
      'sourceTffrsAthleteId',
    ]);

    // --- Update cache with newly upserted athletes ---
    const upsertedAthletes = await this.athleteRepository.find({
      where: uniqueAthletes.map((a) => ({
        sourceTffrsAthleteId: a.sourceTffrsAthleteId,
      })),
    });

    upsertedAthletes.forEach((athlete) =>
      this.athleteCache.set(athlete.sourceTffrsAthleteId, athlete),
    );

    console.log(`Upserted ${upsertedAthletes.length} athletes successfully.`);
  }

  async upsertMeet(meetData: MeetData) {
    const { sourceTffrsMeetId, name, date } = meetData;

    const existingMeet = await this.meetRepository.findOne({
      where: { sourceTffrsMeetId },
    });

    if (!existingMeet) {
      const newMeet = this.meetRepository.create({
        sourceTffrsMeetId,
        name,
        date,
      });
      return await this.meetRepository.save(newMeet);
    }
  }

  async upsertMeets(meetsData: MeetData[]) {
    if (meetsData.length === 0) return;

    await this.meetRepository.upsert(
      meetsData.map((data) => ({
        sourceTffrsMeetId: data.sourceTffrsMeetId,
        name: data.name,
        date: data.date,
      })),
      ['sourceTffrsMeetId'], // conflict target
    );

    // Update cache with newly upserted meets
    const upsertedMeets = await this.meetRepository.find({
      where: meetsData.map((data) => ({
        sourceTffrsMeetId: data.sourceTffrsMeetId,
      })),
    });

    upsertedMeets.forEach((meet) => {
      this.meetCache.set(meet.sourceTffrsMeetId, meet);
    });
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

    if (!existingResult) {
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
    if (resultsData.length === 0) return;

    // --- Fetch referenced entities ---
    const meetIds = [
      ...new Set(resultsData.map((r) => String(r.sourceTffrsMeetId))),
    ];
    const athleteIds = [
      ...new Set(resultsData.map((r) => String(r.sourceTffrsAthleteId))),
    ];
    const teamIds = [
      ...new Set(resultsData.map((r) => String(r.sourceTffrsTeamId))),
    ];

    const [meets, athletes, teams] = await Promise.all([
      this.meetRepository.find({
        where: meetIds.map((id) => ({ sourceTffrsMeetId: id })),
      }),
      this.athleteRepository.find({
        where: athleteIds.map((id) => ({ sourceTffrsAthleteId: id })),
      }),
      this.teamRepository.find({
        where: teamIds.map((id) => ({ sourceTffrsId: id })),
      }),
    ]);

    // --- Create lookup maps (all IDs as strings) ---
    const meetMap = new Map(
      meets.map((m) => [String(m.sourceTffrsMeetId), m.id]),
    );
    const athleteMap = new Map(
      athletes.map((a) => [String(a.sourceTffrsAthleteId), a.id]),
    );
    const teamMap = new Map(teams.map((t) => [String(t.sourceTffrsId), t.id]));

    // --- Filter valid results ---
    const validResults = resultsData
      .filter((r) => {
        const meetId = String(r.sourceTffrsMeetId ?? 'MISSING');
        const athleteId = String(r.sourceTffrsAthleteId ?? 'MISSING');
        const teamId = String(r.sourceTffrsTeamId ?? 'MISSING');

        const hasValidRefs =
          meetMap.has(meetId) &&
          athleteMap.has(athleteId) &&
          teamMap.has(teamId);

        if (!hasValidRefs) {
          console.warn(
            `Skipping result - missing reference: meet=${meetId}, athlete=${athleteId}, team=${teamId}`,
          );
        }
        return hasValidRefs;
      })
      .map((r) => {
        const meetId = String(r.sourceTffrsMeetId);
        const athleteId = String(r.sourceTffrsAthleteId);
        const teamId = String(r.sourceTffrsTeamId);

        return {
          meet: { id: meetMap.get(meetId)! },
          athlete: { id: athleteMap.get(athleteId)! },
          team: { id: teamMap.get(teamId)! },
          sourceTffrsMeetId: meetId,
          sourceTffrsAthleteId: athleteId,
          sourceTffrsTeamId: teamId,
          event: r.event,
          time: r.time,
          place: r.place,
        };
      });

    if (validResults.length === 0) return;

    // --- Deduplicate results ---
    const resultMap = new Map<string, (typeof validResults)[0]>();
    validResults.forEach((r) => {
      const key = `${r.sourceTffrsMeetId}-${r.sourceTffrsAthleteId}-${r.event}`;
      if (resultMap.has(key)) {
        console.warn(
          `Duplicate result detected: MeetID=${r.sourceTffrsMeetId}, AthleteID=${r.sourceTffrsAthleteId}, TeamID=${r.sourceTffrsTeamId}, Event=${r.event}, Time=${r.time}, Place=${r.place}`,
        );
      } else {
        resultMap.set(key, r);
      }
    });

    const uniqueResults = Array.from(resultMap.values());

    if (uniqueResults.length < validResults.length) {
      console.warn(
        `Removed ${validResults.length - uniqueResults.length} duplicate results`,
      );

      const removedKeys = validResults
        .map(
          (r) => `${r.sourceTffrsMeetId}-${r.sourceTffrsAthleteId}-${r.event}`,
        )
        .filter((key) => !resultMap.has(key));

      console.warn(`Duplicate result keys removed: ${removedKeys.join(', ')}`);
    }

    // --- Bulk upsert ---
    await this.resultRepository.upsert(uniqueResults, {
      conflictPaths: ['sourceTffrsMeetId', 'sourceTffrsAthleteId', 'event'],
    });

    console.log(`Upserted ${uniqueResults.length} results successfully.`);
  }

  private buildSearchUrlEnd(params: {
    month?: string;
    year?: string;
    sport?: string;
    page?: number;
  }): string {
    const { month, year, sport, page } = params;
    const pageParam = page ? `page=${page}&` : '';
    return `?${pageParam}search_query=&with_month=${month || ''}&with_sports=${sport || ''}&with_states=&with_year=${year || ''}`;
  }

  async getEarliestData(): Promise<{
    earliestMonth: string | null;
    earliestYear: string | null;
  }> {
    const earliestMeets = await this.meetRepository.find({
      order: {
        date: 'ASC',
      },
      take: 1,
    });

    if (!earliestMeets || earliestMeets.length === 0) {
      return { earliestMonth: null, earliestYear: null };
    }

    const earliestMeet = earliestMeets[0];
    const dateParts = earliestMeet.date.split('/');
    if (dateParts.length >= 3) {
      const month = dateParts[0]; // Month
      const year = dateParts[2]; // Year
      return { earliestMonth: month, earliestYear: year };
    }

    return { earliestMonth: null, earliestYear: null };
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
