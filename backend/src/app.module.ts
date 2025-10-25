import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';
import { ShopModule } from './shop/shop.module';
import { UserModule } from './user/user.module';
import { MarketModule } from './market/market.module';
import configuration from './config/configuration';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './schedule/cron.service';
import { UsdtCheckModule } from './usdt-check/usdt-check.module';
import { UsdtCheckTrc20Module } from './usdt-checkTrc20/usdt-checkTrc20.module';
import { TonCheckModule } from './ton-check/ton-check.module';
import { DailyTasksModule } from './dailyTasks/daily-tasks.module';
import { RatingModule } from './rating/rating.module';
import { TransactionModule } from './transaction/transaction.module';
import { WhalesModule } from './whales/whales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    TelegramModule,
    ShopModule,
    UserModule,
    MarketModule,
    UsdtCheckModule,
    UsdtCheckTrc20Module,
    TonCheckModule,
    DailyTasksModule,
    ScheduleModule.forRoot(),
    RatingModule,
    TransactionModule,
    WhalesModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}
