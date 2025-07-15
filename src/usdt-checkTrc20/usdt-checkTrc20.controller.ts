import { Controller, Get, Post, Body,Request, Query } from '@nestjs/common';
import { UsdtCheckTrc20Service } from './usdt-checkTrc20.service';

@Controller('usdt-checkTrc20')
export class UsdtCheckTrc20Controller {
  constructor(private readonly usdtCheckService: UsdtCheckTrc20Service) {}

  @Post()
  async checkUsdtTransactionsTrc20(@Request() req: any, @Query('telegramId') telegramId: string) {
    const { value_coin, txid_in } = req.body;
    console.log(req.body);
    
    return this.usdtCheckService.checkUsdtTransactionsTrc20(telegramId, value_coin, txid_in);
  }
} 