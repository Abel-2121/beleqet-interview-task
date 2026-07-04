import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** User roles available in the system. Defined locally to avoid Prisma client dependency at compile time. */
export enum UserRole {
  ADMIN      = 'ADMIN',
  EMPLOYER   = 'EMPLOYER',
  JOB_SEEKER = 'JOB_SEEKER',
  FREELANCER = 'FREELANCER',
}

/** DTO for user registration — email, name, password, and optional role. */
export class RegisterDto {
  @ApiProperty({ example: 'henok@beleqet.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Henok' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mekonnen' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.JOB_SEEKER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/** DTO for user login — email and password. */
export class LoginDto {
  @ApiProperty({ example: 'henok@beleqet.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

/** DTO for refreshing an access token — requires the refresh token string. */
export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

/** DTO for email verification — contains the verification token. */
export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  token: string;
}

/** DTO for requesting a password reset — takes the user's email. */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'henok@beleqet.com' })
  @IsEmail()
  email: string;
}

/** DTO for resetting a password — requires the reset token and new password. */
export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
