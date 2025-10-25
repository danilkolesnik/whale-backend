import { IsNumber, IsArray, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWhaleDto {
  @ApiProperty({ 
    description: 'Total amount that users should contribute',
    example: 1000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  total: number; // сколько должны закинуть юзеры

  @ApiProperty({ 
    description: 'Array of user IDs who have contributed',
    example: ['user1', 'user2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  users: string[]; // массив юзеров которые закинули монеты

  @ApiProperty({ 
    description: 'Total amount already contributed by users',
    example: 250.5,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  moneyTotal: number; // сколько закинули юзеры
}
