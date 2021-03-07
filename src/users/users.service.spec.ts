import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './Entities/user.entity';
import { Verification } from './Entities/verification.entity';
import { UsersService } from './users.service';

// 두곳에 사용되어 두번 작동했다는 오류가 발생
// 따로 배정해주기 위해 객체를 반환하는 함수로 변경
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mockMailService = {
  sendEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
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
    mailService = module.get<MailService>(MailService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: expect.any(String),
      role: 0,
    };
    it('실패유도: 사용자가 존재하는 경우', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '등록된 사용자 입니다.',
      });
    });
    it('성공유도: 등록 가능한 사용자계정이면 저장한다.', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockResolvedValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockResolvedValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(expect.any(Object));

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        expect.any(Object),
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    it('실패유도: 에러가 발생해 사용자 등록이 실패했을 때', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount({
        email: '',
        password: '',
        role: 1,
      });

      expect(result).toEqual({
        ok: false,
        error: '사용자 등록에 실패했습니다.',
      });
    });
  });

  describe('login', () => {
    it('실패유도: 사용자가 없다면', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login({ email: '', password: '' });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toMatchObject({
        ok: false,
        error: '사용자가 없습니다.',
      });
    });
  });

  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
