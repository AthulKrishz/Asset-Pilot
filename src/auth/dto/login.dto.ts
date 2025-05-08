import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please Enter Correct Email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
