import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { Currency } from './create-listing.dto';

export class UpdateListingDto {
  @ApiProperty({ description: 'Новая цена предмета', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Новый уровень предмета', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  level?: number;
} 