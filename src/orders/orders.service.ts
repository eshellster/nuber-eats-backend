import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/Entities/user.entity';
import { Repository } from 'typeorm';
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
    customer: User,
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
      let orderFinalPrice = 0;
      const newOrderList: OrderItem[] = [];
      for (const orderItem of orderItems) {
        const dish = await this.dishes.findOne(orderItem.dishId);
        if (!dish) {
          return {
            ok: false,
            error: '요리를 찾을 수 없습니다.',
          };
        }
        let dishFinalPrice = dish.price;
        for (const orderItemOption of orderItem.options) {
          const dishOption = dish.options.find(
            (options) => options.name === orderItemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            }
            const dishOptionChoice = dishOption.choices?.find(
              (choices) => choices.name === orderItemOption.choice,
            );
            if (dishOptionChoice?.extra) {
              dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const item = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: orderItem.options,
          }),
        );
        newOrderList.push(item);
      }
      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          orderItems: newOrderList,
        }),
      );

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
