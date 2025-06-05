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
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}
