import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/common/constants/constants';

export class SearchUserDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsEmail()
  @IsOptional()
  emailId: string;

  @IsMobilePhone()
  @IsOptional()
  mobile: string;
}

export class SearchUsersDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsEmail()
  @IsOptional()
  emailId: string;

  @IsOptional()
  deletedUser:string

  @IsMobilePhone()
  @IsOptional()
  mobile: string;

  @IsNumber()
  @IsOptional()
  pageNumber: number;

  @IsNumber()
  @IsOptional()
  size: number;

  @IsString()
  @IsOptional()
  sortKey: string;

  @IsString()
  @IsOptional()
  sortDir: string;

  @IsString()
  @IsOptional()
  startTime: string;

  @IsString()
  @IsOptional()
  endTime: string;
  
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  role:Roles
}
