import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TelegramModule } from '../telegram/telegram.module';
import { DailyTasksService } from './daily-tasks.service';
import { DailyTasksController } from './daily-tasks.controller';

@Module({
  imports: [PrismaModule, TelegramModule],
  providers: [DailyTasksService],
  controllers: [DailyTasksController],
  exports: [DailyTasksService]
})
export class DailyTasksModule {} 