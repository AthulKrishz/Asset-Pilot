import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from 'src/user/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<Company>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailService: MailerService,
  ) {}
  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    const {
      name,
      address,
      companyAdminName,
      companyAdminEmail,
      companyAdminPassword,
    } = createCompanyDto;
    const existingUser = await this.userModel.findOne({
      email: companyAdminEmail,
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Step 2: Create company and associate it with the SuperAdmin/Admin
    const company = await this.companyModel.create({
      name,
      address,
      createdBy: userId, // This is a mongoose.Types.ObjectId
    });

    // Step 3: Hash the company admin password
    const hashedPassword: string = await bcrypt.hash(companyAdminPassword, 10);

    //Generate Otp
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Step 4: Create company admin user and associate it with the company
    const companyAdminUser = await this.userModel.create({
      name: companyAdminName,
      email: companyAdminEmail,
      password: hashedPassword,
      role: 'CompanyAdmin',
      companyId: company._id, // reference to the new company
      isVerified: false,
      otp,
      otpExpires,
    });
    await this.mailService.sendMail({
      to: companyAdminEmail,
      subject: 'AssetPilot - Verify Your Email',
      template: './otp',
      context: {
        name: companyAdminName,
        otp,
      },
    });

    return {
      message:
        'Company and Company Admin created successfully. Verification OTP sent to email',
      company,
      companyAdminUser,
    };
  }
  async findAll(): Promise<Company[]> {
    return this.companyModel.find();
  }

  async findOne(id: string) {
    return this.companyModel.findById(id);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.companyModel.findByIdAndUpdate(id, updateCompanyDto, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.companyModel.findByIdAndDelete(id);
  }

  async updateStatus(id: string, status: number): Promise<{ message: string }> {
    const currentCompany = await this.companyModel.findById(id);

    if (!currentCompany) throw new NotFoundException('Company not found');

    currentCompany.status = status;
    await currentCompany.save();

    return {
      message: `Company status updated to ${status === 1 ? 'enabled' : 'disabled'}`,
    };
  }
}
