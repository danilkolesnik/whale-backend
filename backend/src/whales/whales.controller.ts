import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { WhalesService } from './whales.service';
import { CreateWhaleDto } from './dto/create-whale.dto';
import { ContributeToWhaleDto } from './dto/contribute-to-whale.dto';
import { Whale } from './interfaces/whale.interface';

@ApiTags('Whales')
@Controller('whales')
export class WhalesController {
  constructor(private readonly whalesService: WhalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new whale' })
  @ApiBody({ type: CreateWhaleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Whale successfully created',
    type: Object
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid data' 
  })
  create(@Body() createWhaleDto: CreateWhaleDto): Whale {
    return this.whalesService.create(createWhaleDto);
  }

  @Post('contribute')
  @ApiOperation({ summary: 'Contribute money to a whale' })
  @ApiBody({ type: ContributeToWhaleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully contributed to whale',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        whale: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - insufficient funds or invalid data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Whale or user not found' 
  })
  async contribute(@Body() contributeDto: ContributeToWhaleDto) {
    return this.whalesService.contributeToWhale(contributeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all whales' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all whales',
    type: [Object]
  })
  findAll(): Whale[] {
    return this.whalesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get whale by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'Whale ID',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Whale found',
    type: Object
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Whale not found' 
  })
  findOne(@Param('id') id: string): Whale | undefined {
    return this.whalesService.findOne(id);
  }
}
