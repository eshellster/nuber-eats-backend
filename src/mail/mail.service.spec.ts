import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import got from 'got';
import * as FormData from 'form-data';
import { SendEmailOutput } from './dtos/sendEmail.dto';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });
  it('성공유도: 정의됨', async () => {
    expect(service).toBeDefined();
  });
  describe('인증메일 보내기', () => {
    it('성공유도: 이메일보내기 호출', async () => {
      const result = await service.sendEmail(
        'Verify Your Email',
        'verify_email',
        [
          { key: 'code', value: 'code' },
          { key: 'username', value: 'email' },
        ],
      );
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: true,
      });
    });
    it('실패유도: got 에러발생', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await service.sendEmail(
        'Verify Your Email',
        'verify_email',
        [
          { key: 'code', value: 'code' },
          { key: 'username', value: 'email' },
        ],
      );
      expect(result).toEqual({
        ok: false,
        error: expect.any(Object),
      });
    });
  });
  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      jest
        .spyOn(service, 'sendEmail')
        .mockImplementation(async () => ({ ok: true }));
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify_email',
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });
});
