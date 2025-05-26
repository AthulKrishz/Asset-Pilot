/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Role } from '@common/enums/role.enum';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsIn(Object.values(Role))
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;

  @IsOptional()
  @IsMongoId({ message: 'Invalid companyId' })
  companyId?: string;

  @IsNumber()
  status: number;
}
