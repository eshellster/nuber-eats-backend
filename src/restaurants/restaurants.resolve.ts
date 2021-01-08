import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantsResolve {
  @Query(() => Boolean)
  isPuzzaGood() {
    return true;
  }
}
