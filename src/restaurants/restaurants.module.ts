import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsResolve } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantsResolve, RestaurantService],
})
export class RestaurantsModule {}
