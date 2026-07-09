import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper/scraper.service';
import { DataService } from './data/data.service';

@Controller()
export class AppController {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly dataService: DataService,
  ) {}

  @Get()
  getRoot() {
    return { message: 'API is running 🚀', status: 'ok' };
  }

  @Get('health')
  getHealth() {
    return { message: 'API is healthy 🚀' };
  }

  @Get('earliestMeet')
  async getEarliestMeet() {
    try {
      const data = await this.scraperService.getEarliestData();
      return {
        message: 'Earliest data retrieved',
        success: true,
        earliestMonth: data.earliestMonth,
        earliestYear: data.earliestYear,
      };
    } catch (error) {
      console.error('Error fetching earliest meet:', error);
      return {
        message: 'Error fetching earliest meet',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('scrapeXcResults')
  async scrapeXcResults(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    try {
      if (month) {
        const monthNum = Number(month);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          return {
            message:
              'Invalid month parameter. Must be a number between 1 and 12.',
            success: false,
          };
        }
      }
      if (year) {
        const yearNum = Number(year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
          return {
            message:
              'Invalid year parameter. Must be a valid year between 1900 and 2100.',
            success: false,
          };
        }
      }
      await this.scraperService.fullScrapeXcResults({ month, year });
      return {
        message: `Scrape completed for month: ${month || 'all'}, year: ${year || 'all'}`,
        success: true,
      };
    } catch (error) {
      console.error('Scrape error:', error);
      return {
        message: 'Scrape failed',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('scrapeAll')
  async scrapeAll() {
    try {
      await this.scraperService.fullScrapeXcResults({});
      return { message: 'Full scrape completed successfully!', success: true };
    } catch (error) {
      console.error('Scrape all error:', error);
      return {
        message: 'Scrape all failed',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('getFastestTeamAverages')
  async getFastestTeamAverages(
    @Query('teamId') teamId: string,
    @Query('distance') distance: string,
    @Query('athleteCount') athleteCount: 5 | 7 | 9,
    @Query('resultCount') resultCount: number,
  ) {
    try {
      const idNum = Number(teamId);
      if (isNaN(idNum) || idNum <= 0) {
        return {
          message: 'Invalid teamId parameter. Must be a positive number.',
          success: false,
        };
      }

      const results = await this.dataService.getFastestTeamAverages({
        teamId: idNum,
        distance: distance || '8k',
        sport: 'xc',
        athleteCount,
        resultCount,
      });
      return {
        message: 'Fastest team averages retrieved successfully!',
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('Fastest team averages error:', error);
      return {
        message: 'Fastest team averages retrieval failed',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('getTeamDistancePossibilities')
  async getTeamDistancePossibilities(@Query('teamId') teamId: string) {
    try {
      const idNum = Number(teamId);
      if (isNaN(idNum) || idNum <= 0) {
        return {
          message: 'Invalid teamId parameter. Must be a positive number.',
          success: false,
        };
      }
      const distances =
        await this.dataService.getTeamDistancePossibilities(idNum);
      return {
        success: true,
        data: distances,
      };
    } catch (error) {
      console.error('Get team distance possibilities error:', error);
      return {
        message: 'Failed to retrieve team distance possibilities',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('getAthleteResults')
  async getAthleteResults(
    @Query('athleteId') athleteId: string,
    @Query('sortBy') sortBy?: 'time' | 'date',
  ) {
    try {
      const idNum = Number(athleteId);
      if (isNaN(idNum) || idNum <= 0) {
        return {
          message: 'Invalid athleteId parameter. Must be a positive number.',
          success: false,
        };
      }
      const results = await this.dataService.getAthleteResults(
        idNum,
        sortBy || 'time',
      );
      return {
        message: 'Athlete results retrieved successfully!',
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('Get athlete results error:', error);
      return {
        message: 'Failed to retrieve athlete results',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('searchTeams')
  async searchTeams(@Query('query') query: string) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          message: 'Query must be at least 2 characters',
          success: false,
          data: [],
        };
      }
      const teams = await this.dataService.searchTeams(query.trim());
      return {
        success: true,
        data: teams,
      };
    } catch (error) {
      console.error('Search teams error:', error);
      return {
        message: 'Failed to search teams',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('getTeamExtras')
  async getTeamExtras(@Query('teamId') teamId: string) {
    const idNum = Number(teamId);
    if (isNaN(idNum) || idNum <= 0) {
      return {
        message: 'Invalid teamId parameter. Must be a positive number.',
        success: false,
      };
    }

    try {
      const result = await this.scraperService.getTeamExtras(idNum);
      return {
        success: true,
        message: 'Team extras retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to get team extras',
      };
    }
  }

  @Get('searchAthletes')
  async searchAthletes(@Query('query') query: string) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          message: 'Query must be at least 2 characters',
          success: false,
          data: [],
        };
      }
      const athletes = await this.dataService.searchAthletes(query.trim());
      return {
        success: true,
        data: athletes,
      };
    } catch (error) {
      console.error('Search athletes error:', error);
      return {
        message: 'Failed to search athletes',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
//workflow
//scrape all meet names and urls from tffrs
//go into each meet and scrape the individual results
