import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from '@common/gaurds/roles.gaurd';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';
import { Public } from '@common/decorators/public.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{ token: string }> {
    console.log('Authenticated user:', req.user);
    const user = req.user;
    return this.userService.create(createUserDto, {
      id: user.id,
      name: user.name,
      role: user.role as Role,
      companyId: user.companyId,
    });
  }

  @Get()
  @Roles(
    Role.SuperAdmin,
    Role.Admin,
    Role.CompanyAdmin,
    Role.Manager,
    Role.Employee,
  )
  findAll(@Req() req: RequestWithUser) {
    return this.userService.findAll({
      id: req.user.id,
      name: req.user.name,
      role: req.user.role as Role,
      companyId: req.user.companyId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.userService.findOne(id, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role as Role,
      companyId: req.user.companyId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.userService.update(id, updateUserDto, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role as Role,
      companyId: req.user.companyId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.userService.remove(id, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role as Role,
      companyId: req.user.companyId,
    });
  }

  @Public() //Used to override the existing guards
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.userService.verifyOtp(body.email, body.otp);
  }

  @Public() //Used to override the existing guards
  @Post('resend-otp')
  async resentOtp(@Body('email') email: string) {
    return this.userService.resentOtp(email);
  }

  @Patch(':id/status')
  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: number,
    @Req() req: RequestWithUser,
  ) {
    return this.userService.updateStatus(id, status, {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role as Role,
      companyId: req.user.companyId,
    });
  }
}
