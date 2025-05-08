/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Role } from '@common/enums/role.enum';
import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsIn(Object.values(Role))
  role: string;
}
