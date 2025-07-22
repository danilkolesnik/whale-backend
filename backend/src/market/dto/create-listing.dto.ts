import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, Min } from 'class-validator';

export enum Currency {
  USDT = 'USDT',
  UAH = 'UAH'
}

export class CreateListingDto {
  @ApiProperty({ description: 'ID предмета из инвентаря' })
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: 'Цена предмета' })
  @IsNumber()
  @Min(0)
  price: number;
} 