import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
