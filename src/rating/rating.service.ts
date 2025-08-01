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

    const userAlreadyAdded = usersArray.some((u: any) => u === user.telegramId);
    if (userAlreadyAdded) {
      return { success: false, error: 'User already added to the rating' };
    }

    const updatedUsers = [...usersArray, user.telegramId];

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

    let topUsers: any[] = [];
    if (existingRound && Array.isArray(existingRound.users)) {
      const telegramIds = (existingRound.users as (string | null | undefined)[]).filter((id): id is string => typeof id === 'string');
      topUsers = await this.prisma.user.findMany({ where: { telegramId: { in: telegramIds } } });
    }

    const users = topUsers.map(user => {
      let shield = 0;
      let tools = 0;
      let usdt = 0;
      const balanceObj = user.balance as { money: number; shield: number; tools: number; usdt: number };
      try {
        const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };
        if (balance && typeof balance === 'object') {
          if ('shield' in balance && typeof balance.shield === 'number') {
            shield = balance.shield;
          }
          if ('tools' in balance && typeof balance.tools === 'number') {
            tools = balance.tools;
          }
          if ('usdt' in balance && typeof balance.usdt === 'number') {
            usdt = balance.usdt;
          }
        }
      } catch (error) {
        console.error('Invalid balance format for user:', user.telegramId);
      }
      return {
        displayName: user.displayName,
        telegramId: user.telegramId,
        shield,
        tools,
        usdt,
        balance: balanceObj // добавляем поле balance
      };
    });

    users.sort((a, b) => b.shield - a.shield);

    const top100Users = users.slice(0, 9);

    await this.prisma.rating.create({
      data: {
        users: [],
        roundCreatedAt: new Date()
      }
    });

    console.log(top100Users);
    

    for (let i = 0; i < top100Users.length; i++) {
      let reward = 0;
      if (i === 0) reward = 10000;
      else if (i === 1) reward = 9000;
      else if (i === 2) reward = 8000;
      else if (i === 3) reward = 7000;
      else if (i === 4) reward = 6000;
      else if (i === 5) reward = 5000;
      else if (i === 6) reward = 4000;
      else if (i === 7) reward = 3000;
      else if (i === 8) reward = 2000;
      else if (i === 9) reward = 1000;

      let money = 0;
      try {
        const balance = top100Users[i].balance as { money: number; shield: number; tools: number, usdt: number };
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
            tools: top100Users[i].tools,
            shield: top100Users[i].shield,
            usdt: top100Users[i].usdt
          }
        }
      });
    }
  }

  async getRatingList() {
    const ratingRounds = await this.prisma.rating.findMany();
    const userIds = ratingRounds.flatMap(round => round.users as string[]);
    const users = await this.prisma.user.findMany({
      where: {
        telegramId: { in: userIds }
      }
    });
    const userMap = new Map(users.map(user => [user.telegramId, user]));

    return ratingRounds.map(round => {
      const roundUsers = (round.users as string[]).map(telegramId => {
        const user = userMap.get(telegramId);
        if (user) {
          let shield = 0;
          let tools = 0;
          const balance = user.balance;
          if (balance && typeof balance === 'object') {
            if ('shield' in balance && typeof balance.shield === 'number') {
              shield = balance.shield;
            }
            if ('tools' in balance && typeof balance.tools === 'number') {
              tools = balance.tools;
            }
          }
          return {
            displayName: user.displayName,
            telegramId: user.telegramId,
            shield,
            tools
          };
        }
        return { telegramId };
      });
      roundUsers.sort((a, b) => (b.shield || 0) - (a.shield || 0));
      return {
        ...round,
        users: roundUsers
      };
    });
  }

  async createRating() {
    const existingRound = await this.prisma.rating.findFirst();
    if (existingRound) {
      await this.prisma.rating.deleteMany();
    }

    await this.prisma.rating.create({
      data: {
        users: [],
        roundCreatedAt: new Date()
      }
    });
  } 
} 