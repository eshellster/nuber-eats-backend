import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/jwt.interface';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        JwtService,
      ],
      /**
       * providers: [JwtServices]
       * 위의 내용은 아래 내용과 같다. 함축형이다.
       * providers: [{
       *  provide:JwtServide,
       *  useClass:JwtService
       * }]
       */
      exports: [JwtService],
    };
  }
}
