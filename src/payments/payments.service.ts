import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurnats: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurnats.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '결재할 권한이 없습니다.',
        };
      }
      await this.payments.save(
        this.payments.create({ transactionId, user: owner, restaurant }),
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
