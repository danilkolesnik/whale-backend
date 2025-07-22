import { Module } from '@nestjs/common';
import { UsdtCheckTrc20Service } from './usdt-checkTrc20.service';
import { UsdtCheckTrc20Controller } from './usdt-checkTrc20.controller';

@Module({
  controllers: [UsdtCheckTrc20Controller],
  providers: [UsdtCheckTrc20Service],
})
export class UsdtCheckTrc20Module {} 