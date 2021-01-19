import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(3, 10)
  name: string;

  @Field(() => Boolean, { defaultValue: false }) // <-- GraphQL 스키마에 전달
  @Column({ default: false }) // <-- DB의 필드에 전달 - 없어도 됨
  @IsBoolean()
  @IsOptional() // <-- Validator에 전달
  isVegan: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(3, 10)
  ownerName: string;
}
