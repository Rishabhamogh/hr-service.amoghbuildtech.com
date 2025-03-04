import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './auth.constants';
import { RequestContextService } from 'src/shared/request-context/request-context.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private requestContextService: RequestContextService,

  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    let payload: any = {};
    if (!token) {
     throw new UnauthorizedException();
    }
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      throw new UnauthorizedException('Token Expired');
    }
    request['user'] = payload;
    if (!(payload?.expiry || payload?.sub || payload?.role)) {
      throw new UnauthorizedException('Invalid Token');
    }
    //await this.logLogoutService.getLogoutLogsByUserId(payload?.sub)
   //let user= await this.requestContextService.verifyuser(payload.sub);
    this.requestContextService.set<string>('userId', payload.sub);
    this.requestContextService.set<string>('role', payload.role);
    this.requestContextService.set<string>('token', token);
    this.requestContextService.set<string>('department', payload.department);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
