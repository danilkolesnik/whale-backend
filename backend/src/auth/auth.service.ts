//@ts-nocheck
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CryptAPIService } from '../utils/cryptoService';
// import { verifyTelegramWebAppData } from '../utils/checker';
import { InventoryItem, Balance } from '../types/inventory.types';
import { DailyTasksService } from '../dailyTasks/daily-tasks.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private dailyTasksService: DailyTasksService
  ) {}

  async authenticate(body: { webAppData: any }) {
    if (!body.webAppData || !body.webAppData.user || !body.webAppData.user.id) {
      throw new UnauthorizedException('Invalid webAppData: missing user data');
    }

    const userData = body.webAppData.user;
    const telegramId: string = userData.id.toString();

    const existingUser = await this.prisma.user.findUnique({
      where: { telegramId }
    });

    let user;
    if (existingUser) {
      user = await this.prisma.user.update({
        where: { telegramId },
        data: { isNewUser: false }
      });
    } else {
      const startParam: string | undefined = body.webAppData.start_param?.toString();
      const friends: string[] = [];
      
      if (startParam && startParam !== telegramId) {
        friends.push(startParam);
      }

      const randomId = Math.floor(Math.random() * 1000000);

      // Create initial items for new user
      const initialItems = [
        {
          id: randomId,
          name: 'Leg',
          level: 1,
          shield: 1,
          type: 'leg',
          price: 1,
          isActive: true,
        },
        {
          id: randomId,
          name: 'Helmet',
          level: 1,
          shield: 1,
          type: 'helmet',
          price: 1,
          isActive: true,
        },
        {
          id: randomId,
          name: 'Armor',
          level: 1,
          shield: 1,
          type: 'armor',
          price: 1,
          isActive: true,
        }
      ];

      user = await this.prisma.user.create({
        data: {
          telegramId,
          displayName: userData.username || userData.first_name,
          inventory: initialItems,
          equipment: initialItems,
          balance: {
            money: 0,
            shield: 3, // 3 items × 1 shield each
            tools: 100, // Welcome bonus: 100 tools for new users
            usdt: 0
          }
        }
      });

      if (startParam && startParam !== telegramId) {
        const refUser = await this.prisma.user.findUnique({
          where: { telegramId: startParam }
        });

        if (refUser) {
          const refUserFriends = refUser.friends as string[];
          if (!refUserFriends.includes(telegramId)) {
            refUserFriends.push(telegramId);
            await this.prisma.user.update({
              where: { telegramId: startParam },
              data: { 
                friends: refUserFriends,
                balance: {
                  money: (refUser.balance as unknown as Balance).money,
                  shield: (refUser.balance as unknown as Balance).shield,
                  tools: (refUser.balance as unknown as Balance).tools + 100,
                  usdt: (refUser.balance as unknown as Balance).usdt
                }
              }
            });
          }
        }
      }
    }

    const payload = { sub: user.id, telegramId: user.telegramId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        telegramId: user.telegramId,
        displayName: user.displayName,
        isNewUser: user.isNewUser,
        balance: user.balance as unknown as Balance
      }
    };
  }

  async verifyUser(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check for daily login bonus
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastLogin = user.lastLogin ? new Date(user.lastLogin.getFullYear(), user.lastLogin.getMonth(), user.lastLogin.getDate()) : null;

      let updatedBalance = user.balance as any;
      
      // If user hasn't logged in today, give daily bonus
      if (!lastLogin || lastLogin < today) {
        updatedBalance.tools += 2;
        
        // Update user with new balance and lastLogin
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            balance: updatedBalance,
            lastLogin: now
          }
        });
      }

      const cryptApiService = new CryptAPIService();

      const usdtAddressBEP20 = await cryptApiService.createBEP20Payment(user.telegramId, "bep20");
      const usdtAddressTRC20 = await cryptApiService.createBEP20Payment(user.telegramId, "trc20");

      const userTasks = await this.dailyTasksService.getUserTasks(user.telegramId);

      if (userTasks.data) {
        await Promise.all(userTasks.data.map(async (task) => {
          await this.dailyTasksService.checkAndCompleteTask(user.telegramId, task.taskId);
        }));
      }
      const updatedUserTasks = await this.dailyTasksService.getUserTasks(user.telegramId);
      const updatedUser = await this.prisma.user.findUnique({
        where: { telegramId: user.telegramId }
      });

      const friends = user.friends as string[];
      const referrals = await this.prisma.user.findMany({
        where: {
          telegramId: {
            in: friends
          }
        }
      });

      return {
        ...updatedUser,
        inventory: updatedUser.inventory as unknown as InventoryItem[],
        balance: updatedUser.balance as unknown as Balance,
        usdtAddressBEP20: usdtAddressBEP20.data.address_in,
        usdtAddressTRC20: usdtAddressTRC20.data.address_in,
        tasks: updatedUserTasks.data,
        friends: referrals
      };
    } catch(err) {
      console.log(err);
      
      throw new UnauthorizedException('Invalid token');
    }
  }

  async createTestUser() {

    const randomNumber = Math.floor(Math.random() * 1000000);

    // Create initial items for test user
    const initialItems = [
      {
        id: Math.floor(Math.random() * 1000000),
        name: 'Leg',
        level: 1,
        shield: 1,
        type: 'leg',
        price: 1,
        isActive: true,
      },
      {
        id: Math.floor(Math.random() * 1000000),
        name: 'Helmet',
        level: 1,
        shield: 1,
        type: 'helmet',
        price: 1,
        isActive: true,
      },
      {
        id: Math.floor(Math.random() * 1000000),
        name: 'Armor',
        level: 1,
        shield: 1,
        type: 'armor',
        price: 1,
        isActive: true,
      }
    ];

    const testUser = await this.prisma.user.create({
      data: {
        telegramId: randomNumber.toString(),
        displayName: 'Test User',
        isNewUser: false,
        inventory: initialItems,
        equipment: initialItems,
        balance: { money: 100000, shield: 3, tools: 1000, usdt: 1000 }
      }
    });

    const payload = { sub: testUser.id, telegramId: testUser.telegramId };
    return {
      user: {
        ...testUser,
        inventory: testUser.inventory as unknown as InventoryItem[],
        balance: testUser.balance as unknown as Balance
      },
      access_token: this.jwtService.sign(payload)
    };
  }
} 