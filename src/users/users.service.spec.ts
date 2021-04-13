import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

// 두곳에 사용되어 두번 작동했다는 오류가 발생
// 따로 배정해주기 위해 객체를 반환하는 함수로 변경
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});
const mockMailService = () => ({
  sendEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
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
      role: expect.any(String),
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
      usersRepository.create.mockReturnValue(createAccountHashedPasswordArgs);
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
        role: expect.any(String),
      });

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(
        createAccountHashedPasswordArgs,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(
        createAccountHashedPasswordArgs,
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
        role: expect.any(String),
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
    it('실패유도: 에러발생', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    });

    it('성공유도: 사용자가 존재한다면 user를 반환', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toMatchObject({
        ok: true,
        user: findByIdArgs,
      });
    });
  });
  describe('editProfile', () => {
    it('실패유도: 사용자 프로파일 수정 에러발생', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '', password: '' });
      expect(result).toMatchObject({
        ok: false,
        error: '프로파일 업데이트가 실패 했습니다.',
      });
    });

    it('성공유도: 사용자프로파일 email 수정', async () => {
      usersRepository.findOne.mockResolvedValue({
        email: 'user@old.com',
        verified: true,
      });
      verificationsRepository.create.mockReturnValue({
        code: 'code',
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.editProfile(1, {
        email: 'user@new.com',
        verified: false,
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: { verified: false, email: 'user@new.com' },
      });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        code: 'code',
      });
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({
        verified: false,
        email: 'user@new.com',
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'user@new.com',
        'code',
      );
      expect(result).toMatchObject({
        ok: true,
      });
    });
    it('성공유도: 패스워드 변경', async () => {
      const userResolved = { password: 'old' };
      usersRepository.findOne.mockResolvedValue(userResolved);
      const result = await service.editProfile(1, { password: 'new' });
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({
        password: expect.any(String),
      });
      expect(result).toEqual({
        ok: true,
      });
    });
    it('실패유도: 패스워드 변경에서 에러발생', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { password: 'new' });
      expect(result).toEqual({
        ok: false,
        error: '프로파일 업데이트가 실패 했습니다.',
      });
    });
  });
  describe('verifyEmail', () => {
    it('성공유도: 이메일 인증', async () => {
      verificationsRepository.findOne.mockResolvedValue({
        id: 1,
        user: { verified: false },
      });
      const result = await service.verifyEmail('code');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(1);

      expect(result).toEqual({ ok: true });
    });
    it('실패유도: 인증코드가 없을때 ', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        ok: false,
        error: '확인코드가 발견되지 않았습니다.',
      });
    });
    it('실패유도: 이메일 인증 에러', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('code');
      expect(result).toEqual({
        ok: false,
        error: expect.any(Object),
      });
    });
  });
});
