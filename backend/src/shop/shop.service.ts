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
      return { success: false, message: 'User not found', code: 404 };
    }

    if (!item) {
      return { success: false, message: 'Item not found', code: 404 };
    }

    const inventory = user.inventory as any[];

    if(inventory.length >= 50) {
      return { success: false, message: 'Inventory is full', code: 400 };
    }

    const balance = user.balance as { money: number; shield: number; tools: number, usdt: number };

    if (balance.money < item.price) {
      return { success: false, message: 'Not enough money', code: 400 };
    }

    // const itemExists = inventory.some(invItem => invItem.id === itemId);
    // if (itemExists) {
    //   return { success: false, message: 'Item already purchased', code: 400 };
    // }

    const randomId = Math.floor(Math.random() * 1000000);

    inventory.push({
      id: randomId,
      name: item.name,
      level: item.level,
      shield: item.shield,
      type: item.type,
      price: item.price,
      isActive: false,
    });

    await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          ...balance,
          money: balance.money - item.price,
        },
        inventory: inventory,
      },
    });

    return { success: true, message: 'Item purchased successfully', code: 200 };
  }

  async conversionCoin(telegramId: string, usdtQuantity: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = user.balance as { money: number; shield: number; tools: number, usdt: number };

    if((usdtQuantity / 100) > balance.usdt) {
      return{
        code: 400,
        message: 'Not enough USDT',
      }
    }

    await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          money: balance.money + usdtQuantity,
          usdt: balance.usdt - (usdtQuantity / 100),
          shield: balance.shield,
          tools: balance.tools,
        },
      },
    });

    return{
      code: 200,
      message: 'Money bought successfully',
    }
  }

  async conversionUsdt(telegramId: string, moneyQuantity: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = user.balance as { money: number; shield: number; tools: number, usdt: number };

    if(moneyQuantity > balance.money) {
      return{
        code: 400,
        message: 'Not enough money',
      }
    }
    
    await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          money: balance.money - (moneyQuantity * 100),
          usdt: balance.usdt + moneyQuantity,
          shield: balance.shield,
          tools: balance.tools,
        },
      },
    });

    return{
      code: 200,
      message: 'Money bought successfully',
    }
  }

  async buyTool(telegramId: string, toolQuantity: number) { 
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = user.balance as { money: number; shield: number; tools: number, usdt: number };

    if(toolQuantity > balance.money) {
      return{
        code: 400,
        message: 'Not enough USDT',
      }
    }

    await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          money: balance.money - toolQuantity,
          usdt: balance.usdt,
          shield: balance.shield,
          tools: balance.tools + toolQuantity,
        },
      },
    });

    return{
      code: 200,
      message: 'Money bought successfully',
    }
    
  }

} 