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
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly mailService: MailerService,
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
}
