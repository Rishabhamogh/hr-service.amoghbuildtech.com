import { IsArray, IsEmail, IsMobilePhone, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty  } from '@nestjs/swagger';
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'String',
        required: true
     })
    name: string;
    
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example: 'String',
        required: true 
    })
    emailId: string;

    @IsMobilePhone()
    @IsNotEmpty()
    @ApiProperty({
        example: 'String',
        required: true
     })
    mobile: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'String',
        required: true
     })
    role: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'String',
     })
    managerId: string;

    @IsArray()
    @IsOptional()
    @ApiProperty({
        example: 'array',
     })
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
