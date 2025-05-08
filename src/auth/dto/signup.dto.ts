import { Role } from '@common/enums/role.enum';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please Enter Correct Email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(Object.values(Role))
  role: string;
}
