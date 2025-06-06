import { Module } from '@nestjs/common';
import { TonCheckService } from './tonCheckService';

@Module({
  providers: [TonCheckService],
  exports: [TonCheckService],
})
export class TonCheckModule {} 