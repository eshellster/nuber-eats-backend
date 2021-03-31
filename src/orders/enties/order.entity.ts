import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entites/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/Entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  costomer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem)
  @JoinTable()
  orderItem: OrderItem[];

  @Column()
  @Field(() => Float)
  @IsNumber()
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending }) // service에서 설정하지 않아도 되어서 일을 덜어준다.
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
