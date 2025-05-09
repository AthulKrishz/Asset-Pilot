import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
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
    await user.save();

    return { message: 'Email verified successfully' };
  }
}
