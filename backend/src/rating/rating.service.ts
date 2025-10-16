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

    // Получаем всех пользователей с щитом больше 10
    const allUsers = await this.prisma.user.findMany();

    // Фильтруем пользователей с щитом больше 10
    const eligibleUsers = allUsers.filter(user => {
      try {
        const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };
        return balance && typeof balance === 'object' && 'shield' in balance && balance.shield > 2;
      } catch (error) {
        console.error('Invalid balance format for user:', user.telegramId);
        return false;
      }
    });

    const users = eligibleUsers.map(user => {
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

    // сортируем по количеству щита по убыванию
    users.sort((a, b) => (b.shield || 0) - (a.shield || 0));
    // топ-10 пользователей
    const topUsers = users.slice(0, 10);

    // Создаем новый раунд рейтинга со всеми отфильтрованными пользователями
    const allEligibleUserIds = users.map(user => user.telegramId);
    
    await this.prisma.rating.create({
      data: {
        users: allEligibleUserIds,
        roundCreatedAt: new Date()
      }
    });

    console.log('Top users:', topUsers);
    console.log('Total eligible users:', allEligibleUserIds.length);
    console.log('All eligible user IDs:', allEligibleUserIds);
    

    // получаем призы из БД
    const rewards = await this.prisma.ratingReward.findMany({
      orderBy: { place: 'asc' }
    });
    const placeToReward = new Map<number, number>(
      rewards.map(r => [r.place, r.reward])
    );

    for (let i = 0; i < topUsers.length; i++) {
      const place = i + 1;
      const reward = placeToReward.get(place) || 0;

      let money = 0;
      try {
        const balance = topUsers[i].balance as { money: number; shield: number; tools: number, usdt: number };
        if (balance && typeof balance === 'object' && 'money' in balance) {
          money = balance.money;
        }
      } catch (error) {
        console.error('Invalid balance format for user:', topUsers[i].telegramId);
      }

      await this.prisma.user.update({
        where: { telegramId: topUsers[i].telegramId },
        data: {
          balance: {
            money: money,
            tools: topUsers[i].tools + reward,
            shield: topUsers[i].shield,
            usdt: topUsers[i].usdt
          }
        }
      });
    }
  }

  async getRatingList() {
    const ratingRounds = await this.prisma.rating.findMany();
    const allUsers = await this.prisma.user.findMany();
    const userMap = new Map(allUsers.map(user => [user.telegramId, user]));

    return ratingRounds.map(round => {
      const roundUsers = (round.users as string[]).map(telegramId => {
        const user = userMap.get(telegramId) as any;
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

    // Получаем всех пользователей с щитом больше 10
    const allUsers = await this.prisma.user.findMany();
    
    // Фильтруем пользователей с щитом больше 10
    const eligibleUsers = allUsers.filter(user => {
      try {
        const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };
        return balance && typeof balance === 'object' && 'shield' in balance && balance.shield > 2;
      } catch (error) {
        console.error('Invalid balance format for user:', user.telegramId);
        return false;
      }
    });

    // Получаем ID всех подходящих пользователей
    const eligibleUserIds = eligibleUsers.map(user => user.telegramId);

    await this.prisma.rating.create({
      data: {
        users: eligibleUserIds,
        roundCreatedAt: new Date()
      }
    });

    console.log('Created new rating round with', eligibleUserIds.length, 'eligible users');
  } 
  
  async getRatingRewards() {
    return this.prisma.ratingReward.findMany({ orderBy: { place: 'asc' } });
  }

  async setRatingReward(place: number, reward: number) {
    return this.prisma.ratingReward.upsert({
      where: { place },
      update: { reward },
      create: { place, reward }
    });
  }
} 