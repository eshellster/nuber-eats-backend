import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './enties/order.entity';
import { OrderItem } from './enties/order-item.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant])],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
