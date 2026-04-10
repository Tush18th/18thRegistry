import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../auth/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Email address (used for login)', example: 'john.doe@18thdigitech.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password (min 6 characters)', example: 'secret123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, description: 'Internal Employee ID', example: 'EMP123' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ required: false, description: 'Department Name', example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false, description: 'Job Title', example: 'Senior Developer' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false, description: 'Contact Number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiProperty({ required: false, enum: UserRole, description: 'User role', default: UserRole.DEVELOPER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ required: false, enum: UserStatus, description: 'User account status', default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
