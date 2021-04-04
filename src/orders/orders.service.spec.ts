import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsResolve } from 'src/restaurants/restaurants.resolver';
import { getRepository, Repository } from 'typeorm';
import { OrderItem } from './enties/order-item.entity';
import { Order } from './enties/order.entity';
import { OrdersService } from './orders.service';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: MockRepository<Order>;
  let dishesRepository: MockRepository<Dish>;
  let restaurantsRepository: MockRepository<Restaurant>;
  let orderItemsRepository: MockRepository<OrderItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockRepository() },
        { provide: getRepositoryToken(OrderItem), useValue: mockRepository() },
        { provide: getRepositoryToken(Dish), useValue: mockRepository() },
        { provide: getRepositoryToken(Restaurant), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepository = module.get(getRepositoryToken(Order));
    orderItemsRepository = module.get(getRepositoryToken(OrderItem));
    dishesRepository = module.get(getRepositoryToken(Dish));
    restaurantsRepository = module.get(getRepositoryToken(Restaurant));
  });

  const resraurantMenu = [{ name: '삼겹살' }, { name: '쭈꾸미삼겹살' }];
  const restaurantsResolved = {
    id: 1,
    menu: resraurantMenu,
  };

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
  describe('createOreder', () => {
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
  });
});
