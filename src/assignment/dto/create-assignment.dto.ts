import { IsDateString, IsMongoId } from 'class-validator';

export class CreateAssignmentDto {
  @IsMongoId()
  item: string;

  @IsMongoId()
  assignedTo: string;

  @IsMongoId()
  assignedBy: string;

  @IsMongoId()
  company: string;

  @IsDateString()
  assignedAt: string;

  @IsDateString()
  assignedTill: string;
}
