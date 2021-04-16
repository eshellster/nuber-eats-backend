import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrdersService', () => {
  let service: OrderService;
  let ordersRepository: MockRepository<Order>;
  let dishesRepository: MockRepository<Dish>;
  let restaurantsRepository: MockRepository<Restaurant>;
  let orderItemsRepository: MockRepository<OrderItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockRepository() },
        { provide: getRepositoryToken(OrderItem), useValue: mockRepository() },
        { provide: getRepositoryToken(Dish), useValue: mockRepository() },
        { provide: getRepositoryToken(Restaurant), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderItemsRepository = module.get(getRepositoryToken(OrderItem));
    dishesRepository = module.get(getRepositoryToken(Dish));
    restaurantsRepository = module.get(getRepositoryToken(Restaurant));
  });

  const customer = {
    id: 1,
    email: '',
    password: '',
    verified: true,
    role: expect.any(String),
    restaurants: [],
    checkPassword: jest.fn(() => Promise.resolve(true)),
    createAt: expect.any(Date),
    updateAt: expect.any(Date),
    orders: expect.any(Array),
    rides: expect.any(Object),
  };
  const dishResolved = {
    id: 1,
    name: '띵피자',
    price: 100,
    options: [
      {
        name: '감자',
        extra: 10,
        choices: [
          { name: '통', extra: 1 },
          { name: '슬라이스', extra: 2 },
          { name: '스틱', extra: 3 },
        ],
      },
      {
        name: '햄',
        extra: 20,
        choices: [
          { name: '베이컨', extra: 1 },
          { name: '스모키', extra: 2 },
          { name: '스팸', extra: 3 },
        ],
      },
    ],
  };
  const orderItemResolved = {
    dish: dishResolved,
    option: [{ name: '감자', choice: '통' }],
  };
  describe('createOrder', () => {
    it('should create order', async () => {
      restaurantsRepository.findOne.mockResolvedValue({ id: 1 });
      dishesRepository.findOne.mockResolvedValue(dishResolved);
      orderItemsRepository.create.mockReturnValue({
        dish: dishResolved,
        option: [],
      });
      orderItemsRepository.save.mockResolvedValue(orderItemResolved);

      const result = await service.createOrder(customer, {
        restaurantId: 1,
        items: [
          {
            dishId: 1,
            options: [
              {
                name: '감자',
                choice: '통',
              },
            ],
          },
        ],
      });

      expect(result).toMatchObject({ ok: true });
    });
    it('should not found restaurant and create order', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);
      dishesRepository.findOne.mockResolvedValue(dishResolved);
      orderItemsRepository.create.mockReturnValue({
        dish: dishResolved,
        option: [],
      });
      orderItemsRepository.save.mockResolvedValue(orderItemResolved);

      const result = await service.createOrder(customer, {
        restaurantId: 1,
        items: [
          {
            dishId: 1,
            options: [
              {
                name: '감자',
                choice: '통',
              },
            ],
          },
        ],
      });

      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑이 존재하지 않습니다.',
      });
    });
    it('should not found dish and create order', async () => {
      restaurantsRepository.findOne.mockResolvedValue({ id: 1 });
      dishesRepository.findOne.mockResolvedValue(undefined);
      orderItemsRepository.create.mockReturnValue({
        dish: dishResolved,
        option: [],
      });
      orderItemsRepository.save.mockResolvedValue(orderItemResolved);

      const result = await service.createOrder(customer, {
        restaurantId: 1,
        items: [
          {
            dishId: 1,
            options: [
              {
                name: '감자',
                choice: '통',
              },
            ],
          },
        ],
      });

      expect(result).toMatchObject({
        ok: false,
        error: '요리를 찾을 수 없습니다.',
      });
    });
  });
});
