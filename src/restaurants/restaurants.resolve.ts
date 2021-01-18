import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.enities';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantsResolve {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(() => Restaurant)
  myRestaurant(): boolean {
    return true;
  }

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(() => Boolean)
  async createRestaurant(
    @Args() createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
