import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TelegramModule } from '../telegram/telegram.module';
import { DailyTasksService } from './daily-tasks.service';

@Module({
  imports: [PrismaModule, TelegramModule],
  providers: [DailyTasksService],
  exports: [DailyTasksService]
})
export class DailyTasksModule {} 