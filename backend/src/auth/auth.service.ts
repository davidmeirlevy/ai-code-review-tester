import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

// INTENTIONAL ISSUE #1: Hardcoded JWT secret.
// This should be process.env.JWT_SECRET, never hardcoded in source code.
const secret = 'mysecret123';

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // INTENTIONAL ISSUE #2: No password hashing.
    // In production, this should be: const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // then save hashedPassword instead of the plain text password.
    const user = await this.usersService.create({
      ...registerDto,
      password: registerDto.password, // Plain text — should be hashed!
    });

    const token = this.generateToken(user);

    const { password, ...userWithoutPassword } = user;
    return {
      accessToken: token,
      user: userWithoutPassword as Omit<User, 'password'>,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const token = this.generateToken(user);

    const { password, ...userWithoutPassword } = user;
    return {
      accessToken: token,
      user: userWithoutPassword as Omit<User, 'password'>,
    };
  }

  // INTENTIONAL ISSUE #2 (continued): Plain text password comparison.
  // This should be: return await bcrypt.compare(password, user.password);
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Direct string comparison instead of bcrypt.compare()
    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Using the hardcoded secret instead of process.env.JWT_SECRET
    return this.jwtService.sign(payload, { secret });
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(userId);
    const token = this.generateToken(user);
    return { accessToken: token };
  }
}
