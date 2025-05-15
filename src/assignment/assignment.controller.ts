import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/gaurds/roles.gaurd';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/enums/role.enum';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UnassignItemDto } from './dto/unassign-item.dto';

@Controller('assignment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssignmentController {
  constructor(private readonly assignmentSerivice: AssignmentService) {}

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Post()
  createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.assignmentSerivice.createAssignment(
      createAssignmentDto,
      userId,
    );
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get()
  findAll() {
    return this.assignmentSerivice.findAll();
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Post('unassign')
  unassignItem(@Body() unassignitemDto: UnassignItemDto) {
    return this.assignmentSerivice.unassignItem(unassignitemDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get('by-company')
  findByCompany(@Query('companyId') companyId: string) {
    return this.assignmentSerivice.findByCompany(companyId);
  }
  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get('by-user')
  findByUser(@Query('userId') userId: string) {
    return this.assignmentSerivice.findByUser(userId);
  }
}
