import { ItemStatus } from '@common/enums/item-status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document } from 'mongoose';
import { Brand } from 'src/brand/schemas/brand.schema';
import { Company } from 'src/companies/schemas/company.schema';
import { ItemType } from 'src/item-type/schemas/item-type.schema';
import { User } from 'src/user/schemas/user.schema';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  itemName: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: Company;

  @Prop()
  serialNo?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ItemType',
    required: true,
  })
  itemType: ItemType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true })
  brand: Brand;

  @Prop({ enum: ItemStatus, default: ItemStatus.AVAILABLE })
  status: ItemStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  assignedTo: User | null;

  @Prop({ type: Date })
  warrantyExpiryDate?: Date;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
