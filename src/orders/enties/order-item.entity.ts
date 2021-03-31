import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entites/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true }) // 메뉴에서는 복수이지만 결정은 한가지만 해야함 -> 그냥 스트링으로 이름을 전달하면됨.
  choice: string;

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
