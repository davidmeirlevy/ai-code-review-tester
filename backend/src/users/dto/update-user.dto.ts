// INTENTIONAL ISSUE #3: Missing @IsString() and @IsOptional() decorators on several fields.
// The 'phone' and 'avatarUrl' fields lack proper validation decorators,
// meaning any value (including objects or arrays) could pass through to the service layer.
import { IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  firstName?: string; // Missing @IsString()

  @IsOptional()
  lastName?: string; // Missing @IsString()

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  phone?: string; // Missing @IsOptional() and @IsString()

  avatarUrl?: string; // Missing @IsOptional() and @IsString()
}
