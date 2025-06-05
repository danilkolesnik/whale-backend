import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TonCheckService } from '../ton-check/tonCheckService';

@Injectable()
export class CronService {
  constructor(private readonly tonCheckService: TonCheckService) {}

  @Cron('* * * * *')
  async handleCron() {
    console.log('Running TON transaction check');
    await this.tonCheckService.checkTonTransactions();
  }
} 