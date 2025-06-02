/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from 'src/user/schemas/user.schema';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Company } from 'src/companies/schemas/company.schema';

type UserWithCompany = HydratedDocument<User> & {
  companyId: Company | null;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>, // Inject the User model

    private readonly jwtService: JwtService, // Inject JWT service to sign tokens
  ) {}

  /**
   * Registers a new user
   * - Hashes password before saving to DB
   * - Handles duplicate email error
   * - Returns a JWT token if the user is created successfully
   */
  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { name, email, password, role } = signUpDto;

    // Hash the user's password before storing it in the DB
    const hashedPassword: string = await bcrypt.hash(password, 10);

    try {
      // Check if the email already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User already exists, Please sign in');
      }

      // Create the user in the database
      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      // Sign a JWT token using the user's ID
      const token = await this.jwtService.signAsync({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return { token };
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.email) {
        // This is a fallback in case a duplicate email still somehow gets through
        throw new ConflictException('User already exists, Please sign in');
      }

      // Catch all unexpected errors
      throw new InternalServerErrorException(
        'Something went wrong during sign up',
      );
    }
  }

  /**
   * Logs in an existing user
   * - Verifies email and password
   * - Returns JWT token if valid
   */
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    // Single query with populate
    const rawUser = await this.userModel
      .findOne({ email })
      .populate('companyId');

    if (!rawUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Cast to type-safe version
    const user = rawUser as unknown as UserWithCompany;

    // Email verification check for CompanyAdmin
    if (user.role === 'CompanyAdmin' && !user.isVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email before logging in.',
      );
    }

    // Check password
    const isPasswordMatched: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    //  Check if user is disabled
    if (user.status === 0) {
      throw new ForbiddenException('User is disabled. Contact administrator.');
    }

    // Check if user's company is disabled (only for non-admins)
    if (
      user.role !== 'SuperAdmin' &&
      user.role !== 'Admin' &&
      user.companyId &&
      user.companyId.status === 0
    ) {
      throw new UnauthorizedException(
        'Your company is disabled. Please contact the administrator.',
      );
    }

    // Sign JWT
    const token = await this.jwtService.signAsync({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId?._id ?? null,
    });

    return { token };
  }
}
