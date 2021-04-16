import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entites/core.entity';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 100)
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  @IsString()
  coverImg: string;

  // @Field(() => Boolean, { defaultValue: false }) // <-- GraphQL 스키마에 전달
  // @Column({ default: false }) // <-- DB의 필드에 전달 - 없어도 됨
  // @IsBoolean()
  // @IsOptional() // <-- Validator에 전달
  // isVegan: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.restaurants, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @Field(() => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;
}
