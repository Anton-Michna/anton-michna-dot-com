/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { makeHttpRequest } from '../http-request';
import * as parser from 'htmlparser2';
import { selectAll, selectOne } from 'css-select';
import { Athlete } from '../entities/athlete.entity';
import { Team } from '../entities/team.entity';
import { Meet } from '../entities/meet.entity';
import { Result } from '../entities/result.entity';
import { AnyNode } from 'domhandler';
import sharp from 'sharp';

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
  date: Date;
}

export interface ResultData {
  sourceTffrsMeetId: string;
  sourceTffrsAthleteId: string;
  sourceTffrsTeamId: string;
  event: string;
  time: string;
  timeSeconds: number | null;
  place: number;
}

@Injectable()
export class ScraperService {
  // Cache for meet lookups within a scrape run
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

  async runNightlyScrape() {
    const now = new Date();
    for (let i = 0; i < 2; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = (date.getMonth() + 1).toString();
      const year = date.getFullYear().toString();
      try {
        console.log(`Nightly scrape: scraping ${month}/${year}`);
        await this.fullScrapeXcResults({ month, year });
      } catch (error) {
        console.error(`Nightly scrape failed for ${month}/${year}:`, error);
      }
    }
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
      if (bTags.length > 0) {
        const numRow = bTags.length > 1 ? bTags[1] : bTags[0];
        const textContent = parser.DomUtils.textContent(numRow);
        numResults = textContent.replace(/\D/g, ''); // Remove all non-digit characters
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

    const meetsToSave: MeetData[] = raceNameDateUrl
      .map((result) => {
        // Convert date string "MM/DD/YY" to Date object
        const parts = result.raceDate.split('/');
        if (parts.length !== 3) {
          console.warn(`Invalid date format: "${result.raceDate}"`);
          return null;
        }

        const [month, day, year] = parts;
        const yearNum = parseInt(year, 10);

        if (isNaN(yearNum)) {
          console.warn(`Invalid year in date: "${result.raceDate}"`);
          return null;
        }

        const fullYear = yearNum < 50 ? `20${year}` : `19${year}`;
        const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const date = new Date(isoDate);

        // Check if the Date is valid
        if (isNaN(date.getTime())) {
          console.warn(
            `Invalid date created from: "${result.raceDate}" -> "${isoDate}"`,
          );
          return null;
        }

        return {
          sourceTffrsMeetId: result.sourceTffrsMeetId,
          name: result.raceName,
          date,
        };
      })
      .filter((meet): meet is MeetData => meet !== null);

    await this.upsertMeets(meetsToSave);
    console.log(`Page ${pageNum}: Meets finished upserting.`);

    return raceNameDateUrl;
  }

  async scrapeFullIndividualXcRaceResults(params: {
    vals: SearchPageScrapeResults;
    meet: Meet;
  }) {
    const { vals, meet } = params;
    const url = vals.urlToResults;

    const response = await makeHttpRequest(url, 'GET');

    const dom = parser.parseDocument(response.data);

    const genders = ['Men', 'Women'] as const;

    const resultsToSave: ResultData[] = [];
    const upsertableAthletes: AthleteData[] = [];
    const upsertableTeams: TeamData[] = [];

    for (const gender of genders) {
      const genderResults = this.scrapeGenderedMeetResults(dom, meet, gender);
      if (!genderResults) continue;
      resultsToSave.push(...genderResults.resultsToSave);
      upsertableAthletes.push(...genderResults.upsertableAthletes);
      upsertableTeams.push(...genderResults.upsertableTeams);
    }

    // Teams -> athletes -> results, since each step's FKs depend on the previous step's ids
    const teamIdMap = await this.upsertTeams(upsertableTeams);
    const athleteIdMap = await this.upsertAthletes(
      upsertableAthletes,
      teamIdMap,
    );
    await this.upsertResults(resultsToSave, meet, teamIdMap, athleteIdMap);

    console.log(`Meet ${meet.name} finished upserting.`);
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

        const result: ResultData = {
          sourceTffrsMeetId: meet.sourceTffrsMeetId.toString(),
          sourceTffrsAthleteId: athleteId,
          sourceTffrsTeamId: teamValue,
          event,
          time,
          timeSeconds: this.timeStringToSeconds(time),
          place,
        };

        resultsToSave.push(result);
      }
    });

    return {
      resultsToSave,
      upsertableAthletes,
      upsertableTeams,
    };
  }

  // Upserts teams and returns a map of sourceTffrsId -> db id, read from the
  // upsert's own RETURNING clause so no follow-up SELECT is needed.
  //
  // Deliberately uses createQueryBuilder().orUpdate() with an explicit
  // overwrite column list instead of Repository.upsert(): the latter
  // includes every settable column - including the generated primary key -
  // in its ON CONFLICT DO UPDATE SET clause, which reassigns a *new* id to
  // an already-existing row on every conflict and breaks FK references from
  // athletes/results already pointing at the old id.
  async upsertTeams(teamsData: TeamData[]): Promise<Map<string, number>> {
    const teamIdMap = new Map<string, number>();
    if (teamsData.length === 0) return teamIdMap;

    const uniqueTeams = Array.from(
      new Map(teamsData.map((team) => [team.sourceTffrsId, team])).values(),
    );

    const result = await this.teamRepository
      .createQueryBuilder()
      .insert()
      .values(uniqueTeams)
      .orUpdate(['name', 'gender', 'sport'], ['sourceTffrsId'])
      .returning(['id', 'sourceTffrsId'])
      .execute();

    (result.raw as { id: number; sourceTffrsId: string }[]).forEach((row) => {
      teamIdMap.set(row.sourceTffrsId, row.id);
    });

    return teamIdMap;
  }

  // Upserts athletes using an already-resolved team id map (avoids re-querying
  // teams that were just upserted moments earlier for the same meet).
  async upsertAthletes(
    athletesData: AthleteData[],
    teamIdMap: Map<string, number>,
  ): Promise<Map<string, number>> {
    const athleteIdMap = new Map<string, number>();
    if (athletesData.length === 0) return athleteIdMap;

    const validAthletes = athletesData.filter((athlete) => {
      const hasValidTeam = teamIdMap.has(athlete.sourceTffrsTeamId);
      if (!hasValidTeam) {
        console.warn(
          `Team with sourceTffrsId ${athlete.sourceTffrsTeamId} not found, skipping athlete.`,
        );
      }
      return hasValidTeam;
    });

    const uniqueAthletes = Array.from(
      new Map(
        validAthletes.map((athlete) => [athlete.sourceTffrsAthleteId, athlete]),
      ).values(),
    );

    if (uniqueAthletes.length === 0) return athleteIdMap;

    const result = await this.athleteRepository
      .createQueryBuilder()
      .insert()
      .values(
        uniqueAthletes.map((athlete) => ({
          sourceTffrsAthleteId: athlete.sourceTffrsAthleteId,
          name: athlete.name,
          sport: athlete.sport,
          team: { id: teamIdMap.get(athlete.sourceTffrsTeamId)! },
        })),
      )
      .orUpdate(['name', 'sport', 'teamId'], ['sourceTffrsAthleteId'])
      .returning(['id', 'sourceTffrsAthleteId'])
      .execute();

    (result.raw as { id: number; sourceTffrsAthleteId: string }[]).forEach(
      (row) => {
        athleteIdMap.set(row.sourceTffrsAthleteId, row.id);
      },
    );

    return athleteIdMap;
  }

  async upsertMeets(meetsData: MeetData[]) {
    if (meetsData.length === 0) return;

    const uniqueMeets = Array.from(
      new Map(meetsData.map((meet) => [meet.sourceTffrsMeetId, meet])).values(),
    );

    const result = await this.meetRepository
      .createQueryBuilder()
      .insert()
      .values(uniqueMeets)
      .orUpdate(['name', 'date'], ['sourceTffrsMeetId'])
      .returning(['id', 'sourceTffrsMeetId'])
      .execute();

    const meetDataById = new Map(
      uniqueMeets.map((meetData) => [meetData.sourceTffrsMeetId, meetData]),
    );

    (result.raw as { id: number; sourceTffrsMeetId: string }[]).forEach(
      (row) => {
        const meetData = meetDataById.get(row.sourceTffrsMeetId)!;
        const meet = this.meetRepository.create({
          id: row.id,
          sourceTffrsMeetId: row.sourceTffrsMeetId,
          name: meetData.name,
          date: meetData.date,
        });
        this.meetCache.set(row.sourceTffrsMeetId, meet);
      },
    );
  }

  // Upserts results for a single meet using already-resolved team/athlete id
  // maps, so no lookup queries are needed at all.
  async upsertResults(
    resultsData: ResultData[],
    meet: Meet,
    teamIdMap: Map<string, number>,
    athleteIdMap: Map<string, number>,
  ) {
    if (resultsData.length === 0) return;

    const validResults = resultsData.filter((r) => {
      const hasValidRefs =
        athleteIdMap.has(r.sourceTffrsAthleteId) &&
        teamIdMap.has(r.sourceTffrsTeamId);
      if (!hasValidRefs) {
        console.warn(
          `Skipping result - missing reference: athlete=${r.sourceTffrsAthleteId}, team=${r.sourceTffrsTeamId}`,
        );
      }
      return hasValidRefs;
    });

    const uniqueResults = Array.from(
      new Map(
        validResults.map((r) => [`${r.sourceTffrsAthleteId}-${r.event}`, r]),
      ).values(),
    );

    if (uniqueResults.length === 0) return;

    await this.resultRepository
      .createQueryBuilder()
      .insert()
      .values(
        uniqueResults.map((r) => ({
          meet: { id: meet.id },
          athlete: { id: athleteIdMap.get(r.sourceTffrsAthleteId)! },
          team: { id: teamIdMap.get(r.sourceTffrsTeamId)! },
          sourceTffrsMeetId: r.sourceTffrsMeetId,
          sourceTffrsAthleteId: r.sourceTffrsAthleteId,
          sourceTffrsTeamId: r.sourceTffrsTeamId,
          event: r.event,
          time: r.time,
          timeSeconds: r.timeSeconds,
          place: r.place,
        })),
      )
      .orUpdate(
        ['time', 'timeSeconds', 'place'],
        ['sourceTffrsMeetId', 'sourceTffrsAthleteId', 'event'],
      )
      .execute();

    console.log(
      `Upserted ${uniqueResults.length} results for meet ${meet.name}.`,
    );
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

    const earliestDate = new Date(earliestMeets[0].date);
    const month = (earliestDate.getUTCMonth() + 1).toString();
    const year = earliestDate.getUTCFullYear().toString();

    return { earliestMonth: month, earliestYear: year };
  }

  async getTeamExtras(teamId: number): Promise<{
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  }> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const logoUrl = await this.getTeamLogoUrl(team);
    if (!logoUrl.logoUrl) {
      return { logoUrl: null, primaryColor: null, secondaryColor: null };
    }

    const colors = await this.getTeamColors(logoUrl.logoUrl);
    return {
      logoUrl: logoUrl.logoUrl,
      primaryColor: colors?.primary ?? null,
      secondaryColor: colors?.secondary ?? null,
    };
  }

  colorDistance(hex1: string, hex2: string): number {
    const toRgb = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    });

    const c1 = toRgb(hex1);
    const c2 = toRgb(hex2);

    // Weighted Euclidean distance (human eyes are more sensitive to green)
    return Math.sqrt(
      2 * Math.pow(c1.r - c2.r, 2) +
        4 * Math.pow(c1.g - c2.g, 2) +
        3 * Math.pow(c1.b - c2.b, 2),
    );
  }

  async getTeamColors(
    logoUrl: string,
  ): Promise<{ primary: string; secondary: string } | null> {
    try {
      const imageResponse = await makeHttpRequest(logoUrl, 'GET', null, {
        responseType: 'arraybuffer',
      });

      const { data } = await sharp(Buffer.from(imageResponse.data))
        .resize(200, 200, { fit: 'inside' })
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // transparent -> white
        .raw()
        .toBuffer({ resolveWithObject: true });

      const colorCounts: Record<string, number> = {};

      for (let i = 0; i < data.length; i += 3) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        const brightness = (r + g + b) / 3;

        // Skip near-white (background) and near-black pixels
        if (brightness > 240 || brightness < 15) continue;

        const quantized = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
        colorCounts[quantized] = (colorCounts[quantized] ?? 0) + 1;
      }

      // Sort by pixel count descending
      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([rgb]) => {
          const [r, g, b] = rgb.split(',').map(Number);
          const brightness = (r + g + b) / 3;
          const saturation = Math.max(
            Math.abs(r - brightness),
            Math.abs(g - brightness),
            Math.abs(b - brightness),
          );
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          return { hex, r, g, b, brightness, saturation };
        });

      const primary = sorted[0];

      // Secondary: most prevalent color that is sufficiently distinct from primary
      const secondary = sorted.slice(1).find((c) => {
        return this.colorDistance(primary.hex, c.hex) >= 80;
      });

      return {
        primary: primary.hex,
        secondary: secondary?.hex ?? primary.hex,
      };
    } catch (err) {
      console.error('Failed to extract colors:', err);
      return null;
    }
  }

  async getTeamLogoUrl(team: Team): Promise<{
    logoUrl: string | null;
  }> {
    const tffrsTeamPageResponse = await makeHttpRequest(
      `https://www.tfrrs.org/teams/${team.sport}/${team.sourceTffrsId}`,
      'GET',
    );

    const dom = parser.parseDocument(tffrsTeamPageResponse.data);
    const teamNameElement = selectOne('h3#team-name', dom);

    if (!teamNameElement) {
      return { logoUrl: null };
    }

    const imgTag = selectOne('img', teamNameElement) as AnyNode | null;
    const logoUrl =
      imgTag && 'attribs' in imgTag && imgTag.attribs
        ? imgTag.attribs['src'] || null
        : null;

    return { logoUrl };
  }

  private timeStringToSeconds(timeStr: string): number | null {
    // Handle special cases like DNF, DNS, DQ
    if (['DNF', 'DNS', 'DQ'].includes(timeStr)) {
      return null;
    }

    try {
      // Parse time string in format "MM:SS.ss" or "M:SS.ss"
      const parts = timeStr.split(':');
      if (parts.length !== 2) {
        return null;
      }

      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);

      if (isNaN(minutes) || isNaN(seconds)) {
        return null;
      }

      return minutes * 60 + seconds;
    } catch (error) {
      console.error(`Error parsing time string "${timeStr}":`, error);
      return null;
    }
  }
}
