import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateReferralLink } from '../utils/generateReferralLink';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async getUpgradeSettingsForLevel(level: number) {
    const upgradeSettings = await this.prisma.upgradeSettings.findMany();

    for (const setting of upgradeSettings) {
      const [minLevel, maxLevel] = setting.levelRange.split('-').map(Number);
      if (level >= minLevel && level <= maxLevel) {
        return setting;
      }
    }

    return null;
  }

  async setUserName(telegramId: string, name: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { telegramId },
      data: {
        displayName: name,
      },
    });
  }

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
          shield: totalShield,
          money: (user.balance as any).money,
          tools: (user.balance as any).tools,
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
          shield: totalShield,
          money: (user.balance as any).money,
          tools: (user.balance as any).tools,
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

    const currentLevel = item.level || 0;

    
    const upgradeSettings = await this.getUpgradeSettingsForLevel(currentLevel);

    console.log(upgradeSettings);
    
    if (!upgradeSettings) {
      throw new BadRequestException('Maximum level reached or no upgrade settings found');
    }

    // Check if user has enough tools
    if (balance.tools < upgradeSettings.toolsCost) {
      throw new BadRequestException(`Not enough tools for upgrade. Required: ${upgradeSettings.toolsCost}`);
    }

    // Determine upgrade success
    let isSuccessful: boolean;
    
    if (upgradeSettings.useSequence && upgradeSettings.sequence) {
      // Use programmed sequence
      const sequence = upgradeSettings.sequence as boolean[];
      isSuccessful = sequence[upgradeSettings.currentIndex % sequence.length];
      
      // Update sequence index for next attempt
      await this.prisma.upgradeSettings.update({
        where: { id: upgradeSettings.id },
        data: { currentIndex: upgradeSettings.currentIndex + 1 }
      });
    } else {
      // Use random chance
      isSuccessful = Math.random() < upgradeSettings.successRate;
    }

    if (isSuccessful) {
      item.level = currentLevel + 1;
      item.shield = (item.shield || 0) + 4;

      if (item.isActive) {
        const equippedItem = equipment.find(e => e.id === itemId);
        if (equippedItem) {
          equippedItem.level = item.level;
          equippedItem.shield = item.shield;
        }
      }

      const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

      return await this.prisma.user.update({
        where: { telegramId },
        data: {
          inventory: inventory,
          equipment: equipment,
          balance: {
            shield: totalShield,
            money: balance.money,
            tools: balance.tools - upgradeSettings.toolsCost
          }
        },
      });
    } else {
      // Failed upgrade - remove item completely
      const inventoryIndex = inventory.findIndex(i => i.id === itemId);
      if (inventoryIndex !== -1) {
        inventory.splice(inventoryIndex, 1);
      }

      // Remove from equipment if equipped
      const equipmentIndex = equipment.findIndex(i => i.id === itemId);
      if (equipmentIndex !== -1) {
        equipment.splice(equipmentIndex, 1);
      }

      // Recalculate total shield
      const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

      return await this.prisma.user.update({
        where: { telegramId },
        data: {
          inventory: inventory,
          equipment: equipment,
          balance: {
            shield: totalShield,
            money: balance.money,
            tools: balance.tools - upgradeSettings.toolsCost
          }
        },
      });
    }
  }

  async inviteUser(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const referralLink = generateReferralLink(user.telegramId);
    return referralLink;
  }

  async processReferralLink(inviterTelegramId: string, inviteeTelegramId: string) {
    const inviter = await this.prisma.user.findUnique({
      where: { telegramId: inviterTelegramId },
    });

    const invitee = await this.prisma.user.findUnique({
      where: { telegramId: inviteeTelegramId },
    });

    if (!inviter || !invitee) {
      throw new NotFoundException('Inviter or invitee not found');
    }

    const inviterFriends = inviter.friends as string[];
    const inviteeFriends = invitee.friends as string[];

    if (!inviterFriends.includes(inviteeTelegramId)) {
      inviterFriends.push(inviteeTelegramId);
    }

    if (!inviteeFriends.includes(inviterTelegramId)) {
      inviteeFriends.push(inviterTelegramId);
    }

    await this.prisma.user.update({
      where: { telegramId: inviterTelegramId },
      data: { friends: inviterFriends },
    });

    await this.prisma.user.update({
      where: { telegramId: inviteeTelegramId },
      data: { friends: inviteeFriends },
    });

    return { message: 'Users added to each other\'s friend list' };
  }

  async connectWallet(telegramId: string, walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: { walletAddress: walletAddress },
    });
    return { message: 'Wallet connected' };
  }

  async allUsers() {
    const users = await this.prisma.user.findMany();
    return {
      data: users,
      message: 'All users'
    };
  }

  async updateUserParameters(telegramId: string, updateData: Partial<{ money: number; shield: number }>) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user data
    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        balance: {
          money: updateData.money !== undefined ? updateData.money : (user.balance as any).money,
          shield: updateData.shield !== undefined ? updateData.shield : (user.balance as any).shield,
        },
      },
    });
  }

  async getUserByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      data: user,
      message: 'User by telegram id'
    };
  }

  async updateItemParameter(telegramId: string, itemId: number, parameter: string, value: any) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const inventory = user.inventory as any[] || [];
    const equipment = user.equipment as any[] || [];

    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item not found in inventory');
    }

    // Update the specified parameter
    item[parameter] = value;

    // If item is equipped, update it in equipment as well
    if (item.isActive) {
      const equippedItem = equipment.find(e => e.id === itemId);
      if (equippedItem) {
        equippedItem[parameter] = value;
      }
    }

    // If we're updating shield, recalculate total shield
    let totalShield = (user.balance as any).shield;
    if (parameter === 'shield') {
      totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);
    }

    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        inventory: inventory,
        equipment: equipment,
        balance: {
          shield: totalShield,
          money: (user.balance as any).money,
          tools: (user.balance as any).tools,
        }
      },
    });
  }

  async removeItem(telegramId: string, itemId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const inventory = user.inventory as any[] || [];
    const equipment = user.equipment as any[] || [];

    // Remove from inventory
    const inventoryIndex = inventory.findIndex(i => i.id === itemId);
    if (inventoryIndex === -1) {
      throw new NotFoundException('Item not found in inventory');
    }
    inventory.splice(inventoryIndex, 1);

    // Remove from equipment if equipped
    const equipmentIndex = equipment.findIndex(i => i.id === itemId);
    if (equipmentIndex !== -1) {
      equipment.splice(equipmentIndex, 1);
    }

    // Recalculate total shield
    const totalShield = equipment.reduce((sum, item) => sum + item.shield, 0);

    return await this.prisma.user.update({
      where: { telegramId },
      data: {
        inventory: inventory,
        equipment: equipment,
        balance: {
          shield: totalShield,
          money: (user.balance as any).money,
          tools: (user.balance as any).tools,
        }
      },
    });
  }

  // Upgrade Settings Management Methods
  async createUpgradeSettings(levelRange: string, toolsCost: number, successRate: number, useSequence: boolean = false, sequence?: boolean[]) {
    return await this.prisma.upgradeSettings.create({
      data: {
        levelRange,
        toolsCost,
        successRate,
        useSequence,
        sequence: sequence || undefined,
      },
    });
  }

  async updateUpgradeSettings(levelRange: string, updateData: {
    toolsCost?: number;
    successRate?: number;
    useSequence?: boolean;
    sequence?: boolean[];
  }) {
    return await this.prisma.upgradeSettings.update({
      where: { levelRange },
      data: updateData,
    });
  }

  async getUpgradeSettings(levelRange?: string) {
    if (levelRange) {
      return await this.prisma.upgradeSettings.findUnique({
        where: { levelRange },
      });
    }
    return await this.prisma.upgradeSettings.findMany({
      orderBy: { levelRange: 'asc' },
    });
  }

  async resetUpgradeSequence(levelRange: string) {
    return await this.prisma.upgradeSettings.update({
      where: { levelRange },
      data: { currentIndex: 0 },
    });
  }
} 