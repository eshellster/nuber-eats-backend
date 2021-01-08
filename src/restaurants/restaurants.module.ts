import { Module } from '@nestjs/common';
import { RestaurantsResolve } from './restaurants.resolve';

@Module({
  providers: [RestaurantsResolve],
})
export class RestaurantsModule {}
