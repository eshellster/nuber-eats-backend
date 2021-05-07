import { Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
})
@Global()
export class UploadsModule {}
