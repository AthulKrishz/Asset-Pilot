import { IsString } from 'class-validator';

export class CreateItemTypeDto {
  @IsString()
  name: string;
}
