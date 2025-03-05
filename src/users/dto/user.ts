import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class IUserUpdateRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phoneNo?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class IUserBillingRequest {
  @IsArray()
  emails: string[];

  @IsString()
  timePeriod: string;
}
