import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('equip/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Equip an item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        }
      },
      required: ['telegramId']
    }
  })
  @ApiResponse({ status: 200, description: 'Item successfully equipped' })
  @ApiResponse({ status: 400, description: 'Maximum equipment limit reached or item already equipped' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  equipItem(@Param('itemId') itemId: string, @Body() body: { telegramId: string }) {
    return this.userService.equipItem(body.telegramId, parseInt(itemId));
  }

  @Post('unequip/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unequip an item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        }
      },
      required: ['telegramId']
    }
  })
  @ApiResponse({ status: 200, description: 'Item successfully unequipped' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  unequipItem(@Param('itemId') itemId: string, @Body() body: { telegramId: string }) {
    return this.userService.unequipItem(body.telegramId, parseInt(itemId));
  }

  @Get('equipment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user equipment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        }
      },
      required: ['telegramId']
    }
  })
  @ApiResponse({ status: 200, description: 'Return user equipment and total shield' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getEquipment(@Body() body: { telegramId: string }) {
    return this.userService.getEquipment(body.telegramId);
  }
} 