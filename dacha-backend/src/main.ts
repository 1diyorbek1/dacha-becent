import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend connection
  app.enableCors();
  
  // Set limit for large base64 images
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`NestJS Server is running on port: ${port}`);
}
bootstrap();
