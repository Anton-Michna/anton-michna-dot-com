import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper/scraper.service';

@Controller()
export class AppController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('health')
  getHealth() {
    return { message: 'API is healthy 🚀' };
  }

  @Get('scrapeTest')
  async scrapeTest() {
    try {
      // const testDummy: SearchPageScrapeResults = {
      //   raceName: 'NCAA Division I Cross Country Championships',
      //   raceDate: '11/22/25',
      //   urlToResults:
      //     'https://www.tfrrs.org/results/xc/27301/NCAA_Division_I_Cross_Country_Championships',
      // };

      const meet = await this.scraperService.getMeetById('27301');
      console.log('Meet found:', meet);

      if (!meet) {
        console.error('Meet not found');
        return { message: 'Meet not found', success: false };
      }

      // await this.scraperService.scrapeFullIndividualXcRaceResults({
      //   vals: testDummy,
      //   meet,
      // });

      return { message: 'Scrape completed successfully!', success: true };
    } catch (error) {
      console.error('Scrape error:', error);
      return {
        message: 'Scrape failed',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
