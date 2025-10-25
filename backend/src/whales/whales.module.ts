import { Module } from '@nestjs/common';
import { WhalesController } from './whales.controller';
import { WhalesService } from './whales.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhalesController],
  providers: [WhalesService],
  exports: [WhalesService],
})
export class WhalesModule {}
