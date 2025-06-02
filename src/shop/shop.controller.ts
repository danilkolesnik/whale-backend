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
} 