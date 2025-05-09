import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user/schemas/user.schema';
import { AllExceptionsFilter } from '@common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  // Get the User model and sync indexes for development
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  await userModel.syncIndexes(); // Ensure unique email index is created

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
