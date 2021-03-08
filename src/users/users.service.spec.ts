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
  sign: jest.fn(() => 'signed-token'),
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
  let jwtService: JwtService;
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
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAccount', () => {
    const createAccountHashedPasswordArgs = {
      email: '',
      password: expect.any(String),
      role: 0,
    };
    it('실패유도: 사용자가 존재하는 경우', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      const result = await service.createAccount(
        createAccountHashedPasswordArgs,
      );

      expect(result).toMatchObject({
        ok: false,
        error: '등록된 사용자 입니다.',
      });
    });
    it('성공유도: 등록 가능한 사용자계정이면 저장한다.', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockResolvedValue(createAccountHashedPasswordArgs);
      usersRepository.save.mockResolvedValue(createAccountHashedPasswordArgs);
      verificationsRepository.create.mockResolvedValue({
        user: createAccountHashedPasswordArgs,
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
      expect(usersRepository.create).toHaveBeenCalledWith(
        createAccountHashedPasswordArgs,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(
        Promise.resolve(createAccountHashedPasswordArgs),
      );

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        Promise.resolve(createAccountHashedPasswordArgs),
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
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };
    it('실패유도: 사용자가 없다면', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

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
    it('실패유도: 사용자가 있고 패스워드가 다르다면.', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: '비밀번호가 유효하지 않습니다.',
      });
    });
    it('성공유도: 사용자가 있고 패스워드도 일치한면 토큰을 반환', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token' });
    });
    it('실패유도: 로그인 과정중에 에러발생 ', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toMatchObject({
        ok: false,
        error: '로그인에 실패하였습니다.',
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('실패유도: 사용자 아이디가 존재하지 않는다면', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    });

    it('실패유도: 에러발생', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: expect.any(Object),
      });
    });

    it('성공유도: 사용자가 존재한다면 user를 반환', async () => {
      usersRepository.findOne.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toMatchObject({
        ok: true,
        user: findByIdArgs,
      });
    });
  });
  it.todo('editProfile');
  it.todo('verifyEmail');
});
