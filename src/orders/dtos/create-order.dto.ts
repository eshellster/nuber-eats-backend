import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateOrderItemInput } from './create-order-item.dto';

@InputType()
export class CreateOrderInput {
  @Field(() => [CreateOrderItemInput])
  orderItems: CreateOrderItemInput[];

  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
