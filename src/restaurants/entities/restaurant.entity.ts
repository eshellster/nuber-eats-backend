import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entites/core.entity';
import { Category } from './category.entity';

@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 100)
  name: string;

  @Field(() => String)
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

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.restaurants)
  category: Category;
}
