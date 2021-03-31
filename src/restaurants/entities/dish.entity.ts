import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entites/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(() => String)
  name: string;

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [DishChoice], { nullable: true })
  choices: DishChoice[];

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(1)
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  @IsBoolean()
  soldOut?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  @IsBoolean()
  invisible?: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Length(0, 140)
  description: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
