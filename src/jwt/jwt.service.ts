import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/jwt.interface';

@Injectable()
export class JwtService {
  constructor(
    @Inject('CONFIG_OPTIONS') private readonly options: JwtModuleOptions,
  ) {}
  hello() {
    console.log('hello');
  }
}
