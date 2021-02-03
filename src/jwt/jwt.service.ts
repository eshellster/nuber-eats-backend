import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/jwt.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject('CONFIG_OPTIONS') private readonly options: JwtModuleOptions,
  ) {}
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
}
