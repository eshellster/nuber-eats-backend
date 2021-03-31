import { Field, InputType, Int } from '@nestjs/graphql';
import { OrderItemOption } from '../enties/order-item.entity';

@InputType()
export class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}
