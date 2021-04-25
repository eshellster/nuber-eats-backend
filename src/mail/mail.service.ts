import got from 'got';
import { Inject, Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import { SendEmailOutput } from './dtos/sendEmail.dto';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}
  async sendEmail(
    subject: string,
    template: string,
    emailVar: EmailVar[],
  ): Promise<SendEmailOutput> {
    const form = new FormData();
    // console.log();
    form.append('from', `from edynote <mailgun@${this.options.domain}>`);
    form.append('to', emailVar[1].value);
    form.append('subject', subject);
    form.append('template', template);
    emailVar.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify_email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
