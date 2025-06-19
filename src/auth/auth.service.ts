import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CryptAPIService } from '../utils/cryptoServei';
import { verifyTelegramWebAppData } from '../utils/checker';
import { InventoryItem, Balance } from '../types/inventory.types';
import { DailyTasksService } from '../dailyTasks/daily-tasks.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private dailyTasksService: DailyTasksService
  ) {}

  async authenticate(initData: string) {
    const [userData, error, rawParams] = verifyTelegramWebAppData(initData);
    
    if (error || !userData) {
      throw new UnauthorizedException('Invalid Telegram data');
    }
  
    const existingUser = await this.prisma.user.findUnique({
      where: {
        telegramId: userData.id
      }
    });
  
    let user;
    if (existingUser) {
      user = await this.prisma.user.update({
        where: {
          telegramId: userData.id
        },
        data: {
          isNewUser: false
        }
      });
    } else {
  
      const urlSearchParams = new URLSearchParams(rawParams);
      const refTelegramId = urlSearchParams.get('ref');
  
      const friends: string[] = [];
      if (refTelegramId && refTelegramId !== userData.id.toString()) {
        friends.push(refTelegramId);
      }
  
      user = await this.prisma.user.create({
        data: {
          telegramId: userData.id,
          displayName: userData.username || userData.first_name,
          isNewUser: true,
          inventory: [],
          balance: { money: 0, shield: 0 },
          friends: JSON.stringify(friends),
        }
      });
  
      if (refTelegramId && refTelegramId !== userData.id.toString()) {
        const refUser = await this.prisma.user.findUnique({
          where: { telegramId: refTelegramId }
        });
  
        if (refUser) {
          const refUserFriends = JSON.parse(refUser.friends as string || '[]') as string[];
          if (!refUserFriends.includes(userData.id.toString())) {
            refUserFriends.push(userData.id.toString());
  
            await this.prisma.user.update({
              where: { telegramId: refTelegramId },
              data: {
                friends: JSON.stringify(refUserFriends)
              }
            });
          }
        }
      }
    }
  
    const payload = { sub: user.id, telegramId: user.telegramId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyUser(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      console.log(user);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const cryptApiService = new CryptAPIService();

      const usdtAddressBEP20 = await cryptApiService.createBEP20Payment(user.telegramId, "bep20");
      const usdtAddressTRC20 = await cryptApiService.createBEP20Payment(user.telegramId, "trc20");

      const userTasks = await this.dailyTasksService.getUserTasks(user.telegramId);

      if (userTasks.data) {
        await Promise.all(userTasks.data.map(async (task) => {
          await this.dailyTasksService.checkAndCompleteTask(user.telegramId, task.id);
        }));
      }
      const updatedUserTasks = await this.dailyTasksService.getUserTasks(user.telegramId);

      return {
        ...user,
        inventory: user.inventory as unknown as InventoryItem[],
        balance: user.balance as unknown as Balance,
        usdtAddressBEP20: usdtAddressBEP20.data.address_in,
        usdtAddressTRC20: usdtAddressTRC20.data.address_in,
        tasks: updatedUserTasks.data
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async createTestUser() {
    const testUser = await this.prisma.user.create({
      data: {
        telegramId: '667243325',
        displayName: 'Test User',
        isNewUser: false,
        inventory: [],
        balance: { money: 100000, shield: 0 }
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