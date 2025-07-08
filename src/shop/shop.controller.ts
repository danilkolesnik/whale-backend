import { Controller, Get, Post, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('items')
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createItem(@Body() createItemDto: CreateItemDto) {
    return this.shopService.createItem(createItemDto);
  }

  @Get('items')
  @ApiBearerAuth()
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Return all items' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllItems() {
    return this.shopService.getAllItems();
  }

  @Post('buy/:itemId')
  @ApiBearerAuth()
//   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buy item' })
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
  @ApiResponse({ status: 200, description: 'Item successfully purchased' })
  @ApiResponse({ status: 400, description: 'Not enough money' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  buyItem(@Param('itemId') itemId: string, @Body() body: { telegramId: string }) {
    return this.shopService.buyItem(body.telegramId, parseInt(itemId));
  }
  @Post('conversion/coin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Conversion coin' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        },
        usdtQuantity: {
          type: 'number',
          description: 'Quantity of USDT to buy',
          example: 1  
        }
      },
      required: ['telegramId', 'usdtQuantity']
    }
  })
  @ApiResponse({ status: 200, description: 'Money bought successfully' })
  @ApiResponse({ status: 400, description: 'Not enough money' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  conversionCoin(@Body() body: { telegramId: string, usdtQuantity: number }) {
    return this.shopService.conversionCoin(body.telegramId, body.usdtQuantity);
  }

  @Post('conversion/usdt')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Conversion usdt' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        },
        moneyQuantity: {
          type: 'number',
          description: 'Quantity of money to buy',
          example: 1
        } 
      },
      required: ['telegramId', 'moneyQuantity']
    }
  })
  @ApiResponse({ status: 200, description: 'USDT bought successfully' })
  @ApiResponse({ status: 400, description: 'Not enough money' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })  
  conversionUsdt(@Body() body: { telegramId: string, moneyQuantity: number }) {
    return this.shopService.conversionUsdt(body.telegramId, body.moneyQuantity);
  } 

  @Post('tools')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy tools' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          description: 'Telegram ID of the user',
          example: '123456789'
        },
        toolQuantity: {
          type: 'number',
          description: 'Quantity of tools to buy',
          example: 1
        } 
      },
      required: ['telegramId', 'toolQuantity']
    }
  })
  @ApiResponse({ status: 200, description: 'Tools bought successfully' })
  @ApiResponse({ status: 400, description: 'Not enough money' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  buyTools(@Body() body: { telegramId: string, toolQuantity: number }) {   
    return this.shopService.buyTool(body.telegramId, body.toolQuantity);
  }
} 