import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Roles } from 'src/common/constants/constants';
import { CacheService } from 'src/shared/cache/cache.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StartupService implements OnModuleInit {
  private readonly logger = new Logger(StartupService.name);

  constructor(
    private usersService: UsersService,
    private cacheService: CacheService,
  ) {}

  onModuleInit() {
    this.logger.log('Caching data in memory');
    this.load();
    // this.start();
  }

  async load() {
    await this.loadUsers();
    await this.loadTeamByManager();
  }

  async start() {
    this.logger.log('Start thread');
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
      console.log("iids",idx)
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

  // getTeam(data: any[]) { 
  //   let userIds: string[] = [];
  //   console.log("ddt",data)
  //   for (let idx of data) {
  //     if (idx.role === Roles.AGENT) {
  //       userIds.push(idx.userId);
  //     }
  //     let response: string[] = this.getTeam(idx.team);
  //     console.log("RETrefdv",response)
  //     userIds.concat(response);
  //   console.log("rttrtrt",userIds)
  //   return userIds;
  // }
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

  async loadTeamByManager() {
    this.logger.log('Load team by manager');
    let teams: any = {};
    let query: any = {}
    query['$or'] = [
      { role: Roles.MANAGER },
      { role:Roles.TEAM_LEAD},
    ];

    let managers: any[] = await this.usersService.getDocuments(query, {
      _id: 1,
    });
    for (let idx of managers) {
      const id: string = idx._id.toString();
      const response: any[] = await this.usersService.getTeamUnderManager(id);
      this.logger.log("team",response, id)
      teams[id] = this.getTeam(response);
    }
    console.log("teams",teams)
   await this.cacheService.setTeams(teams);
  }
}