import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authenticate')
  @ApiOperation({ summary: 'Authenticate user with Telegram data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        initData: {
          type: 'string',
          description: 'Telegram WebApp initData string',
          example: 'query_id=AAHdF6IQAAAAAN0XohAhrGcJ&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%7D&auth_date=1234567890&hash=abc123...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User authenticated successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT access token'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            telegramId: { type: 'string' },
            displayName: { type: 'string' },
            isNewUser: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid Telegram data' })
  async authenticate(@Body('initData') initData: string) {
    return this.authService.authenticate(initData);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify JWT token and get user data' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        telegramId: { type: 'string' },
        displayName: { type: 'string' },
        isNewUser: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing token' })
  async verifyUser(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('No token provided');
    }
    const token = auth.replace('Bearer ', '');
    return this.authService.verifyUser(token);
  }
} 