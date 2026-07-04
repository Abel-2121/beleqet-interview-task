import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, CreateCompanyDto } from './dto/update-user.dto';

/** Manages user profiles, company profiles, and notifications. */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Find a user by ID and return their full profile with related fields. */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, email: true, firstName: true, lastName: true, role: true, 
        avatarUrl: true, phone: true, telegramId: true, createdAt: true, 
        company: true, headline: true, bio: true, location: true, 
        defaultResumeUrl: true, portfolioUrl: true, githubUrl: true, 
        linkedinUrl: true, skills: true 
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Update a user's profile with the provided fields. */
  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ 
      where: { id }, 
      data: dto,
      select: { 
        id: true, email: true, firstName: true, lastName: true, role: true, 
        avatarUrl: true, phone: true, telegramId: true, createdAt: true, 
        company: true, headline: true, bio: true, location: true, 
        defaultResumeUrl: true, portfolioUrl: true, githubUrl: true, 
        linkedinUrl: true, skills: true 
      },
    });
  }

  /** Create a new company record associated with the user. */
  async createCompany(userId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: { ...dto, userId } });
  }

  /** Update the user's company profile; throws if no company exists. */
  async updateCompany(userId: string, dto: CreateCompanyDto) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException('Company not found');
    return this.prisma.company.update({ where: { userId }, data: dto });
  }

  /** Fetch the user's company with the 5 most recent jobs. */
  async getCompany(userId: string) {
    return this.prisma.company.findUnique({ where: { userId }, include: { jobs: { take: 5, orderBy: { createdAt: 'desc' } } } });
  }

  /** Fetch the 50 most recent notifications for the user. */
  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  /** Mark a notification as read, scoped to the owning user. */
  async markNotificationRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { read: true } });
  }
}
