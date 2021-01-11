import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantArgs } from './args/createRestaurant.args';
import { Restaurant } from './entities/restaurant.enities';
import { CreateRestaurantInput } from './inputs/createRestaurant.input';

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

  @Mutation(() => Boolean)
  createRestaurant(
    @Args() createRestaurantArgs: CreateRestaurantArgs,
  ): boolean {
    console.log(createRestaurantArgs);
    return true;
  }
}
