import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './Entities/user.entity';
import { Verification } from './Entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mockMailService = {
  sendEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
};

class MockRepository {
  async findOne() {
    const user: User = new User();
    user.id = 1;
    user.email = '';
    return user;
  }
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
          useClass: MockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAccount', () => {
    it('사용자가 존재하는 경우 실패를 반환한다.', async () => {
      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });
      expect(result).toMatchObject({
        ok: false,
        error: '등록된 사용자 입니다.',
      });
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
