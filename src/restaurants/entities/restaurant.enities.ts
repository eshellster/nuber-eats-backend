import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsString, Length } from 'class-validator';

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

  @Field(() => Boolean, { nullable: true })
  @Column()
  @IsBoolean()
  isVegan?: boolean;

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
