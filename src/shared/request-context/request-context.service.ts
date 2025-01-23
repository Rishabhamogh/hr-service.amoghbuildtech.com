import { Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private readonly contextMap: Map<string, any> = new Map();
  constructor(@Inject(REQUEST) private readonly request: Request,
) {}

  set<T>(key: string, value: T): void {
    this.contextMap.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.contextMap.get(key) as T;
  }

  getRequest(): Request {
    return this.request;
  }

  // async verifyuser(userId:string){
  //  let response= await this.LogoutLogService.getLogoutLogsByUserId(userId)
  //  if(response.length){
  //   throw new UnauthorizedException("Blocked by Admin")
  //  }
  // }
}
