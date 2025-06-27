import { Controller, Post, Body, Get, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthenticateDto } from './dto/authenticate.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authenticate')
@ApiOperation({ summary: 'Authenticate user with Telegram WebApp data' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      webAppData: {
        type: 'object',
        description: 'Telegram WebApp data object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              first_name: { type: 'string' },
              username: { type: 'string' }
            }
          },
          auth_date: { type: 'number' },
          hash: { type: 'string' }
        }
      }
    }
  }
})
async authenticate(@Body() body: { webAppData: any }) {
  return this.authService.authenticate(body);
}

  @Get('verify')
  @ApiOperation({ summary: 'Verify JWT token and get user data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    const token = auth.split(' ')[1];
    return this.authService.verifyUser(token);
  }

  @Post('test-user')
  async createTestUser() {
    return this.authService.createTestUser();
  }
} 