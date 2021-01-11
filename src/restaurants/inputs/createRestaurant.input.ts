import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRestaurantInput {
  @Field(() => String)
  name: string;
  @Field(() => Boolean)
  isVeagn: boolean;
  @Field(() => String)
  address: string;
  @Field(() => String)
  ownerName: string;
}
