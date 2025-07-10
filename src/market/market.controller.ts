import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CreateBuyOrderDto } from './dto/create-buy-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Market')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('listings')
  @ApiOperation({ 
    summary: 'Create a new market listing',
    description: 'Create a new listing to sell an item. Item must be level 17 or higher and not equipped.'
  })
  @ApiBody({
    type: CreateListingDto,
    description: 'Listing creation data',
    examples: {
      example1: {
        value: {
          telegramId: "123456789",
          itemId: 1,
          price: 100
        },
        summary: 'Create listing in USDT'
      },
      example2: {
        value: {
          telegramId: "123456789",
          itemId: 2,
          price: 3000
        },
        summary: 'Create listing in UAH'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Listing created successfully',
    schema: {
      example: {
        id: 1,
        sellerId: "123456789",
        item: {
          id: 1,
          name: "Shield",
          level: 17,
          shield: 50,
          type: "defense"
        },
        price: 100,
        currency: "USDT",
        createdAt: "2024-03-14T12:00:00Z"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or item level too low',
    schema: {
      example: {
        statusCode: 400,
        message: "Item level must be at least 17 to sell"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or item not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Item not found in inventory"
      }
    }
  })
  async createListing(
    @Body() body: { telegramId: string } & CreateListingDto
  ) {
    const { telegramId, ...createListingDto } = body;
    return this.marketService.createListing(telegramId, createListingDto);
  }

  @Post('listings/:id/update')
  @ApiOperation({ 
    summary: 'Update a market listing',
    description: 'Update price or currency of your existing listing'
  })
  @ApiParam({
    name: 'id',
    description: 'Listing ID',
    type: 'number',
    example: 1
  })
  @ApiBody({
    type: UpdateListingDto,
    description: 'Listing update data',
    examples: {
      example1: {
        value: {
          telegramId: "123456789",
          price: 150
        },
        summary: 'Update price only'
      },
      example2: {
        value: {
          telegramId: "123456789",
          price: 200,
          currency: "UAH"
        },
        summary: 'Update both price and currency'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Listing updated successfully',
    schema: {
      example: {
        id: 1,
        sellerId: "123456789",
        item: {
          id: 1,
          name: "Shield",
          level: 17,
          shield: 50,
          type: "defense"
        },
        price: 150,
        currency: "USDT",
        updatedAt: "2024-03-14T12:30:00Z"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or not your listing',
    schema: {
      example: {
        statusCode: 400,
        message: "You can only update your own listings"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Listing not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Listing not found"
      }
    }
  })
  async updateListing(
    @Param('id') id: string,
    @Body() body: { telegramId: string } & UpdateListingDto
  ) {
    const { telegramId, ...updateListingDto } = body;
    return this.marketService.updateListing({ listingId: parseInt(id), updateListingDto });
  }

  @Post('listings/:id/buy')
  @ApiOperation({ 
    summary: 'Buy an item from market',
    description: 'Purchase an item from another user\'s listing'
  })
  @ApiParam({
    name: 'id',
    description: 'Listing ID',
    type: 'number',
    example: 1
  })
  @ApiBody({
    description: 'Buyer information',
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          example: '123456789'
        },
        currency: {
          type: 'string',
          example: 'USDT'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item purchased successfully',
    schema: {
      example: {
        message: "Item purchased successfully"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Not enough money or trying to buy own listing',
    schema: {
      example: {
        statusCode: 400,
        message: "Not enough money"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Listing or user not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Listing not found"
      }
    }
  })
  async buyListing(
    @Param('id') id: string,
    @Body() body: { telegramId: string, currency: string }
  ) {
    return this.marketService.buyListing({ telegramId: body.telegramId, currency: body.currency, listingId: parseInt(id) });
  }

  @Get('listings')
  @ApiOperation({ 
    summary: 'Get all market listings',
    description: 'Retrieve all active listings from the market'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all listings',
    schema: {
      example: [{
        id: 1,
        sellerId: "123456789",
        item: {
          id: 1,
          name: "Shield",
          level: 17,
          shield: 50,
          type: "defense"
        },
        price: 100,
        currency: "USDT",
        createdAt: "2024-03-14T12:00:00Z" 
      }]
    }
  })
  async getListings(
    @Query('telegramId') telegramId?: string
  ) {
    return this.marketService.getListings(telegramId);
  }

  @Get('listings/user')
  @ApiOperation({ 
    summary: 'Get user\'s market listings',
    description: 'Retrieve all listings created by specific user'
  })
  @ApiQuery({
    name: 'telegramId',
    description: 'User\'s Telegram ID',
    type: 'string',
    example: '123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return user\'s listings',
    schema: {
      example: [{
        id: 1,
        sellerId: "123456789",
        item: {
          id: 1,
          name: "Shield",
          level: 17,
          shield: 50,
          type: "defense"
        },
        price: 100,
        currency: "USDT",
        createdAt: "2024-03-14T12:00:00Z"
      }]
    }
  })
  async getUserListings(
    @Query('telegramId') telegramId: string
  ) {
    return this.marketService.getUserListings(telegramId);
  }

  @Post('buy-orders')
  @ApiOperation({ 
    summary: 'Create a new buy order',
    description: 'Create a new order to buy an item. Specify item type, level, and price.'
  })
  @ApiBody({
    type: CreateBuyOrderDto,
    description: 'Buy order creation data',
    examples: {
      example1: {
        value: {
          telegramId: "123456789",
          itemType: "helmet",
          level: 3,
          price: 80
        },
        summary: 'Create buy order for a helmet'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Buy order created successfully',
    schema: {
      example: {
        id: 1,
        buyerId: "123456789",
        itemType: "helmet",
        level: 3,
        price: 80,
        currency: "USDT",
        createdAt: "2024-03-14T12:00:00Z"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Not enough money',
    schema: {
      example: {
        statusCode: 400,
        message: "Not enough money"
      }
    }
  })
  async createBuyOrder(
    @Body() body: { telegramId: string } & CreateBuyOrderDto
  ) {
    const { telegramId, ...createBuyOrderDto } = body;
    return this.marketService.createBuyOrder(telegramId, createBuyOrderDto);
  }

  @Get('buy-orders')
  @ApiOperation({ 
    summary: 'Get all buy orders',
    description: 'Retrieve all active buy orders from the market, prioritizing orders from a specific user if telegramId is provided.'
  })
  @ApiQuery({
    name: 'telegramId',
    description: 'Optional user Telegram ID to prioritize their orders',
    type: 'string',
    required: false,
    example: '123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all buy orders',
    schema: {
      example: [{
        id: 1,
        buyerId: "123456789",
        itemType: "sword",
        level: 3,
        price: 80,
        currency: "USDT",
        createdAt: "2024-03-14T12:00:00Z"
      }]
    }
  })
  async getBuyOrders(
    @Query('telegramId') telegramId?: string
  ) {
    return this.marketService.getBuyOrders(telegramId);
  }

  @Post('buy-orders/:id/fulfill')
  @ApiOperation({ 
    summary: 'Fulfill a buy order',
    description: 'Sell your item to fulfill a buy order'
  })
  @ApiParam({
    name: 'id',
    description: 'Buy order ID',
    type: 'number',
    example: 1
  })
  @ApiBody({
    description: 'Seller information and item ID',
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          example: '123456789'
        },
        currency: {
          type: 'string',
          example: 'USDT'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order fulfilled successfully',
    schema: {
      example: {
        message: "Order fulfilled successfully"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Item not found or not enough money',
    schema: {
      example: {
        statusCode: 400,
        message: "Item not found in inventory"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order or user not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Order not found"
      }
    }
  })
  async fulfillBuyOrder(
    @Param('id') id: string,
    @Body() body: { telegramId: string, currency: string }
  ) {
    return this.marketService.fulfillBuyOrder(body.telegramId, parseInt(id), body.currency);
  }

  @Post('buy-orders/:id/update')
  @ApiOperation({ 
    summary: 'Change the price of a buy order',
    description: 'Update the price of an existing buy order'
  })
  @ApiParam({
    name: 'id',
    description: 'Buy order ID',  
    type: 'number',
    example: 1
  })
  @ApiBody({
    description: 'New price for the buy order',
    schema: {
      type: 'object',
      properties: {
        newPrice: {
          type: 'number',
          example: 100
        },
        newLevel: {
          type: 'number',
          example: 17
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Price changed successfully',
    schema: {
      example: {
        message: "Price changed successfully"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or not your order',
    schema: {
      example: {
        statusCode: 400,
        message: "You can only change the price of your own orders"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Order not found"
      }
    }
  })
  async changePriceOrder(
    @Param('id') id: string,
    @Body() body: { newPrice: number, newLevel: number }
  ) {
    return this.marketService.changePriceOrder(parseInt(id), body.newPrice, body.newLevel);
  }

  @Post('buy-orders/:id/delete')
  @ApiOperation({ 
    summary: 'Delete a buy order',
    description: 'Delete an existing buy order'
  })
  @ApiParam({
    name: 'id',
    description: 'Buy order ID',
    type: 'number', 
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order deleted successfully',
    schema: {
      example: {
        message: "Order deleted successfully"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or not your order',
    schema: {
      example: {
        statusCode: 400,  
        message: "You can only delete your own orders"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found',
    schema: {
      example: {  
        statusCode: 404,
        message: "Order not found"
      }
    }
  })
  async deleteBuyOrder(
    @Param('id') id: string,
    @Body() body: { telegramId: string }
  ) { 
    return this.marketService.deleteBuyOrder(body.telegramId, parseInt(id));
  }

  @Post('listings/:id/delete')
  @ApiOperation({ 
    summary: 'Delete a listing',
    description: 'Delete an existing listing'
  })  
  @ApiParam({
    name: 'id',
    description: 'Listing ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Listing deleted successfully',  
    schema: {
      example: {
        message: "Listing deleted successfully"
      }
    }
  })
  @ApiResponse({ 
    status: 400,  
    description: 'Invalid request or not your listing',
    schema: {
      example: {
        statusCode: 400,
        message: "You can only delete your own listings"
      }
    }
  })
  @ApiResponse({    
    status: 404, 
    description: 'Listing not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Listing not found"
      }
    }
  })
  async deleteListing(
    @Param('id') id: string,
    @Body() body: { telegramId: string }
  ) {
    return this.marketService.deleteListing(body.telegramId, parseInt(id));
  }
} 