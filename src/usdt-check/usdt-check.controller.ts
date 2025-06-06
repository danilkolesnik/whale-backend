import { Controller, Get, Post, Body,Request, Query } from '@nestjs/common';
import { UsdtCheckService } from './usdt-check.service';

@Controller('usdt-check')
export class UsdtCheckController {
  constructor(private readonly usdtCheckService: UsdtCheckService) {}

  @Post()
  async checkUsdtTransactions(@Request() req: any, @Query() userId: string) {
    const { value_coin } = req.body;
    return this.usdtCheckService.checkUsdtTransactions(userId, value_coin);
  }
} 