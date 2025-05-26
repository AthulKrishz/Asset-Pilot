import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { RolesGuard } from '@common/gaurds/roles.gaurd';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/enums/role.enum';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companieService: CompaniesService) {}
  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  create(@Body() dto: CreateCompanyDto, @Request() req: RequestWithUser) {
    return this.companieService.create(dto, req.user.id);
  }
  @Get()
  @Roles(Role.SuperAdmin, Role.Admin)
  findAll() {
    return this.companieService.findAll();
  }

  @Get(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  findOne(@Param('id') id: string) {
    return this.companieService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companieService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin, Role.Admin)
  remove(@Param('id') id: string) {
    return this.companieService.remove(id);
  }
  @Patch(':id/status')
  @Roles(Role.SuperAdmin, Role.Admin)
  updateStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.companieService.updateStatus(id, status);
  }
}
