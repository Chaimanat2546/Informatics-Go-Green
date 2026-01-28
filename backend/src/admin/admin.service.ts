import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, IsNull } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: Partial<User>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown>[] = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereCondition.push(
        { firstName: Like(searchTerm) },
        { lastName: Like(searchTerm) },
        { email: Like(searchTerm) },
      );
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereCondition.length > 0 ? whereCondition : undefined,
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phoneNumber',
        'province',
        'profilePicture',
        'isActive',
        'role',
        'provider',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleUserStatus(userId: string): Promise<{ user: Partial<User>; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งาน');
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    const statusText = user.isActive ? 'ปลดระงับบัญชี' : 'ระงับบัญชี';

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
      message: `${statusText}สำเร็จ`,
    };
  }

  async getUserById(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phoneNumber',
        'province',
        'profilePicture',
        'isActive',
        'role',
        'provider',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งาน');
    }

    return user;
  }
}
