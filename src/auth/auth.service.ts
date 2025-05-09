import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/user/schemas/user.schema';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

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

    // Find the user by email
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare the provided password with the hashed password in the DB
    const isPasswordMatched: boolean = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Sign a JWT token if the password is correct
    const token = await this.jwtService.signAsync({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return { token };
  }
}
