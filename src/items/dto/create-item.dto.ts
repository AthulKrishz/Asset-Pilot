import { ItemStatus } from '@common/enums/item-status.enum';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  itemName: string;

  @IsMongoId()
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  serialNo?: string;

  @IsMongoId()
  @IsString()
  itemType: string;

  @IsMongoId()
  @IsString()
  brand: string;

  @IsEnum(ItemStatus)
  itemStatus: ItemStatus;

  @IsOptional()
  @IsDateString()
  warrantyExpiryDate: string;
}
