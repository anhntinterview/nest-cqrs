import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- để class-transformer hoạt động
      whitelist: true, // <-- chỉ nhận các field được khai báo
      forbidNonWhitelisted: true, // <-- báo lỗi nếu có field lạ
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
