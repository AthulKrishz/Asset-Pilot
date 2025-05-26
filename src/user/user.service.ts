import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@common/enums/role.enum';
import { CurrentUser } from '@common/interfaces/current-user.interface';

const roleHierarchy: Role[] = [
  Role.SuperAdmin,
  Role.Admin,
  Role.CompanyAdmin,
  Role.Manager,
  Role.Employee,
];

function canAccess(currentRole: Role, targetRole: Role): boolean {
  const currentIndex = roleHierarchy.indexOf(currentRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);

  if (currentRole === Role.SuperAdmin && targetRole === Role.SuperAdmin) {
    return true;
  }

  return currentIndex < targetIndex;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly mailService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    currentUser: CurrentUser,
  ): Promise<{ token: string }> {
    const { name, email, password, role, companyId } = createUserDto;

    const allowedRoles: Record<Role, Role[]> = {
      [Role.SuperAdmin]: [
        Role.SuperAdmin,
        Role.Admin,
        Role.CompanyAdmin,
        Role.Manager,
        Role.Employee,
      ],
      [Role.Admin]: [Role.CompanyAdmin, Role.Manager, Role.Employee],
      [Role.CompanyAdmin]: [Role.Manager, Role.Employee],
      [Role.Manager]: [Role.Employee],
      [Role.Employee]: [], // Employee should not create anyone
    };

    if (!allowedRoles[currentUser.role]?.includes(role)) {
      throw new BadRequestException(
        `Access denied: ${currentUser.role} cannot create ${role}`,
      );
    }

    if (currentUser.role === Role.Employee) {
      throw new BadRequestException(
        'Employees are not allowed to create users',
      );
    }
    // SuperAdmins/Admins can set companyId manually; for others, force apply their own companyId
    let assignedCompanyId = companyId;

    const rolesNeedCompanyId = [Role.CompanyAdmin, Role.Manager, Role.Employee];

    if (rolesNeedCompanyId.includes(role)) {
      if ([Role.CompanyAdmin, Role.Manager].includes(currentUser.role)) {
        // Automatically assign their own companyId
        if (!currentUser.companyId) {
          throw new BadRequestException(
            'Your user does not have an associated companyId',
          );
        }
        assignedCompanyId = currentUser.companyId;
      }

      if (!assignedCompanyId) {
        throw new BadRequestException(
          `companyId is required for role: ${role}`,
        );
      }
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) throw new ConflictException('Email already exists');

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyId: rolesNeedCompanyId.includes(role)
        ? assignedCompanyId
        : undefined,
    });

    const token = await this.jwtService.signAsync({
      id: user._id,
      name: user.name,
      role: user.role,
    });
    return { token };
  }

  async findAll(currentUser: CurrentUser) {
    const { role, companyId } = currentUser;
    switch (role) {
      case Role.SuperAdmin:
        return this.userModel.find();
      case Role.Admin:
        return this.userModel.find({ role: { $ne: Role.SuperAdmin } });
      case Role.CompanyAdmin:
        if (!companyId) {
          throw new BadRequestException('CompanyAdmin Must have a CompanyId');
        }
        return this.userModel.find({
          companyId,
          role: { $nin: [Role.SuperAdmin, Role.Admin] },
        });
      case Role.Manager:
        if (!companyId) {
          throw new BadRequestException('Manager Must have a companyId');
        }
        return this.userModel.find({
          companyId,
          role: { $nin: [Role.SuperAdmin, Role.Admin, Role.CompanyAdmin] },
        });
      case Role.Employee:
        throw new BadRequestException(
          'Employees are not allowed to view users',
        );
      default:
        throw new BadRequestException(`Unsupported role: ${role as string}`);
    }
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const targetUser = await this.userModel.findById(id);

    if (!targetUser) throw new NotFoundException('User Not Found');

    if (!canAccess(currentUser.role, targetUser.role as Role)) {
      throw new BadRequestException(
        `Access denied: ${currentUser.role} cannot view ${targetUser.role}`,
      );
    }
    return targetUser;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: CurrentUser,
  ) {
    const targetUser = await this.userModel.findById(id);

    if (!targetUser) throw new NotFoundException('User Not Found');

    if (!canAccess(currentUser.role, targetUser.role as Role)) {
      throw new BadRequestException(
        `Access denied: ${currentUser.role} cannot update ${targetUser.role}`,
      );
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string, currentUser: CurrentUser) {
    const targetUser = await this.userModel.findById(id);

    if (!targetUser) throw new NotFoundException('User Not Found');

    if (!canAccess(currentUser.role, targetUser.role as Role)) {
      throw new BadRequestException(
        `Access denied: ${currentUser.role} cannot delete ${targetUser.role}`,
      );
    }
    return this.userModel.findByIdAndDelete(id);
  }

  //otp verification logic
  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (user.isVerified) {
      return { message: 'User Already Verified' };
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid Otp');
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    //updating User verification status
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpResendCount = 0; // reset resend attempts
    user.otpSendAt = null; // clear send timestamp
    await user.save();

    return { message: 'Email verified successfully' };
  }

  //Resent Opt For Verification
  async resentOtp(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (user.isVerified) {
      return { message: 'User is Already Verified' };
    }

    const now = Date.now();

    // Optional reset: reset resend count after 24 hours
    if (
      user.otpSendAt &&
      now - user.otpSendAt.getTime() > 24 * 60 * 60 * 1000 &&
      user.otpResendCount
    ) {
      user.otpResendCount = 0;
    }

    //Limit for Resent Attempts
    const maxResentAttempts = 4;
    if ((user.otpResendCount || 0) >= maxResentAttempts) {
      throw new BadRequestException(
        'You have exceeded the maximum number of OTP resend attempts',
      );
    }

    //Check if OTP was sent recently (within 1 minute)
    const cooldownMinutes = 2;
    if (
      user.otpSendAt &&
      now - user.otpSendAt.getTime() < cooldownMinutes * 60 * 1000
    ) {
      throw new BadRequestException(
        `Please wait ${cooldownMinutes} minute(s) before requesting a new OTP`,
      );
    }
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpires = newOtpExpires;
    user.otpResendCount = (user.otpResendCount || 0) + 1; // increment count
    user.otpSendAt = new Date(); // update send time
    await user.save();
    // Send email again
    await this.mailService.sendMail({
      to: user.email,
      subject: 'AssetPilot - Resend OTP',
      template: './otp',
      context: {
        name: user.name,
        otp: newOtp,
      },
    });

    return { message: 'New OTP sent to your email' };
  }

  async updateStatus(
    id: string,
    status: number,
    currentUser: CurrentUser,
  ): Promise<{ message: string }> {
    const targetUser = await this.userModel.findById(id);

    if (!targetUser) throw new NotFoundException('User not found');

    if (!canAccess(currentUser.role, targetUser.role as Role)) {
      throw new BadRequestException(
        `Access denied: ${currentUser.role} cannot update status of ${targetUser.role}`,
      );
    }

    targetUser.status = status;
    await targetUser.save();

    return {
      message: `User status updated to ${status === 1 ? 'enabled' : 'disabled'}`,
    };
  }
}
