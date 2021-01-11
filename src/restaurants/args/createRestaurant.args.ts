import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreateRestaurantArgs {
  @Field(() => String)
  name: string;
  @Field(() => Boolean)
  isVeagn: boolean;
  @Field(() => String)
  address: string;
  @Field(() => String)
  ownerName: string;
}
