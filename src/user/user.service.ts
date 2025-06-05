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

    const inventory = user.inventory as any[];
    const equipment = user.equipment as any[] || [];

    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in inventory');
    }

    if (equipment.length >= 3) {
      throw new BadRequestException('Maximum equipment limit reached (3 items)');
    }

    if (equipment.some(e => e.id === itemId)) {
      throw new BadRequestException('Item is already equipped');
    }
    item.isActive = true;
    equipment.push(item);

    const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        equipment: equipment,
        inventory: inventory,
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

    const equipment = user.equipment as any[] || [];
    const inventory = user.inventory as any[] || [];

    const itemIndex = equipment.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in equipment');
    }

    // Update isActive in inventory
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (inventoryItem) {
      inventoryItem.isActive = false;
    }

    equipment.splice(itemIndex, 1);

    const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        equipment: equipment,
        inventory: inventory,
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

  async upgradeItem(telegramId: string, itemId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const inventory = user.inventory as any[] || [];
    const equipment = user.equipment as any[] || [];
    const balance = user.balance as any;

    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in inventory');
    }

    const upgradeCost = 100;
    if (balance.money < upgradeCost) {
      throw new BadRequestException('Not enough money for upgrade');
    }

    // Upgrade item
    item.level = (item.level || 0) + 1;
    item.shield = (item.shield || 0) + 4;

    // Update item in equipment if it's equipped
    if (item.isActive) {
      const equippedItem = equipment.find(e => e.id === itemId);
      if (equippedItem) {
        equippedItem.level = item.level;
        equippedItem.shield = item.shield;
      }
    }

    // Calculate total shield from equipment
    const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        inventory: inventory,
        equipment: equipment,
        balance: {
          money: balance.money - upgradeCost,
          shield: totalShield
        }
      },
    });
  }

  
} 