import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class AllCategoriesInput extends PaginationInput {}

@ObjectType()
export class AllCategoriesOutput extends PaginationOutput {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
