import { Controller, Get, Post, Body,Request, Query } from '@nestjs/common';
import { UsdtCheckService } from './usdt-check.service';

@Controller('usdt-check')
export class UsdtCheckController {
  constructor(private readonly usdtCheckService: UsdtCheckService) {}

  @Post()
  async checkUsdtTransactions(@Request() req: any, @Query('telegramId') telegramId: string, @Query('test') test?: string) {
    const { value_coin, txid_in } = req.body;
    console.log(req.body);
    
    return this.usdtCheckService.checkUsdtTransactions(telegramId, value_coin, txid_in, test);
  }
} 