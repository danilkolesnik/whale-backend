import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { verifyTelegramWebAppData } from '../utils/checker';
import { InventoryItem, Balance } from '../types/inventory.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async authenticate(initData: string) {
    const [userData, error] = verifyTelegramWebAppData(initData);
    
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
          displayName: userData.first_name,
          isNewUser: false
        }
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          telegramId: userData.id,
          displayName: userData.first_name,
          isNewUser: true,
          inventory: [],
          balance: { money: 0, shield: 0 }
        }
      });
    }

    const payload = { sub: user.id, telegramId: user.telegramId };
    return {
      access_token: this.jwtService.sign(payload),
      // user: {
      //   ...user,
      //   inventory: user.inventory as unknown as InventoryItem[],
      //   balance: user.balance as unknown as Balance
      // }
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

      return {
        ...user,
        inventory: user.inventory as unknown as InventoryItem[],
        balance: user.balance as unknown as Balance
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async createTestUser() {
    const testUser = await this.prisma.user.create({
      data: {
        telegramId: '12365666666',
        displayName: 'Test User',
        isNewUser: false,
        inventory: [],
        balance: { money: 0, shield: 0 }
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