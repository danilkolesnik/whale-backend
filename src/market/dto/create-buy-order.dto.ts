import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyOrderDto {
    @ApiProperty({
        description: 'Type of the item to buy',
        example: 'sword'
    })
    itemType: string;

    @ApiProperty({
        description: 'Level of the item to buy',
        example: 3
    })
    level: number;

    @ApiProperty({
        description: 'Price the buyer is willing to pay',
        example: 80
    })
    price: number;
}