import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWhaleDto } from './dto/create-whale.dto';
import { ContributeToWhaleDto } from './dto/contribute-to-whale.dto';
import { Whale } from './interfaces/whale.interface';

@Injectable()
export class WhalesService {
  private whales: Whale[] = [];

  constructor(private readonly prisma: PrismaService) {}

  create(createWhaleDto: CreateWhaleDto): Whale {
    const whale: Whale = {
      id: this.generateId(),
      ...createWhaleDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.whales.push(whale);
    return whale;
  }

  async contributeToWhale(contributeDto: ContributeToWhaleDto): Promise<{ success: boolean; message: string; whale?: Whale }> {
    const { userId, whaleId, amount } = contributeDto;

    // Найти кита
    const whale = this.whales.find(w => w.id === whaleId);
    if (!whale) {
      throw new NotFoundException('Whale not found');
    }

    // Проверить, не превышает ли внесение общую сумму
    if (whale.moneyTotal + amount > whale.total) {
      throw new BadRequestException('Contribution exceeds the total amount needed');
    }

    // Найти пользователя в базе данных
    const user = await this.prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };

    // Проверить достаточность средств
    if (balance.money < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Обновить баланс пользователя
    await this.prisma.user.update({
      where: { telegramId: userId },
      data: {
        balance: {
          money: balance.money - amount,
          shield: balance.shield,
          tools: balance.tools,
          usdt: balance.usdt,
        },
      },
    });

    // Обновить данные кита
    const whaleIndex = this.whales.findIndex(w => w.id === whaleId);
    if (whaleIndex !== -1) {
      this.whales[whaleIndex].moneyTotal += amount;
      this.whales[whaleIndex].users.push(userId);
      this.whales[whaleIndex].updatedAt = new Date();
    }

    return {
      success: true,
      message: `Successfully contributed ${amount} to whale ${whaleId}`,
      whale: this.whales[whaleIndex]
    };
  }

  findAll(): Whale[] {
    return this.whales;
  }

  findOne(id: string): Whale | undefined {
    return this.whales.find(whale => whale.id === id);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
