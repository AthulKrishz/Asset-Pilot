import { Module } from '@nestjs/common';
import { ItemTypeController } from './item-type.controller';
import { ItemTypeService } from './item-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemType, ItemTypeSchema } from './schemas/item-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ItemType.name, schema: ItemTypeSchema },
    ]),
  ],
  controllers: [ItemTypeController],
  providers: [ItemTypeService],
  exports: [ItemTypeService],
})
export class ItemTypeModule {}
