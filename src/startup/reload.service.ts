import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Roles } from 'src/common/constants/constants';
import { CacheService } from 'src/shared/cache/cache.service';
import { UsersService } from 'src/users/users.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ReloadService {
  private readonly logger = new Logger(ReloadService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private cacheService: CacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // getTeam(data: any[]) {
  //   try {
  //     let userIds: string[] = [];
  //     for (let idx of data) {
  //       if (idx.role === Roles.AGENT) {
  //         userIds.push(idx.userId);
  //       }
  //       let response: string[] = this.getTeam(idx.team);
  //       userIds.concat(response);
  //     }
  //     return userIds;
  //   } catch (error) {
  //     this.logger.error('Error in getting team', error);
  //     return [];
  //   }
  // }
  getTeam(data: any[]): string[] {
    let userIds: string[] = [];
    for (let member of data) {
      userIds.push(member.userId);
      if (member.role === Roles.MANAGER || member.role === Roles.TEAM_LEAD) {
        const teamUserIds =this. getTeam(member.team);
        userIds = userIds.concat(teamUserIds);
      } 
    }
    return userIds;
  }
  async loadTeamByManagerId(id: string) {
    try { 
      this.logger.log('Load team by manager');
      let str: any = await this.cacheManager.get('teams');
      if(!str) this.logger.error('Could not get team details from cache');
      let teams=str && JSON.parse(str)
     const response: any[] = await this.usersService.getTeamUnderManager(id);
     console.log("teams",teams)
            teams[id] = this.getTeam(response); 
     await this.cacheService.setTeams(teams);
    } catch (error) {
      this.logger.error('Error in loading team by manager', error);
    }
  }

  async updateUser(id: string) {
    try {
      let response = await this.usersService.findUser({ _id: id });
      await this.cacheService.setUser(response);
    } catch (error) {
      this.logger.error('Error in updating user in cache', error);
    }
  }
  async loadUsers() {
    this.logger.log('Load users for users');
    let query={}
    // query['$or']=[
    //   {'isDeleted':false},
    //   {'isDeleted':{ '$exists': false }}
    // ]
    let response: any[] = await this.usersService.getUsersData(query);
    let users: any = {};
    response.forEach((idx: any) => {
      users[idx._id.toString()] = {
        role: idx.role,
        emailId: idx.emailId,
        name: idx.name,
        mobile: idx.mobile,
        managerId: idx?.managerId,
        employeeCode:idx?.employeeCode,
        machineNumber:idx?.machineNumber
      };
    });
    await this.cacheService.setUsers(users);
  }

}
