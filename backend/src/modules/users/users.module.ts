import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { UserService } from './service';
import { UserRepository } from './repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UsersModule {}
