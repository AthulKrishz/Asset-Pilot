import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { Item, ItemDocument } from 'src/items/schemas/item.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ItemStatus } from '@common/enums/item-status.enum';
import { UnassignItemDto } from './dto/unassign-item.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
    userId: string,
  ): Promise<Assignment> {
    const item = await this.itemModel.findById(createAssignmentDto.item);

    if (!item) throw new NotFoundException('Item Not Found');

    switch (item.status) {
      case ItemStatus.UNAVAILABLE:
        throw new BadRequestException('Item is Unavilable');

      case ItemStatus.REPAIR:
        throw new BadRequestException('Item is under Repair');
    }

    const assignment = await this.assignmentModel.create({
      ...createAssignmentDto,
      assignedBy: userId,
    });

    await this.itemModel.findByIdAndUpdate(createAssignmentDto.item, {
      status: ItemStatus.UNAVAILABLE,
      assignedTo: createAssignmentDto.assignedTo,
    });

    return assignment;
  }
  async unassignItem(unassignItemDto: UnassignItemDto): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(
      unassignItemDto.assignedId,
    );

    if (!assignment) throw new NotFoundException('Assignment Not Found');

    assignment.unassignedAt = unassignItemDto.unassignedAt
      ? new Date(unassignItemDto.unassignedAt)
      : new Date();
    await assignment.save();

    await this.itemModel.findByIdAndUpdate(assignment.item, {
      status: ItemStatus.AVAILABLE,
      assignedTo: null,
    });
    return assignment;
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentModel
      .find()
      .populate('item assignedTo assignedBy companyId');
  }

  async findByCompany(companyId: string): Promise<Assignment[]> {
    return this.assignmentModel.find({ companyId }).populate('Item assignedTo');
  }

  async findByUser(userId: string): Promise<Assignment[]> {
    return this.assignmentModel.find({ assignedTo: userId }).populate('item');
  }
}
