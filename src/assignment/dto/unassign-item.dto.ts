import { IsDateString, IsMongoId } from 'class-validator';

export class UnassignItemDto {
  @IsMongoId()
  assignedId: string;

  @IsDateString()
  unassignedAt: Date;
}
