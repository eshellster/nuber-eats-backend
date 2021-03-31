import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/Entities/user.entity';
import { In, Repository } from 'typeorm';
import { isTemplateSpan } from 'typescript';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './enties/order-item.entity';
import { Order } from './enties/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
  ) {}

  async createOrder(
    costomer: User,
    { restaurantId, orderItems }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑이 존제하지 않습니다.',
        };
      }
      orderItems.forEach(async (item) => {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // abort this whole thing
        }
        await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
