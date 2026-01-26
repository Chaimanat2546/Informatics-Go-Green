import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { EmailService } from './services/email.service';

export interface OAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  provider: string;
  providerId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      provider: 'local',
    });

    await this.userRepository.save(user);

    return { message: 'Registration successful' };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has a password (local login only)
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses social login. Please login with Google.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Return token and user data (without password)
    const userWithoutSensitiveData: Omit<
      User,
      'password' | 'resetPasswordToken' | 'resetPasswordExpires'
    > = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      provider: user.provider,
      providerId: user.providerId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      accessToken,
      user: userWithoutSensitiveData,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message:
          'If your email is registered, you will receive a password reset link',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    // Send email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch {
      // Reset the token if email fails
      user.resetPasswordToken = undefined as unknown as string;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException(
        'Failed to send reset email. Please try again.',
      );
    }

    return {
      message:
        'If your email is registered, you will receive a password reset link',
    };
  }

  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { password } = resetPasswordDto;

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined as unknown as string;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successful' };
  }

  async validateOAuthUser(userData: OAuthUserData): Promise<User> {
    const { email, firstName, lastName, profilePicture, provider, providerId } =
      userData;

    // Check if user exists
    let user = await this.userRepository.findOne({
      where: [{ email }, { provider, providerId }],
    });

    if (user) {
      // Update provider info if user logged in with different method before
      if (user.provider !== provider) {
        user.provider = provider;
        user.providerId = providerId;
        if (profilePicture) {
          user.profilePicture = profilePicture;
        }
        await this.userRepository.save(user);
      }
      return user;
    }

    // Create new user
    user = this.userRepository.create({
      email,
      firstName,
      lastName,
      profilePicture,
      provider,
      providerId,
    });

    await this.userRepository.save(user);
    return user;
  }

  generateJwtToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithoutSensitiveData: Omit<
      User,
      'password' | 'resetPasswordToken' | 'resetPasswordExpires'
    > = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      provider: user.provider,
      providerId: user.providerId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userWithoutSensitiveData;
  }
}
