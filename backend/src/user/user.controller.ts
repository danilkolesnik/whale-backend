import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('set-user-name')
  @ApiOperation({ 
    summary: 'Set user display name',
    description: 'Updates the display name for a user identified by their Telegram ID. This name will be shown in the game interface.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId', 'name'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Unique Telegram ID of the user',
          example: '123456789'
        },
        name: {
          type: 'string',
          description: 'New display name for the user (max 255 characters)',
          example: 'John Doe',
          maxLength: 255
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User name updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User name updated successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            telegramId: { type: 'string', example: '123456789' },
            displayName: { type: 'string', example: 'John Doe' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found with the provided Telegram ID',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  async setUserName(
    @Body() body: { telegramId: string, name: string }
  ) {
    return this.userService.setUserName(body.telegramId, body.name);
  }

  @Get('user-by-telegram-id')
  @ApiOperation({ 
    summary: 'Get user by Telegram ID',
    description: 'Retrieves complete user information including inventory, balance, equipment, and other game-related data.'
  })
  @ApiQuery({
    name: 'telegramId',
    description: 'Telegram ID of the user to retrieve',
    type: 'string',
    example: '123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        telegramId: { type: 'string', example: '123456789' },
        displayName: { type: 'string', example: 'John Doe' },
        isNewUser: { type: 'boolean', example: false },
        balance: {
          type: 'object',
          properties: {
            money: { type: 'number', example: 1000 },
            shield: { type: 'number', example: 50 }
          }
        },
        inventory: { type: 'array', items: { type: 'object' } },
        equipment: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found with the provided Telegram ID',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  async getUserByTelegramId(
    @Query('telegramId') telegramId: string
  ) {
    return this.userService.getUserByTelegramId(telegramId);
  }

  @Post('items/:itemId/equip')
  @ApiOperation({ 
    summary: 'Equip an item',
    description: 'Equips an item from user inventory to their equipment slot. Items provide various bonuses like shield points.'
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID of the item to equip',
    type: 'string',
    example: '1'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user equipping the item',
          example: '123456789'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item equipped successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Item equipped successfully' },
        equipment: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or item not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User or item not found' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Maximum equipment limit reached or item already equipped',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Maximum equipment limit reached' }
      }
    }
  })
  async equipItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.equipItem(body.telegramId, parseInt(itemId));
  }

  @Post('items/:itemId/unequip')
  @ApiOperation({ 
    summary: 'Unequip an item',
    description: 'Removes an item from user equipment and returns it to inventory. This will reduce the user\'s total shield points.'
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID of the item to unequip',
    type: 'string',
    example: '1'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user unequipping the item',
          example: '123456789'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item unequipped successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Item unequipped successfully' },
        equipment: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or item not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User or item not found' }
      }
    }
  })
  async unequipItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.unequipItem(body.telegramId, parseInt(itemId));
  }

  @Post('items/:itemId/upgrade')
  @ApiOperation({ 
    summary: 'Upgrade an item',
    description: 'Upgrades an item to increase its stats (shield points, etc.) at the cost of in-game money.'
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID of the item to upgrade',
    type: 'string',
    example: '1'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user upgrading the item',
          example: '123456789'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item upgraded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Item upgraded successfully' },
        item: { type: 'object' },
        newBalance: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or item not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User or item not found' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Not enough money for upgrade',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Not enough money for upgrade' }
      }
    }
  })
  async upgradeItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.upgradeItem(body.telegramId, parseInt(itemId));
  }

  @Get('equipment')
  @ApiOperation({ 
    summary: 'Get user equipment',
    description: 'Retrieves all equipped items and calculates total shield points for the user.'
  })
  @ApiQuery({
    name: 'telegramId',
    description: 'Telegram ID of the user',
    type: 'string',
    example: '123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User equipment retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        equipment: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              shield: { type: 'number' },
              type: { type: 'string' }
            }
          } 
        },
        totalShield: { type: 'number', example: 150 },
        equipmentCount: { type: 'number', example: 3 }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  async getEquipment(
    @Query('telegramId') telegramId: string
  ) {
    return this.userService.getEquipment(telegramId);
  }

  @Get('invite')
  @ApiOperation({ 
    summary: 'Get user invite link',
    description: 'Generates a unique referral link for the user to invite friends to the game.'
  })
  @ApiQuery({
    name: 'telegramId',
    description: 'Telegram ID of the user requesting invite link',
    type: 'string',
    example: '123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invite link generated successfully',
    schema: {
      type: 'object',
      properties: {
        inviteLink: { type: 'string', example: 'https://t.me/your_bot?start=ref_123456789' },
        referralCode: { type: 'string', example: 'ref_123456789' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  async inviteUser(
    @Query('telegramId') telegramId: string
  ) {
    return this.userService.inviteUser(telegramId);
  }

  @Post('connect-wallet')
  @ApiOperation({ 
    summary: 'Connect wallet',
    description: 'Associates a cryptocurrency wallet address with the user account for blockchain transactions.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId', 'walletAddress'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        },
        walletAddress: {
          type: 'string',
          description: 'Cryptocurrency wallet address (e.g., TON wallet)',
          example: 'EQD...',
          minLength: 10
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet connected successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Wallet connected successfully' },
        walletAddress: { type: 'string', example: 'EQD...' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  async connectWallet(
    @Body() body: { telegramId: string, walletAddress: string }
  ) {
    return this.userService.connectWallet(body.telegramId, body.walletAddress);
  }

  @Get('all-users')
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieves a list of all registered users in the system. Use with caution as this can return large datasets.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          telegramId: { type: 'string' },
          displayName: { type: 'string' },
          isNewUser: { type: 'boolean' },
          balance: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async allUsers() {
    return this.userService.allUsers();
  }

  @Post('update-parameters')
  @ApiOperation({ 
    summary: 'Update user parameters',
    description: 'Updates user\'s money, shield, usdt, tools balance and item parameters by type. Useful for admin operations or game events.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user to update',
          example: '123456789'
        },
        money: {
          type: 'number',
          description: 'New money balance (optional)',
          example: 1000,
          minimum: 0
        },
        shield: {
          type: 'number',
          description: 'New shield balance (optional)',
          example: 50,
          minimum: 0
        },
        usdt: {
          type: 'number',
          description: 'New USDT balance (optional)',
          example: 100,
          minimum: 0
        },
        tools: {
          type: 'number',
          description: 'New tools balance (optional)',
          example: 25,
          minimum: 0
        },
        itemType: {
          type: 'string',
          description: 'Type of items to update (optional)',
          example: 'armor',
          enum: ['armor', 'helmet', 'leg']
        },
        itemLevel: {
          type: 'number',
          description: 'New level for items of specified type (optional)',
          example: 5,
          minimum: 1
        },
        itemShield: {
          type: 'number',
          description: 'New shield value for items of specified type (optional)',
          example: 10,
          minimum: 0
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User parameters updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User parameters updated successfully' },
        user: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  async updateUserParameters(
    @Body() body: { 
      telegramId: string; 
      money?: number; 
      shield?: number; 
      usdt?: number; 
      tools?: number;
      itemType?: string;
      itemLevel?: number;
      itemShield?: number;
    }
  ) {
    return this.userService.updateUserParameters(body.telegramId, {
      money: body.money,
      shield: body.shield,
      usdt: body.usdt,
      tools: body.tools,
      itemType: body.itemType,
      itemLevel: body.itemLevel,
      itemShield: body.itemShield,
    });
  }

  @Post('items/:itemId/update-parameter')
  @ApiOperation({ 
    summary: 'Update item parameter',
    description: 'Updates a specific parameter of an item in user\'s inventory (e.g., shield points, level, etc.).'
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID of the item to update',
    type: 'string',
    example: '1'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId', 'parameter', 'value'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        },
        parameter: {
          type: 'string',
          description: 'Parameter name to update (e.g., shield, level, name)',
          example: 'shield',
          enum: ['shield', 'level', 'name', 'type', 'price']
        },
        value: {
          description: 'New value for the parameter (type depends on parameter)',
          example: 100
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item parameter updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Item parameter updated successfully' },
        item: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or item not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User or item not found' }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Remove item from inventory',
    description: 'Permanently removes an item from user\'s inventory. This action cannot be undone.'
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID of the item to remove',
    type: 'string',
    example: '1'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['telegramId'],
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Item removed successfully' },
        inventory: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or item not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'User or item not found' }
      }
    }
  })
  async removeItem(
    @Param('itemId') itemId: string,
    @Body() body: { telegramId: string }
  ) {
    return this.userService.removeItem(body.telegramId, parseInt(itemId));
  }

  // Upgrade Settings Management Endpoints
  @Post('upgrade-settings')
  @ApiOperation({ 
    summary: 'Create upgrade settings',
    description: 'Creates new upgrade settings for a specific level range'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['levelRange', 'toolsCost', 'successRate'],
      properties: {
        levelRange: { type: 'string', example: '1-5' },
        toolsCost: { type: 'number', example: 3 },
        successRate: { type: 'number', example: 0.8 },
        useSequence: { type: 'boolean', example: false },
        sequence: { type: 'array', items: { type: 'boolean' }, example: [true, false, true] }
      }
    }
  })
  async createUpgradeSettings(
    @Body() body: {
      levelRange: string;
      toolsCost: number;
      successRate: number;
      useSequence?: boolean;
      sequence?: boolean[];
    }
  ) {
    return this.userService.createUpgradeSettings(
      body.levelRange,
      body.toolsCost,
      body.successRate,
      body.useSequence,
      body.sequence
    );
  }

  @Post('upgrade-settings/:levelRange/update')
  @ApiOperation({ 
    summary: 'Update upgrade settings',
    description: 'Updates existing upgrade settings for a specific level range'
  })
  @ApiParam({
    name: 'levelRange',
    description: 'Level range to update (e.g., "1-5")',
    type: 'string'
  })
  async updateUpgradeSettings(
    @Param('levelRange') levelRange: string,
    @Body() body: {
      toolsCost?: number;
      successRate?: number;
      useSequence?: boolean;
      sequence?: boolean[];
    }
  ) {
    return this.userService.updateUpgradeSettings(levelRange, body);
  }

  @Get('upgrade-settings')
  @ApiOperation({ 
    summary: 'Get all upgrade settings',
    description: 'Retrieves all upgrade settings or specific level range'
  })
  @ApiQuery({
    name: 'levelRange',
    description: 'Specific level range to retrieve (optional)',
    type: 'string',
    required: false
  })
  async getUpgradeSettings(
    @Query('levelRange') levelRange?: string
  ) {
    return this.userService.getUpgradeSettings(levelRange);
  }

  @Post('upgrade-settings/:levelRange/reset-sequence')
  @ApiOperation({ 
    summary: 'Reset upgrade sequence',
    description: 'Resets the current index of upgrade sequence to 0'
  })
  @ApiParam({
    name: 'levelRange',
    description: 'Level range to reset sequence for',
    type: 'string'
  })
  async resetUpgradeSequence(
    @Param('levelRange') levelRange: string
  ) {
    return this.userService.resetUpgradeSequence(levelRange);
  }
} 