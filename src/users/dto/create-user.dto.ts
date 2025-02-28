import { IsArray, IsEmail, IsMobilePhone, IsNotEmpty, IsOptional, IsString } from "class-validator";
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
 
    name: string;
    
    @IsEmail()
    @IsNotEmpty()
    
    emailId: string;

    @IsMobilePhone()
    @IsNotEmpty()
   
    mobile: string;

    @IsString()
    @IsNotEmpty()
  
    role: string;

    @IsString()
    @IsOptional()
   
    managerId: string;

    @IsArray()
    @IsOptional()
  
    team: string[];

    @IsString()
    @IsOptional()
    callId:string

    @IsString()
    @IsOptional()
    teamLeadId:string
    

    @IsArray()
    @IsOptional()
    linkedWithManagerId:string[]
}
