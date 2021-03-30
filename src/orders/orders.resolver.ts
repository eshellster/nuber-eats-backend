import { Resolver } from '@nestjs/graphql';
import { Order } from './enties/order.entity';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}
}
