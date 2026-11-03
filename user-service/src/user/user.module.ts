import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service.js';
import { UserLogger } from './user.logger.js';
import { UserController } from './user.controller.js';
import { DatabaseService } from '../database.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [UserService, UserLogger, DatabaseService],
  controllers: [UserController]
})
export class UserModule {}
