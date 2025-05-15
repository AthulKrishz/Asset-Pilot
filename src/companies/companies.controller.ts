import {
  Body,
  Controller,
  Get,
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

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companieService: CompaniesService) {}
  @Post()
  @Roles(Role.SuperAdmin, Role.Admin)
  create(@Body() dto: CreateCompanyDto, @Request() req) {
    return this.companieService.create(dto, req.user.userId);
  }
  @Get()
  @Roles(Role.SuperAdmin, Role.Admin)
  findAll() {
    return this.companieService.findAll();
  }
}
