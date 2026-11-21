import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        createdAt: true,
      },
    });

    return {
      user,
      accessToken: this.signToken(user.id, user.email, user.systemRole),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
      },
      accessToken: this.signToken(user.id, user.email, user.systemRole),
    };
  }

  private signToken(userId: string, email: string, systemRole: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
      systemRole,
    });
  }
}