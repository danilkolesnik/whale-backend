import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async addUserToRating(telegramId: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.prisma.user.findUnique({ where: { telegramId } }) as any;

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.balance.shield < 10) {
      return { success: false, error: 'Insufficient shield to join the rating' };
    }

    const currentRound = await this.prisma.rating.findFirst();
    if (!currentRound) {
      return { success: false, error: 'No active rating round found' };
    }

    const usersArray = Array.isArray(currentRound.users) ? currentRound.users : JSON.parse(currentRound.users as string);
    const updatedUsers = [...usersArray, {
      displayName: user.displayName ?? 'Unknown',
      telegramId: user.telegramId ?? 'Unknown',
      shield: user.balance.shield,
      addedAt: new Date()
    }];

    await this.prisma.rating.update({
      where: { id: currentRound.id },
      data: { users: updatedUsers }
    });

    return { success: true };
  }

  async resetWeeklyRating() {
    const existingRound = await this.prisma.rating.findFirst();

    if (existingRound) {
      await this.prisma.rating.deleteMany();
    }

    const topUsers = await this.prisma.user.findMany();

    const users = topUsers.map(user => {
      let shield = 0;
      try {
        const balance = JSON.parse(user.balance as string);
        if (balance && typeof balance === 'object' && 'shield' in balance) {
          shield = balance.shield;
        }
      } catch (error) {
        console.error('Invalid balance format for user:', user.telegramId);
      }
      return {
        displayName: user.displayName,
        telegramId: user.telegramId,
        shield
      };
    });

    users.sort((a, b) => b.shield - a.shield);

    const top100Users = users.slice(0, 100);

    await this.prisma.rating.create({
      data: {
        users: top100Users,
        roundCreatedAt: new Date()
      }
    });

    for (let i = 0; i < top100Users.length; i++) {
      let reward = 10;
      if (i === 0) reward = 1000;
      else if (i === 1) reward = 500;
      else if (i === 2) reward = 300;
      else if (i === 3) reward = 200;
      else if (i === 4) reward = 100;

      let money = 0;
      try {
        const balance = JSON.parse(topUsers[i].balance as string);
        if (balance && typeof balance === 'object' && 'money' in balance) {
          money = balance.money;
        }
      } catch (error) {
        console.error('Invalid balance format for user:', top100Users[i].telegramId);
      }

      await this.prisma.user.update({
        where: { telegramId: top100Users[i].telegramId },
        data: {
          balance: {
            money: money + reward,
            // shield: topUsers[i].balance.shield
          }
        }
      });
    }
  }

  async getRatingList() {
    return await this.prisma.rating.findMany();
  }
} 