import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantService } from './restaurants.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
});

const mockCategory = () => ({
  getOrCreate: jest.fn(() => Category),
  find: jest.fn(() => [Category]),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('RestaurantsService', () => {
  let service: RestaurantService;
  let restaurantsRepository: MockRepository<Restaurant>;
  let categoryRepository: CategoryRepository;
  // let categoriesRespository: MockRepository<Category>;

  const ownerArgs = {
    id: 1,
    email: '',
    password: '',
    verified: true,
    role: expect.any(String),
    restaurants: [],
    checkPassword: jest.fn(() => Promise.resolve(true)),
    createAt: expect.any(Date),
    updateAt: expect.any(Date),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository(),
        },
        { provide: getRepositoryToken(Dish), useValue: mockRepository() },
        // { provide: getRepositoryToken(Category), useValue: mockRepository() },
        {
          provide: getRepositoryToken(CategoryRepository),
          useValue: mockCategory(),
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    restaurantsRepository = module.get(getRepositoryToken(Restaurant));
    // categoriesRespository = module.get(getRepositoryToken(Category));
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defiend', () => {
    expect(service).toBeDefined();
  });
  describe('createRestaurant', () => {
    const createRestaurantArgs = {
      name: '',
      coverImg: '',
      address: '',
      categoryName: '프렌치랙',
    };
    // const category: Category = {
    //   id: 1,
    //   createAt: expect.any(Date),
    //   updateAt: expect.any(Date),
    //   name: '',
    //   coverImg: '',
    //   slug: '',
    //   restaurants: [],
    // };
    it('성공유도: 레스토랑 생성', async () => {
      restaurantsRepository.create.mockReturnValue(createRestaurantArgs);
      restaurantsRepository.save.mockResolvedValue(createRestaurantArgs);
      const result = await service.createRestaurant(
        ownerArgs,
        createRestaurantArgs,
      );
      expect(restaurantsRepository.create).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.create).toHaveBeenCalledWith(
        createRestaurantArgs,
      );

      expect(restaurantsRepository.save).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.save).toHaveBeenCalledWith(
        createRestaurantArgs,
      );

      expect(categoryRepository.getOrCreate).toHaveBeenCalledTimes(1);
      expect(categoryRepository.getOrCreate).toHaveBeenCalledWith(
        createRestaurantArgs.categoryName,
      );

      expect(result).toMatchObject({ ok: true });
    });
  });
  describe('editRestaurant', () => {
    const modkedRestaurant = {
      id: 1,
      ownerId: 1,
    };
    it('성공유도: 레스토랑이 존재하고 사용자가 오너일때', async () => {
      restaurantsRepository.findOne.mockResolvedValue(modkedRestaurant);
      const result = await service.editRestaurant(ownerArgs, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({ ok: true });
    });
    it('실패유도:수정할 레스토랑이 없는 경우', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.editRestaurant(ownerArgs, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      });
    });
    it('실패유도: 사용자가 오너와 일치하지 않을 때', async () => {
      restaurantsRepository.findOne.mockResolvedValue({
        ...modkedRestaurant,
        ownerId: 2,
      });

      const result = await service.editRestaurant(ownerArgs, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑 소유자 권한이 없습니다.',
      });
    });
  });
  describe('deleteRestaurant', () => {
    const modkedRestaurant = {
      id: 1,
      ownerId: 1,
    };
    it('성공유도: 레스토랑이 존재하고 사용자가 오너일때', async () => {
      restaurantsRepository.findOne.mockResolvedValue(modkedRestaurant);
      const result = await service.deleteRestaurant(ownerArgs, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({ ok: true });
    });
    it('실패유도:수정할 레스토랑이 없는 경우', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.deleteRestaurant(ownerArgs, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      });
    });
    it('실패유도: 사용자가 오너와 일치하지 않을 때', async () => {
      restaurantsRepository.findOne.mockResolvedValue({
        ...modkedRestaurant,
        ownerId: 2,
      });

      const result = await service.deleteRestaurant(ownerArgs, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑 소유자 권한이 없습니다.',
      });
    });
  });
  describe('allRestaurants', () => {
    it('성공유도: 레스토랑 페이지별로 출력', async () => {
      restaurantsRepository.findAndCount.mockResolvedValue([
        expect.any(Array),
        expect.any(Number),
      ]);
      const result = await service.allRestaurants({ page: 1, limit: 1 });

      expect(restaurantsRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.findAndCount).toHaveBeenCalledWith({
        take: expect.any(Number),
        skip: expect.any(Number),
      });

      expect(result).toMatchObject({
        ok: true,
        restaurants: expect.any(Array),
        totalPages: expect.any(Number),
        totalResults: expect.any(Number),
      });
    });
    it('실패유도: 레스토랑 페이지별 출력', async () => {
      restaurantsRepository.findAndCount.mockRejectedValue(new Error());

      const result = await service.allRestaurants({ page: 1, limit: 1 });

      expect(result).toMatchObject({
        ok: false,
        error: expect.any(Object),
      });
    });
  });

  describe('allCategories', () => {
    it('성공유도: 모든 카테고리 가져오기', async () => {
      const result = await service.allCategories();
      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      console.log(result);

      expect(result).toMatchObject({
        ok: true,
        categories: expect.any(Array),
      });
    });
  });
  it.todo('countRestaurants');
  it.todo('findCategoryBySlug');
  it.todo('findRestaurantById');
  it.todo('searchRestaurants');
  it.todo('createDish');
  it.todo('editDish');
  it.todo('deleteDish');
});
