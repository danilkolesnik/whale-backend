import { ApiProperty } from '@nestjs/swagger';

export class WhaleResponseDto {
  @ApiProperty({ description: 'Unique whale identifier', example: 'abc123def' })
  id: string;
  
  @ApiProperty({ description: 'Total amount that users should contribute', example: 1000 })
  total: number;
  
  @ApiProperty({ description: 'Array of user IDs who have contributed', example: ['user1', 'user2'], type: [String] })
  users: string[];
  
  @ApiProperty({ description: 'Total amount already contributed by users', example: 250.5 })
  moneyTotal: number;
  
  @ApiProperty({ description: 'Date when whale was created', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
  
  @ApiProperty({ description: 'Date when whale was last updated', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
