import { Field, InputType, Int } from '@nestjs/graphql';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
export class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => Int)
  orderSize?: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}
