import { Controller, Post, Body, Get } from '@nestjs/common';
import { RatingService } from './rating.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('rating')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add user to rating' })
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
  @ApiResponse({ status: 200, description: 'User added to rating successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient shield to join the rating' })
  async addUserToRating(@Body('telegramId') telegramId: string) {
    return this.ratingService.addUserToRating(telegramId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get rating list' })
  @ApiResponse({ status: 200, description: 'Return the list of users in the rating' })
  async getRatingList() {
    return this.ratingService.getRatingList();
  }

  @Post('create')
  @ApiOperation({ summary: 'Create rating' })
  @ApiResponse({ status: 200, description: 'Rating created successfully' })
  async createRating() {
    return this.ratingService.createRating();
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset rating' })
  @ApiResponse({ status: 200, description: 'Rating reset successfully' })
  async resetRating() {
    return this.ratingService.resetWeeklyRating();
  }
} 