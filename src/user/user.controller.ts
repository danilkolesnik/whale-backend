import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('set-user-name')
  @ApiOperation({ summary: 'Set user name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          example: '123456789'
        },
        name: {
          type: 'string',
          example: 'John Doe'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'User name set successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiTags('Users')
  async setUserName(
    @Body() body: { telegramId: string, name: string }
  ) {
    return this.userService.setUserName(body.telegramId, body.name);
  }

  @Get('user-by-telegram-id')
  @ApiOperation({ summary: 'Get user by telegram id' })
  @ApiResponse({ status: 200, description: 'Return user by telegram id' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByTelegramId(
    @Query('telegramId') telegramId: string
  ) {
    return this.userService.getUserByTelegramId(telegramId);
  }

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

  @Get('invite')
  @ApiOperation({ summary: 'Get user invite link' })
  @ApiResponse({ status: 200, description: 'Return user invite link' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async inviteUser(
    @Query('telegramId') telegramId: string
  ) {
    return this.userService.inviteUser(telegramId);
  }

  // @Post('process-referral')
  // @ApiOperation({ summary: 'Process referral link' })
  // @ApiResponse({ status: 200, description: 'Users added to each other\'s friend list' })
  // @ApiResponse({ status: 404, description: 'Inviter or invitee not found' })
  // async processReferral(
  //   @Body() body: { inviterTelegramId: string, inviteeTelegramId: string }
  // ) {
  //   return this.userService.processReferralLink(body.inviterTelegramId, body.inviteeTelegramId);
  // }

  @Post('connect-wallet')
  @ApiOperation({ summary: 'Connect wallet' })
  @ApiResponse({ status: 200, description: 'Wallet connected' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async connectWallet(
    @Body() body: { telegramId: string, walletAddress: string }
  ) {
    return this.userService.connectWallet(body.telegramId, body.walletAddress);
  }

  @Get('all-users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async allUsers() {
    return this.userService.allUsers();
  }

  @Post('update-parameters')
  @ApiOperation({ summary: 'Update user parameters' })
  @ApiResponse({ status: 200, description: 'User parameters updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserParameters(
    @Body() body: { telegramId: string; money?: number; shield?: number }
  ) {
    return this.userService.updateUserParameters(body.telegramId, {
      money: body.money,
      shield: body.shield,
    });
  }

  @Post('items/:itemId/update-parameter')
  @ApiOperation({ summary: 'Update item parameter' })
  @ApiResponse({ status: 200, description: 'Item parameter updated successfully' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  async updateItemParameter(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string; parameter: string; value: any }
  ) {
    return this.userService.updateItemParameter(
      body.telegramId,
      parseInt(itemId),
      body.parameter,
      body.value
    );
  }

  @Post('items/:itemId/remove')
  @ApiOperation({ summary: 'Remove item from inventory' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'User or item not found' })
  async removeItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.removeItem(body.telegramId, parseInt(itemId));
  }
} 