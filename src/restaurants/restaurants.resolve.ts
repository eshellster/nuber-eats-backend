import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.enities';

@Resolver(() => Restaurant)
export class RestaurantsResolve {
  @Query(() => Restaurant)
  myRestaurant(): boolean {
    return true;
  }

  @Query(() => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }
}
