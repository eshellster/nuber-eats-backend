import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './Entities/user.enitites';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // check new user
    try {
      const exist = await this.users.findOne({ email });
      if (exist) {
        // make error
        return { ok: false, error: '등록된 사용자 입니다.' };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: '사용자 등록에 실패했습니다.' };
    }
    // create user & hash the password
  }
}
