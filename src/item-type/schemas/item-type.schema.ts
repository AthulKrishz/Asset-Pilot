import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemTypeDocument = ItemType & Document;

@Schema({ timestamps: true })
export class ItemType {
  @Prop({ required: true, unique: true })
  name: string;
}

export const ItemTypeSchema = SchemaFactory.createForClass(ItemType);
