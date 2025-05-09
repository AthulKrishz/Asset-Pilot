import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from 'src/user/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<Company>,
    @InjectModel(User.name)
    private userModel: Model<User>,
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

    // Step 4: Create company admin user and associate it with the company
    const companyAdminUser = await this.userModel.create({
      name: companyAdminName,
      email: companyAdminEmail,
      password: hashedPassword,
      role: 'CompanyAdmin',
      companyid: company._id, // reference to the new company
    });

    return {
      message: 'Company and Company Admin created successfully',
      company,
      companyAdminUser,
    };
  }
  async findAll(): Promise<Company[]> {
    return this.companyModel.find();
  }
}
