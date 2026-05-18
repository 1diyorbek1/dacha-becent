import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with explicit origins
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://kelp-unused-senior.ngrok-free.dev',
      'https://dachatour-becent.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Set limit for large base64 images
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`NestJS Server is running on port: ${port}`);
}
bootstrap();
