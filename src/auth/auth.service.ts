import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticateDto } from './dto/authenticate.dto';
import { verifyTelegramWebAppData } from '../utils/checker';

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
          isNewUser: true
        }
      });
    }

    const payload = { sub: user.id, telegramId: user.telegramId };
    return {
      access_token: this.jwtService.sign(payload)
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

      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 