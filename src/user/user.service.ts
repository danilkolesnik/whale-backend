import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async equipItem(telegramId: string, itemId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse user's inventory and equipment
    const inventory = user.inventory as any[];
    const equipment = user.equipment as any[] || [];

    // Find item in inventory
    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in inventory');
    }

    // Check if user already has 3 items equipped
    if (equipment.length >= 3) {
      throw new BadRequestException('Maximum equipment limit reached (3 items)');
    }

    // Check if item is already equipped
    if (equipment.some(e => e.id === itemId)) {
      throw new BadRequestException('Item is already equipped');
    }

    // Add item to equipment
    equipment.push(item);

    // Calculate total shield from equipped items
    const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

    // Update user's equipment and shield
    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        equipment: equipment,
        balance: {
          money: (user.balance as any).money,
          shield: totalShield
        }
      },
    });
  }

  async unequipItem(telegramId: string, itemId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse user's equipment
    const equipment = user.equipment as any[] || [];

    // Find item in equipment
    const itemIndex = equipment.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in equipment');
    }

    // Remove item from equipment
    equipment.splice(itemIndex, 1);

    // Calculate new total shield
    const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

    // Update user's equipment and shield
    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        equipment: equipment,
        balance: {
          money: (user.balance as any).money,
          shield: totalShield
        }
      },
    });
  }

  async getEquipment(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      equipment: user.equipment as any[] || [],
      totalShield: (user.balance as any).shield
    };
  }
} 