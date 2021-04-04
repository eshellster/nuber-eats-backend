import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EditDishInput } from './dtos/edit-dish.dto';
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
  count: jest.fn(),
  find: jest.fn(),
});

const mockCategory = () => ({
  getOrCreate: jest.fn(() => Category),
  find: jest.fn(() => [Category]),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('RestaurantsService', () => {
  let service: RestaurantService;
  let restaurantsRepository: MockRepository<Restaurant>;
  let dishesRepository: MockRepository<Dish>;
  let categoryRepository: CategoryRepository;
  let categoriesRespository: MockRepository<Category>;

  const ownerResolved = {
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
  const categoryResolved = {
    id: 1,
    createAt: expect.any(Date),
    updateAt: expect.any(Date),
    name: '',
    coverImg: '',
    slug: '',
    restaurants: [],
  };

  const resraurantMenu = [{ name: '삼겹살' }, { name: '쭈꾸미삼겹살' }];
  const restaurantsResolved = {
    id: 1,
    ownerId: 1,
    menu: resraurantMenu,
  };
  const dishResolved = {
    id: 1,
    restaurant: restaurantsResolved,
    name: '오겹살',
    price: 1,
    description: '',
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
        { provide: getRepositoryToken(Category), useValue: mockRepository() },
        {
          provide: getRepositoryToken(CategoryRepository),
          useValue: mockCategory(),
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    restaurantsRepository = module.get(getRepositoryToken(Restaurant));
    dishesRepository = module.get(getRepositoryToken(Dish));
    categoriesRespository = module.get(getRepositoryToken(Category));
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
    it('성공유도: 레스토랑 생성', async () => {
      restaurantsRepository.create.mockReturnValue(createRestaurantArgs);
      restaurantsRepository.save.mockResolvedValue(createRestaurantArgs);
      const result = await service.createRestaurant(
        ownerResolved,
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
    const restaurantResolved = {
      id: 1,
      ownerId: 1,
    };
    it('성공유도: 레스토랑이 존재하고 사용자가 오너일때', async () => {
      restaurantsRepository.findOne.mockResolvedValue(restaurantResolved);
      const result = await service.editRestaurant(ownerResolved, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({ ok: true });
    });
    it('실패유도:수정할 레스토랑이 없는 경우', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.editRestaurant(ownerResolved, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      });
    });
    it('실패유도: 사용자가 오너와 일치하지 않을 때', async () => {
      restaurantsRepository.findOne.mockResolvedValue({
        ...restaurantResolved,
        ownerId: 2,
      });

      const result = await service.editRestaurant(ownerResolved, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑 소유자 권한이 없습니다.',
      });
    });
  });
  describe('deleteRestaurant', () => {
    const restaurantResolved = {
      id: 1,
      ownerId: 1,
    };
    it('성공유도: 레스토랑이 존재하고 사용자가 오너일때', async () => {
      restaurantsRepository.findOne.mockResolvedValue(restaurantResolved);
      const result = await service.deleteRestaurant(ownerResolved, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({ ok: true });
    });
    it('실패유도:수정할 레스토랑이 없는 경우', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.deleteRestaurant(ownerResolved, {
        restaurantId: 1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      });
    });
    it('실패유도: 사용자가 오너와 일치하지 않을 때', async () => {
      restaurantsRepository.findOne.mockResolvedValue({
        ...restaurantResolved,
        ownerId: 2,
      });

      const result = await service.deleteRestaurant(ownerResolved, {
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
      categoriesRespository.find.mockResolvedValue(expect.any(Array));
      const result = await service.allCategories();

      expect(categoriesRespository.find).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject({
        ok: true,
        categories: expect.any(Array),
      });
    });
    it('실패유도: 카테고리 가져오기 실패', async () => {
      categoriesRespository.find.mockRejectedValue(new Error());

      const result = await service.allCategories();

      expect(result).toMatchObject({
        ok: false,
        error: '카테고리 가져오기를 실패했습니다.',
      });
    });
  });
  describe('countRestaurants', () => {
    it('성공유도: 카테고리별 레스토랑수', async () => {
      const restaurantCategorySize = 12;
      restaurantsRepository.count.mockReturnValue(restaurantCategorySize);
      const result = await service.countRestaurants(categoryResolved);

      expect(result).toBe(restaurantCategorySize);
    });
  });
  describe('findCategoryBySlug', () => {
    const slug = '주점';
    const categorySlugResolved = {
      ...categoryResolved,
      slug,
    };
    it('성공유도: 카테고리 검색', async () => {
      categoriesRespository.findOne.mockResolvedValue(categorySlugResolved);

      restaurantsRepository.find.mockResolvedValue([
        {
          category: categorySlugResolved,
        },
      ]);

      const result = await service.findCategoryBySlug({
        slug,
        page: 1,
        limit: 20,
      });

      expect(categoriesRespository.findOne).toHaveBeenCalledTimes(1);
      expect(categoriesRespository.findOne).toHaveBeenCalledWith({ slug });

      expect(restaurantsRepository.find).toHaveBeenCalledTimes(1);

      expect(result.restaurants[0].category.slug).toBe(slug);

      expect(result).toMatchObject({
        ok: true,
        category: expect.any(Object),
        restaurants: expect.any(Array),
        totalPages: expect.any(Number),
      });
    });
    it('실패유도: 카테고리가 없는 경우', async () => {
      categoriesRespository.findOne.mockResolvedValueOnce(undefined);

      const result = await service.findCategoryBySlug({
        slug,
        page: 1,
        limit: 20,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      });
    });
    it('실패유도: 카테고리 에러발생', async () => {
      categoriesRespository.findOne.mockRejectedValue(new Error());

      const result = await service.findCategoryBySlug({
        slug,
        page: 1,
        limit: 20,
      });

      expect(result).toMatchObject({
        ok: false,
        error: expect.any(Object),
      });
    });
  });
  describe('findRestaurantById', () => {
    it('성공유도: 레스토랑 아이디로 찾기', async () => {
      restaurantsRepository.findOne.mockResolvedValue({ id: 1 });

      const result = await service.findRestaurantById({ restaurantId: 1 });

      expect(result).toMatchObject({
        ok: true,
        restaurant: expect.any(Object),
      });
    });
  });
  describe('searchRestaurants', () => {
    const searchRestaurantsArgs = {
      query: '',
      page: 1,
      limit: 20,
    };
    it('성공유도: 레스토랑 찾기', async () => {
      restaurantsRepository.findAndCount.mockResolvedValue([
        [{ id: 1, name: '레스토랑' }],
        1,
      ]);
      const result = await service.searchRestaurants({
        query: '',
        page: 1,
        limit: 20,
      });

      expect(restaurantsRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.any(Object),
        take: searchRestaurantsArgs.limit,
        skip: (searchRestaurantsArgs.page - 1) * searchRestaurantsArgs.limit,
      });

      expect(result).toMatchObject({
        ok: true,
        restaurants: expect.any(Array),
        totalPages: expect.any(Number),
        totalResults: expect.any(Number),
      });
    });
    it('실패유도: 검색결과 레스토랑이 없다.', async () => {
      restaurantsRepository.findAndCount.mockResolvedValue([[], 0]);
      const result = await service.searchRestaurants({
        query: '',
        page: 1,
        limit: 20,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      });
    });
    it('실패유도: 레스토랑 검색중 에러발생', async () => {
      restaurantsRepository.findAndCount.mockRejectedValue(new Error());
      const result = await service.searchRestaurants({
        query: '',
        page: 1,
        limit: 20,
      });

      expect(result).toMatchObject({
        ok: false,
        error: expect.any(Object),
      });
    });
  });

  describe('createDish', () => {
    const createDishesArgs = {
      ...dishResolved,
      restaurantId: restaurantsResolved.id,
    };
    it('성공유도: 요리생성하기', async () => {
      restaurantsRepository.findOne.mockResolvedValue(restaurantsResolved);

      dishesRepository.create.mockResolvedValue(dishResolved);

      const result = await service.createDish(ownerResolved, createDishesArgs);

      expect(restaurantsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantsRepository.findOne).toHaveBeenCalledWith(1, {
        relations: ['menu'],
      });

      expect(dishesRepository.create).toHaveBeenCalledTimes(1);
      expect(dishesRepository.create).toHaveBeenCalledWith(createDishesArgs);

      expect(dishesRepository.save).toHaveBeenCalledTimes(1);
      expect(dishesRepository.save).toHaveBeenCalledWith(
        Promise.resolve(createDishesArgs),
      );

      expect(result).toMatchObject({
        ok: true,
      });
    });
    it('실패유도: 레스토랑이 없을 때', async () => {
      restaurantsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.createDish(ownerResolved, createDishesArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      });
    });
    it('실패유도: 레스토랑 소유주와 생성자가 다른 경우', async () => {
      restaurantsRepository.findOne.mockResolvedValue(restaurantsResolved);

      const result = await service.createDish(
        { ...ownerResolved, id: 2 },
        createDishesArgs,
      );

      expect(result).toMatchObject({
        ok: false,
        error: '레스토랑 소유주가 아닙니다.',
      });
    });
    it('실패유도: 요리가 이미 존재하는 경우', async () => {
      restaurantsRepository.findOne.mockResolvedValue(restaurantsResolved);

      const result = await service.createDish(ownerResolved, {
        ...createDishesArgs,
        name: resraurantMenu[0].name,
      });

      expect(result).toMatchObject({
        ok: false,
        error: '같은 이름의 요리가 존재합니다.',
      });
    });
  });
  describe('editDish', () => {
    const editDishArgs: EditDishInput = {
      dishId: 1,
      name: '',
    };
    it('성공유도: 요리정보 수정', async () => {
      dishesRepository.findOne.mockResolvedValue(dishResolved);

      const result = await service.editDish(ownerResolved, editDishArgs);

      expect(dishesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishesRepository.findOne).toHaveBeenCalledWith(
        editDishArgs.dishId,
        { relations: ['restaurant'] },
      );

      expect(dishesRepository.save).toHaveBeenCalledTimes(1);
      expect(dishesRepository.save).toHaveBeenCalledWith([
        { id: editDishArgs.dishId, ...editDishArgs },
      ]);

      expect(result).toMatchObject({ ok: true });
    });
    it('실패유도: 해당 요리가 없는 경우', async () => {
      dishesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.editDish(ownerResolved, editDishArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '요리를 찾을 수 없습니다.',
      });
    });
    it('실패유도: 사용자가 레스토랑 오너가 아니 경우', async () => {
      dishesRepository.findOne.mockResolvedValue(dishResolved);

      const result = await service.editDish(
        { ...ownerResolved, id: 0 },
        editDishArgs,
      );
      expect(result).toMatchObject({
        ok: false,
        error: '요리 정보를 수정할 권한이 없습니다.',
      });
    });
    it('실패유도: 요리 찾기에서 에러가 발생', async () => {
      dishesRepository.findOne.mockRejectedValue(new Error());

      const result = await service.editDish(ownerResolved, editDishArgs);

      expect(result).toMatchObject({
        ok: false,
        error: expect.any(Object),
      });
    });
  });
  describe('deleteDish', () => {
    it('성공유도: 요리를 삭제', async () => {
      dishesRepository.findOne.mockResolvedValue(dishResolved);
      const result = await service.deleteDish(ownerResolved, {
        dishId: dishResolved.id,
      });

      expect(dishesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(dishesRepository.findOne).toHaveBeenCalledWith(dishResolved.id, {
        relations: ['restaurant'],
      });

      expect(dishesRepository.delete).toHaveBeenCalledTimes(1);
      expect(dishesRepository.delete).toHaveBeenCalledWith(dishResolved.id);

      expect(result).toMatchObject({ ok: true });
    });
    it('실패유도: 해당 요리가 없는 경우', async () => {
      dishesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.deleteDish(ownerResolved, {
        dishId: dishResolved.id,
      });

      expect(result).toMatchObject({
        ok: false,
        error: '요리를 찾을 수 없습니다.',
      });
    });
    it('실패유도: 사용자가 레스토랑 오너가 아니 경우', async () => {
      dishesRepository.findOne.mockResolvedValue(dishResolved);

      const result = await service.deleteDish(
        { ...ownerResolved, id: 0 },
        {
          dishId: dishResolved.id,
        },
      );
      expect(result).toMatchObject({
        ok: false,
        error: '요리 정보를 삭제할 권한이 없습니다.',
      });
    });
    it('실패유도: 요리 찾기에서 에러가 발생', async () => {
      dishesRepository.findOne.mockRejectedValue(new Error());

      const result = await service.deleteDish(ownerResolved, {
        dishId: dishResolved.id,
      });

      expect(result).toMatchObject({
        ok: false,
        error: expect.any(Object),
      });
    });
  });
});
