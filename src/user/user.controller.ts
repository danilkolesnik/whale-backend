import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('items/:itemId/equip')
  @ApiOperation({ summary: 'Equip an item' })
  @ApiResponse({ status: 200, description: 'Item equipped successfully' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  @ApiResponse({ status: 400, description: 'Maximum equipment limit reached or item already equipped' })
  async equipItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.equipItem(body.telegramId, parseInt(itemId));
  }

  @Post('items/:itemId/unequip')
  @ApiOperation({ summary: 'Unequip an item' })
  @ApiResponse({ status: 200, description: 'Item unequipped successfully' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  async unequipItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.unequipItem(body.telegramId, parseInt(itemId));
  }

  @Post('items/:itemId/upgrade')
  @ApiOperation({ summary: 'Upgrade an item' })
  @ApiResponse({ status: 200, description: 'Item upgraded successfully' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  @ApiResponse({ status: 400, description: 'Not enough money for upgrade' })
  async upgradeItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.upgradeItem(body.telegramId, parseInt(itemId));
  }

  @Get('equipment')
  @ApiOperation({ summary: 'Get user equipment' })
  @ApiResponse({ status: 200, description: 'Return user equipment and total shield' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getEquipment(
    @Query('telegramId') telegramId: string
  ) {
    return this.userService.getEquipment(telegramId);
  }
} 