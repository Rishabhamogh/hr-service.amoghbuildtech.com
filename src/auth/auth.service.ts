import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { createHashValue } from 'src/common/utils/utilities';
import { ConfigService } from '@nestjs/config';
import { Department } from 'src/common/constants/constants';
import * as moment from 'moment';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(loginDto: any, res: any) {
    const user: User = await this.usersService.login(loginDto);
    console.log("uu",User)
    const password = createHashValue(loginDto.password);
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }    
    if(user.isDeleted){
      throw new UnauthorizedException('User is Deleted') 
    }
    const payload = {
      sub: user._id,
      emailId: user.emailId,
      mobile: user.mobile,
      role: user.role,
      // exp: moment().add(this.configService.get('auth.tokenExpiry'),'minutes').unix(),
       department:user?.department ?user?.department:[Department.FINANCE]

    };
    const accessToken: string = await this.jwtService.signAsync(payload);
    res.setHeader('x-access-token',accessToken);
    return {
      userId: user._id,
      name: user.name,
      mobile: user.mobile,
      emailId: user.emailId,
      role:user.role,
      accessToken: accessToken,
      team:user.team,
      employeeCode:user?.employeeCode,
       department:user?.department


    }
  }
}
