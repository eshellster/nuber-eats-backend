import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'eshell@naver.com',
  password: 'eshell@naver.com',
};

describe('Restaurant Resolver (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  const beseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => beseTest().send({ query });
  const privateTest = (query: string) =>
    beseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // 데이터베이스를 드랍시킨다
    await getConnection().dropDatabase();
    // 테스트 앱을 종료시킨다
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
      mutation{
        createAccount(input:{
          email:"${testUser.email}"
          password:"${testUser.password}"
          role:Owner
        }){
          ok
          error
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
      mutation{
        login(input:{
          email:"${testUser.email}"
          password:"${testUser.password}"
        }){
          ok
          error
          token
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
  });

  describe('createRestaurant', () => {
    it('should create restaurant', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          mutation{
            createRestaurant(input:{
              name:"역전국밥체인점"
              coverImg:"http:/dsdd/"
              address:"부발"
              categoryName:"국밥"
            }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createRestaurant.ok).toBe(true);
          expect(res.body.data.createRestaurant.error).toBe(null);
        });
    });
  });
  describe('editRestaurant', () => {
    const NEW_RESTAURANT_NAME = '프라닭';
    const RESTAURANT_ID = 1;
    const NEW_RESTAURANT_CATEGORY = '후라이드치킨';
    it('should change restaurant name', () => {
      return privateTest(`
      mutation{
        editRestaurant(input:{
          restaurantId:${RESTAURANT_ID}
          name:"${NEW_RESTAURANT_NAME}"
         })
        {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editRestaurant: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new name', () => {
      return publicTest(`
      {
        restaurant(input:{restaurantId:1}){
          restaurant{
            name
          }
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                restaurant: {
                  restaurant: { name },
                  ok,
                  error,
                },
              },
            },
          } = res;
          expect(name).toBe(NEW_RESTAURANT_NAME);
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should change restaurant category', () => {
      return privateTest(`
      mutation{
        editRestaurant(input:{
          restaurantId:${RESTAURANT_ID}
          categoryName:"${NEW_RESTAURANT_CATEGORY}"
         })
        {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editRestaurant: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new category', () => {
      return publicTest(`
        {
          restaurant(input:{restaurantId:1}){
            restaurant{
              category{
                name
              }
            }
            ok
            error
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                restaurant: {
                  restaurant: {
                    category: { name },
                  },
                  ok,
                  error,
                },
              },
            },
          } = res;
          expect(name).toBe(NEW_RESTAURANT_CATEGORY);
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });
  describe('deleteRestaurant', () => {
    it('should delete restaurant', () => {
      return privateTest(`
      mutation{
        deleteRestaurant(input:{restaurantId:1})
        {
          ok
          error
        }
      } 
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                deleteRestaurant: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should not find a restaurant', () => {
      return privateTest(`
      mutation{
        deleteRestaurant(input:{restaurantId:1})
        {
          ok
          error
        }
      } 
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                deleteRestaurant: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('레스토랑을 찾을 수 없습니다.');
        });
    });
    it('should create restaurant', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          mutation{
            createRestaurant(input:{
              name:"신돈정육식당"
              coverImg:"http:/dsdd/"
              address:"부발"
              categoryName:"숯불고기"
            }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createRestaurant.ok).toBe(true);
          expect(res.body.data.createRestaurant.error).toBe(null);
        });
    });
  });
  describe('allCategories', () => {
    it('should list all categories', () => {
      return publicTest(`
      {
        allCategories{
          ok
          error
          categories{
            name
            slug
            restaurantCount
          }
          
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                allCategories: {
                  ok,
                  error,
                  categories: [{ name, slug, restaurantCount }],
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(name).toEqual(expect.any(String));
          expect(slug).toEqual(expect.any(String));
          expect(restaurantCount).toEqual(expect.any(Number));
        });
    });
  });
  describe('category', () => {
    it('should category', () => {
      return publicTest(`
      {
        category(input:{slug:"숯불고기",page:1,limit:5})
        {
          error
          ok
          totalPages
          restaurants{
            id
            name
          }
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                category: {
                  ok,
                  error,
                  totalPages,
                  restaurants: [{ id, name }],
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(totalPages).toEqual(expect.any(Number));
          expect(id).toEqual(expect.any(Number));
          expect(name).toEqual(expect.any(String));
        });
    });
  });
  describe('allRestaurants', () => {
    it('should all restaurants pagination', () => {
      return publicTest(`
      {
        allRestaurants(input:{page:1,limit:5}){
          totalPages
          totalResults
          restaurants{
            name
          }
          error
          ok
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                allRestaurants: {
                  ok,
                  error,
                  totalPages,
                  totalResults,
                  restaurants: [{ name }],
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(totalPages).toEqual(expect.any(Number));
          expect(totalResults).toEqual(expect.any(Number));
          expect(name).toEqual(expect.any(String));
        });
    });
  });
  describe('createDish', () => {
    const createDish = `
    mutation{
      createDish(input:{
        name:"양고기 프랜치랙 핑크솔트"
        restaurantId:2
        description:"신돈 냉장"
        price:7000
        options:[{
          name:"쯔란"
          extra:2000
          choices:[{name:"강한맛"},{name:"순한맛"},{name:"오리지널"}]
        },{
          name:"히말라야 핑크소금",
          extra:500
        }]
      }){
        ok
        error
      }
    }
    `;
    it('should create dish', () => {
      return privateTest(createDish)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createDish: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should not create dish for the same dish name that exist', () => {
      return privateTest(createDish)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createDish: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('같은 이름의 요리가 존재합니다.');
        });
    });
  });
  describe('searchRestaurants', () => {
    it('should search restaurants', () => {
      return publicTest(`
      {
        searchRestaurants(input:{query:"식당",page:1,limit:5}){
          ok
          error
          totalPages
          restaurants{
            name
          }
          totalResults
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                searchRestaurants: {
                  ok,
                  error,
                  totalPages,
                  totalResults,
                  restaurants: [{ name }],
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(totalPages).toEqual(expect.any(Number));
          expect(totalResults).toEqual(expect.any(Number));
          expect(name).toEqual(expect.any(String));
        });
    });
  });
  describe('restaurant', () => {
    it('should get restaurant by Id', () => {
      return publicTest(`
      {
        restaurant(input:{restaurantId:2}){
          restaurant{
            name
            category{
              name
            }
            menu{
            name
            price
            options{
              name
              extra
              choices{
                name
                extra
              }
            }
          }
        }
        ok
        error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {} = res;
        });
    });
  });
  describe('editDish', () => {
    it('should edit dish', () => {
      return privateTest(`
      mutation{
        editDish(input:{dishId:1,description:"냉장 프렌치랙."}){
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editDish: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });
  describe('deleteDish', () => {
    it('should delete dish', () => {
      return privateTest(`
      mutation{
        deleteDish(input:{dishId:1}){
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                deleteDish: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });
});
