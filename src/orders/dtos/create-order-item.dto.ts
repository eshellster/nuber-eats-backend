import { Field, InputType, Int } from '@nestjs/graphql';
import { DishOption } from 'src/restaurants/entities/dish.entity';

@InputType()
export class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => DishOption, { nullable: true })
  options?: DishOption[];
}
