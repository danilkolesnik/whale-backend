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
    return await this.prisma.item.findMany();
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

    // Parse user's balance
    const balance = user.balance as { money: number; shield: number };
    
    // Check if user has enough money
    if (balance.money < item.level * 100) { // Price is level * 100
      throw new BadRequestException('Not enough money');
    }

    // Parse user's inventory
    const inventory = user.inventory as any[];

    // Add complete item info to inventory
    inventory.push({
      id: item.id,
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
          money: balance.money - item.level * 100,
          shield: balance.shield,
        },
        inventory: inventory,
      },
    });
  }
} 