import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CourseController } from './course.controller.js';
import { CourseService } from './course.service.js';
import { CourseLogger } from './course.logger.js';
import { DatabaseService } from '../database.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [CourseController],
  providers: [CourseService, CourseLogger, DatabaseService]
})
export class CourseModule {}
