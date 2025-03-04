import { Body, Controller, HttpCode, HttpStatus, Post, Response } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/v1/login')
 

  async login(@Body() loginDto: any, @Response() res: any) {
    console.log("ll",loginDto)
    const response:any = await this.authService.login(loginDto, res);
    res.status(HttpStatus.OK).send(response);
  } 
}
