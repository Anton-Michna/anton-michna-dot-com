import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ScraperService {
  @Cron('0 2 * * *') // Runs at 2 AM every day
  async runNightlyScrape() {
    // console.log("Starting nightly scrape");
    // await this.scrapeWebsite();
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
