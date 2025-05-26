import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  companyAdminName: string;

  @IsNotEmpty()
  @IsEmail()
  companyAdminEmail: string;

  @IsNotEmpty()
  @IsString()
  companyAdminPassword: string;

  @IsNumber()
  status: number;
}
