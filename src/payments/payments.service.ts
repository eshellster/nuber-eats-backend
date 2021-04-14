import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurnats: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
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

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({
        where: { user: user },
      });
      return {
        ok: true,
        payments,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Cron('50 * * * * *', {
    name: 'myJob',
  })
  checkForPayments() {
    console.log('Checking for payments...(cron)');
    const job = this.schedulerRegistry.getCronJob('myJob');
    job.stop();
  }

  @Interval(10000)
  checkForPaymentsI() {
    console.log('Checking for payments...(interval)');
  }

  @Timeout(20000)
  checkForPaymentsII() {
    console.log('Congrats!');
  }
}
