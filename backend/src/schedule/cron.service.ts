import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TonCheckService } from '../ton-check/tonCheckService';
import { RatingService } from '../rating/rating.service';
import { listenToRecentTransactions } from '../telegram/transactionBot/bot';

@Injectable()
export class CronService {
  constructor(
    private readonly tonCheckService: TonCheckService, 
    private readonly ratingService: RatingService
  ) {}

  @Cron('* * * * *')
  async handleCron() {
    console.log('Running TON transaction check');
    await this.tonCheckService.checkTonTransactions();
  }

  @Cron('* * * * *')
  async handleTransactionCron() {
    console.log('Running transaction check');
    await listenToRecentTransactions();
  }
  
  // @Cron('* * * * *')
  @Cron('0 0 * * 0')
  async resetWeeklyRating() {
    console.log('Resetting weekly rating');
    await this.ratingService.resetWeeklyRating();
  }
} 