import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ description: 'Item name', example: 'Sword of Power' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Item level', minimum: 1, example: 5 })
  @IsNumber()
  @Min(1)
  level: number;

  @ApiProperty({ description: 'Item shield value', minimum: 0, example: 100 })
  @IsNumber()
  @Min(0)
  shield: number;

  @ApiProperty({ description: 'Item type', example: 'type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Item price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
} 