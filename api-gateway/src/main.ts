import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableCors();
  const port = Number(config.get<string>('PORT') || 4000);
  await app.listen(port);
  console.log('api-gateway running at http://localhost:' + port);
}
bootstrap();
