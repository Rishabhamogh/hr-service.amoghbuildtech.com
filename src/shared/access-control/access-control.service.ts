import { ForbiddenException, Injectable } from '@nestjs/common';
import { Roles } from 'src/common/constants/constants';

@Injectable()
export class AccessControlService {
  constructor() {}

  send(role: string, module: string, action: string) {
    throw new ForbiddenException(
      `${role} does not have permission for ${action} on ${module}`,
    );
  }

  check(role: string, module: string, action: string) {
    console.log("role for checking permission",role)
    switch (role) {
      case Roles.SUPER_ADMIN:
      case Roles.ADMIN: {
        return true;
      }
      case Roles.MANAGER :
      case Roles.TEAM_LEAD: {
        switch (module) {
          case 'dashboard':
          case 'call-logs':
          case 'callbacks':
          case 'users':
          case 'leads-tracking': {
            if (['GET', 'SEARCH'].includes(action)) {
              return true;
            }
            break;
          }
          case 'leads':
          case 'leads-pool': {
            if (['GET, PATCH, POST', 'SEARCH'].includes(action)) {
              return true;
            }
            break;
          }
          case 'personal-leads-pool': {
            return true;
          }
        }

        this.send(role, module, action);
        break;
      }
      case Roles.LEAD_MANAGER: {
        switch (module) {
          case 'dashboard':
          case 'users': {
            if (['GET', 'SEARCH'].includes(action)) {
              return true;
            }
            break
          }
          case 'leads': {
            if (['GET', 'PATCH', 'SEARCH'].includes(action)) {
              return true;
            }
          }
        }
        this.send(role, module, action);
        break;
      }
      case Roles.MARKETING_MANAGER:
         {
        switch (module) {
          case 'dashboard': {
            if (['GET', 'SEARCH'].includes(action)) {
              return true;
            }
          }
          case 'leads': {
            if (['GET', 'SEARCH'].includes(action)) {
              return true;
            }
            
          }
          case 'users': {
            if (['GET', 'SEARCH'].includes(action)) {
              return true;
            }
          }
          case 'campaigns': {
            if (['create', 'SEARCH'].includes(action)) {
              return true;
            }
          }
        }
        this.send(role, module, action);
        break;
      }
      case Roles.AGENT: 
      case Roles.PRE_SALES:{
        if (
          ['dashboard', 'leads', 'personal-leads-pool', 'leads-pool','users'].includes(
            module,
          )
        ) {
          if (['GET', 'SEARCH'].includes(action)) {
            return true;
          }
        }
        this.send(role, module, action);
        break;
      }
      default:
        this.send(role, module, action);
    }
  }
}