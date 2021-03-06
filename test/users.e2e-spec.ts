import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'eshell@nate.com',
  password: 'eshell@nate.com',
};

describe('Users Resolver (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;

  const beseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => beseTest().send({ query });
  const privateTest = (query: string) =>
    beseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    verificationRepository = moduleFixture.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
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
      return publicTest(`
      mutation{
        createAccount(input:{
          email:"${testUser.email}"
          password:"${testUser.password}"
          role:Owner
        }){
          ok
          error
        }
      }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
    it('should fail if account already exists', () => {
      return publicTest(`
      mutation {
        createAccount(input: {
          email:"${testUser.email}",
          password:"${testUser.password}",
          role:Owner
        }) {
          ok
          error
        }
      }
    `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe(
            '등록된 사용자 입니다.',
          );
        });
    });
  });
  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest(`
      mutation{
        login(input:{
          email:"${testUser.email}"
          password:"${testUser.password}"
        }){
          ok
          error
          token
        }
      }`)
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
    it('should not be able login with wrong password', () => {
      return publicTest(`
        mutation{
          login(input:{
            email:"${testUser.email}"
            password:""
          }){
            ok
            error
            token
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('비밀번호가 유효하지 않습니다.');
        });
    });
    it('should not be able login with wrong user', () => {
      return publicTest(`
        mutation{
          login(input:{
            email:"eshell@ate.com"
            password:"eshell@ate.com"
          }){
            ok
            error
            token
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('사용자가 없습니다.');
        });
    });
  });
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should see a user's profile", () => {
      return privateTest(`
        {
          userProfile(userId:${userId}){
            ok
            error
            user{
              id
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toEqual(true);
          expect(error).toEqual(null);
          expect(id).toBe(userId);
        });
    });
    it('should not find a profile', () => {
      return privateTest(`
      {
        userProfile(userId:${userId * 1000}){
          ok
          error
          user{
            id
          }
        }
      }
    `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('사용자를 찾을 수 없습니다.');
          expect(user).toBe(null);
        });
    });
  });
  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });
    it('should not allow logged out user', () => {
      return publicTest(`
        {
          me {
            email
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'new@email.com';
    it('should change email', () => {
      return privateTest(`
      mutation{
        editProfile(input:{email:"${NEW_EMAIL}"
        }){
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
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return privateTest(`
      {
        me{
          email
        }
      } 
       `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });

    it('should verifitation email', () => {
      return publicTest(`
      mutation {
        verifyEmail(input:{
          code:"${verificationCode}"
        }){
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
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found', () => {
      return publicTest(`
      mutation {
        verifyEmail(input:{
          code:"xxxxx"
        }){
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
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('확인코드가 발견되지 않았습니다.');
        });
    });
  });
});
