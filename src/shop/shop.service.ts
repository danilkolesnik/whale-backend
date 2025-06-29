import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async createItem(createItemDto: CreateItemDto) {
    return await this.prisma.item.create({
      data: createItemDto,
    });
  }

  async getAllItems() {
    return {
      data: await this.prisma.item.findMany(),
      message: 'Items fetched successfully',
    };
  }

  async buyItem(telegramId: string, itemId: number) {
    // Get user and item
    const [user, item] = await Promise.all([
      this.prisma.user.findUnique({
        where: { telegramId },
      }),
      this.prisma.item.findUnique({
        where: { id: itemId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Assuming user.balance is already an object
    const balance = user.balance as { money: number; shield: number; tools: number };

    if (balance.money < item.price) {
      throw new BadRequestException('Not enough money');
    }

    const inventory = user.inventory as any[];

    const randonId = Math.floor(Math.random() * 100000);

    inventory.push({
      id: randonId,
      name: item.name,
      level: item.level,
      shield: item.shield,
      type: item.type,
      price: item.price,
      isActive: false,
    });

    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          ...balance,
          money: balance.money - item.price,
        },
        inventory: inventory,
      },
    });
  }

  async buyTool(telegramId: string, toolQuantity: number) { 
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = JSON.parse(user.balance as string) as { money: number; shield: number; tools: number };

    await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          ...balance,
          tools: balance.tools + toolQuantity,
        },
      },
    });

    return{
      data: user,
      message: 'Tools bought successfully',
    }
    
  }

  async buyMoney(telegramId: string, usdtQuantity: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = JSON.parse(user.balance as string) as { money: number; usdt: number; shield: number; tools: number };

    await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          money: balance.money + usdtQuantity * 10,
          usdt: balance.usdt - usdtQuantity,
          shield: balance.shield,
          tools: balance.tools,
        },
      },
    });

    return{
      data: user,
      message: 'Money bought successfully',
    }
  }
} 