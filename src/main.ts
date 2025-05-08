import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the User model and sync indexes for development
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  await userModel.syncIndexes(); // Ensure unique email index is created

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
