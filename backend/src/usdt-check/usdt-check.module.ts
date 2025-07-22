import { Module } from '@nestjs/common';
import { UsdtCheckService } from './usdt-check.service';
import { UsdtCheckController } from './usdt-check.controller';

@Module({
  controllers: [UsdtCheckController],
  providers: [UsdtCheckService],
})
export class UsdtCheckModule {} 