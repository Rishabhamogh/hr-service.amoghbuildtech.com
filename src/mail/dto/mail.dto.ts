import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class MailDto {
// @ApiProperty({
//   type:String
// })
//   @IsString()
//   @IsNotEmpty()
//   id: string;


  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}



