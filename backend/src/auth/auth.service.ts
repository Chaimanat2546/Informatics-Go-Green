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
  UpdateProfileDto,
  ChangeEmailDto,
  DeleteAccountDto,
  ChangePasswordDto,
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

    // Check if user already exists (including soft-deleted users)
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if there's a soft-deleted user with this email
    const deletedUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (deletedUser && deletedUser.deletedAt) {
      // Recover the soft-deleted user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      deletedUser.password = hashedPassword;
      deletedUser.firstName = firstName;
      deletedUser.lastName = lastName;
      deletedUser.deletedAt = null;
      deletedUser.deletionRequestedAt = null;
      deletedUser.anonymizedAt = null;
      deletedUser.isActive = true;
      deletedUser.provider = 'local';

      await this.userRepository.save(deletedUser);

      return { message: 'Account recovered and updated successfully' };
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

    // Find user by email (check if deleted first)
    const deletedUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (deletedUser && deletedUser.deletedAt) {
      throw new UnauthorizedException(
        'บัญชีนี้ถูกลบแล้ว กรุณาสมัครสมาชิกใหม่เพื่อกู้คืนบัญชี',
      );
    }

    // Find active user by email
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
      phoneNumber: user.phoneNumber,
      province: user.province,
      profilePicture: user.profilePicture,
      provider: user.provider,
      providerId: user.providerId,
      role: user.role,
      isActive: user.isActive,
      deletedAt: user.deletedAt,
      deletionRequestedAt: user.deletionRequestedAt,
      anonymizedAt: user.anonymizedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      accessToken,
      user: userWithoutSensitiveData,
    };
  }

  /**
   * Recover a soft-deleted account by email
   * User needs to provide email and new password
   */
  async recoverAccount(
    email: string,
    password: string,
  ): Promise<{ message: string; canRecover: boolean }> {
    // Check if there's a soft-deleted user with this email
    const deletedUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (!deletedUser) {
      throw new NotFoundException('ไม่พบบัญชีที่ใช้อีเมลนี้');
    }

    if (!deletedUser.deletedAt) {
      throw new BadRequestException(
        'บัญชีนี้ยังใช้งานได้ปกติ สามารถเข้าสู่ระบบได้เลย',
      );
    }

    // Check if account is anonymized (can't recover)
    if (deletedUser.anonymizedAt) {
      throw new BadRequestException('บัญชีนี้ถูกลบถาวรแล้ว ไม่สามารถกู้คืนได้');
    }

    // Recover the account
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    deletedUser.password = hashedPassword;
    deletedUser.deletedAt = null;
    deletedUser.deletionRequestedAt = null;
    deletedUser.isActive = true;

    await this.userRepository.save(deletedUser);

    return {
      message: 'กู้คืนบัญชีสำเร็จ สามารถเข้าสู่ระบบได้แล้ว',
      canRecover: true,
    };
  }

  /**
   * Check if an email belongs to a recoverable account
   */
  async checkRecoverableAccount(
    email: string,
  ): Promise<{ isRecoverable: boolean; message: string }> {
    const deletedUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (!deletedUser) {
      return { isRecoverable: false, message: 'ไม่พบบัญชีที่ใช้อีเมลนี้' };
    }

    if (!deletedUser.deletedAt) {
      return { isRecoverable: false, message: 'บัญชีนี้ยังใช้งานได้ปกติ' };
    }

    if (deletedUser.anonymizedAt) {
      return { isRecoverable: false, message: 'บัญชีนี้ถูกลบถาวรแล้ว' };
    }

    return {
      isRecoverable: true,
      message: 'บัญชีนี้สามารถกู้คืนได้',
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
        message: 'หากอีเมลของคุณลงทะเบียนไว้ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่าน',
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
      throw new BadRequestException('ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }

    return {
      message: 'หากอีเมลของคุณลงทะเบียนไว้ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่าน',
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

    // Check if user exists (active users only)
    let user = await this.userRepository.findOne({
      where: [{ email }, { provider, providerId }],
    });

    if (user) {
      // Update provider info if user logged in with different method before
      let needsSave = false;

      if (user.provider !== provider) {
        user.provider = provider;
        user.providerId = providerId;
        needsSave = true;
      }

      // Always update profilePicture if a new one is provided from OAuth
      if (profilePicture && user.profilePicture !== profilePicture) {
        user.profilePicture = profilePicture;
        needsSave = true;
      }

      if (needsSave) {
        await this.userRepository.save(user);
      }

      return user;
    }

    // Check if there's a soft-deleted user with this email or providerId
    const deletedUser = await this.userRepository.findOne({
      where: [{ email }, { provider, providerId }],
      withDeleted: true,
    });

    if (deletedUser && deletedUser.deletedAt) {
      // Check if account is anonymized (can't recover)
      if (deletedUser.anonymizedAt) {
        // Create a new user instead since this one is permanently deleted
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

      // Recover the soft-deleted user
      deletedUser.firstName = firstName;
      deletedUser.lastName = lastName;
      if (profilePicture) {
        deletedUser.profilePicture = profilePicture;
      }
      deletedUser.provider = provider;
      deletedUser.providerId = providerId;
      deletedUser.deletedAt = null;
      deletedUser.deletionRequestedAt = null;
      deletedUser.isActive = true;

      await this.userRepository.save(deletedUser);
      return deletedUser;
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
      phoneNumber: user.phoneNumber,
      province: user.province,
      profilePicture: user.profilePicture,
      provider: user.provider,
      providerId: user.providerId,
      role: user.role,
      isActive: user.isActive,
      deletedAt: user.deletedAt,
      deletionRequestedAt: user.deletionRequestedAt,
      anonymizedAt: user.anonymizedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userWithoutSensitiveData;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only provided fields
    if (updateProfileDto.firstName !== undefined) {
      user.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      user.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.phoneNumber !== undefined) {
      user.phoneNumber = updateProfileDto.phoneNumber;
    }
    if (updateProfileDto.province !== undefined) {
      user.province = updateProfileDto.province;
    }
    if (updateProfileDto.profilePicture !== undefined) {
      user.profilePicture = updateProfileDto.profilePicture;
    }

    await this.userRepository.save(user);

    // Return updated user without sensitive data
    return this.getProfile(userId);
  }

  async changeEmail(
    userId: string,
    changeEmailDto: ChangeEmailDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    const { newEmail, password } = changeEmailDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้');
    }

    // Check if user has password (local account)
    if (!user.password) {
      throw new BadRequestException(
        'บัญชีนี้ใช้ Google Login ไม่สามารถเปลี่ยนอีเมลได้',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
    }

    // Check if new email is already in use
    const existingUser = await this.userRepository.findOne({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    // Update email
    user.email = newEmail;
    await this.userRepository.save(user);

    const updatedUser = await this.getProfile(userId);
    return {
      message: 'เปลี่ยนอีเมลสำเร็จ',
      user: updatedUser,
    };
  }

  async deleteAccount(
    userId: string,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<{ message: string }> {
    const { password } = deleteAccountDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้');
    }

    // For OAuth users, allow deletion without password
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
      }
    }

    // Soft delete - set deletionRequestedAt and deletedAt
    user.deletionRequestedAt = new Date();
    await this.userRepository.softRemove(user);

    return { message: 'ลบบัญชีสำเร็จ' };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้');
    }

    // Check if user has password (local account)
    if (!user.password) {
      throw new BadRequestException(
        'บัญชีนี้ใช้ Google Login ไม่สามารถเปลี่ยนรหัสผ่านได้',
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }
}
