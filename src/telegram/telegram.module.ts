import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramSubService } from './telegram-sub.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramSubService],
  exports: [TelegramSubService]
})
export class TelegramModule {} 