import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantsResolve {
  @Query(() => Boolean)
  isPuzzaGood(): boolean {
    return true;
  }
}
