import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { isEmpty } from 'class-validator';
import { Roles } from 'src/common/constants/constants';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setUsers(users: any) {
    try {
      const length: number = Object.keys(users).length;
      this.logger.log(`Setting ${length} users data to cache`);
      await this.cacheManager.set('users', JSON.stringify(users), 0);
    } catch (error: any) {
      this.logger.error('Error in setting users in cache', error);
    }
  }

  async getUsers() {
    let str: string = await this.cacheManager.get('users');
    if (!str) {
      this.logger.error('Did not get users from cache');
      return {};
    }
    let users: any = JSON.parse(str);
    return users;
  }
async getUserAllData(){
  let str: string = await this.cacheManager.get('users');
  if (!str) {
    this.logger.error('Did not get users from cache');
    return {};
  }
  let users: any = JSON.parse(str);
  return users;
}
  async setUser(user: any) {
    let str: string = await this.cacheManager.get('users');
    if (!str) {
      this.logger.error('Did not get users from cache');
      return;
    }
    let users: any = JSON.parse(str);
    let data: any = {
      role: user?.role,
      emailId: user?.emailId,
      name: user?.name,
      mobile: user?.mobile,
      managerId: user?.managerId,
      workingHours:user?.workingHours,
      callId:user?.callId
    };
    users[user._id] = data;

    await this.cacheManager.set('users', JSON.stringify(users), 0);
  }

  async getRoleById(userId: string) {
    try {
      this.logger.log('Get role for userId: ' + userId);
      let str: string = await this.cacheManager.get('users');
      if (!str) {
        this.logger.error('Did not get users from cache');
        return Roles.AGENT;
      }
      let users: any = JSON.parse(str);
      // this.logger.debug('Users from cache:', users);
      if (isEmpty(users)) {
        this.logger.error('No user retrieved from cache, returning default');
        return Roles.AGENT;
      }
      if (!isEmpty(users[userId])) {
        this.logger.debug(
          `User details from cache for userId ${userId}:`,
          users[userId],
        );
        return users[userId]?.role;
      }
      this.logger.debug('Returning default role');
      return Roles.AGENT;
    } catch (error: any) {
      this.logger.error(
        `Error while fetching role for userId: ${userId}`,
        error,
      );
      return Roles.AGENT;
    }
  }

  async getEmailById(userId: string) {
    try {
      this.logger.log('Get emailId for userId: ' + userId);
      let str: string = await this.cacheManager.get('users');
      if (!str) {
        this.logger.error('Did not get users from cache');
        return '';
      }
      let users: any = JSON.parse(str);
      if (isEmpty(users)) {
        this.logger.error('No user retrieved from cache, returning empty');
        return '';
      }
      if (!isEmpty(users[userId])) {
        this.logger.debug(
          `User details from cache for userId ${userId}:`,
          users[userId],
        );
        return users[userId]?.emailId;
      }
      this.logger.debug('Returning empty emailId');
      return '';
    } catch (error: any) {
      this.logger.error(
        `error while fetching Email for userId: ${userId}`,
        error,
      );
      return '';
    }
  }
  async getUserData(userId: string) {
    try {
      this.logger.log('Get Data for userId: ' + userId);
      let str: string = await this.cacheManager.get('users');
      if (!str) {
        this.logger.error('Did not get users from cache');
        return '';
      }
      let users: any = JSON.parse(str);
      if (isEmpty(users)) {
        this.logger.error('No user retrieved from cache, returning empty');
        return '';
      }
      if (!isEmpty(users[userId])) {
        this.logger.debug(
          `User details from cache for userId ${userId}:`,
          users[userId],
        );
        return users[userId];
      }
      this.logger.debug('Returning empty emailId');
      return '';
    } catch (error: any) {
      this.logger.error(
        `error while fetching Email for userId: ${userId}`,
        error,
      );
      return '';
    }
  }
  async getNameById(userId: string) {
    try {
      this.logger.log('Get name for userId: ' + userId);
      let str: string = await this.cacheManager.get('users');
      if (!str) {
        this.logger.error('Did not get users from cache');
        return '';
      }
      let users: any = JSON.parse(str);
      if (isEmpty(users)) {
        this.logger.error('No user retrieved from cache, returning empty');
        return 'NA';
      }
      if (!isEmpty(users[userId])) {
        this.logger.debug(
          `User details from cache for userId ${userId}:`,
          users[userId],
        );
        return users[userId]?.name;
      }
      this.logger.debug('Returning default name');
      return 'NA';
    } catch (error) {
      this.logger.error(
        `error while fetching name  for userId: ${userId}`,
        error,
      );
      return 'NA';
    }
  }
  // async getDetailByEmployeeCodeMachine(employeeCode: string) {
  //   try {
  //     let userId: string = await this.cacheManager.get('users');
  //     if (!str) {
  //       this.logger.error('Did not get users from cache');
  //       return '';
  //     }
  //     let users: any = JSON.parse(str);
  //     if (isEmpty(users)) {
  //       this.logger.error('No user retrieved from cache, returning empty');
  //       return 'NA';
  //     }
  //     if (!isEmpty(users[userId])) {
  //       this.logger.debug(
  //         `User details from cache for userId ${userId}:`,
  //         users[userId],
  //       );
  //       return users[userId]?.name;
  //     }
  //     this.logger.debug('Returning default name');
  //     return 'NA';
  //   } catch (error) {
  //     this.logger.error(
  //       `error while fetching name  for userId: ${userId}`,
  //       error,
  //     );
  //     return 'NA';
  //   }
  // }
  async getManagerById(userId: string) {
    try {
      this.logger.log('Get manager for userId: ' + userId);
      let str: string = await this.cacheManager.get('users');
      if (!str) {
        this.logger.error('Did not get users from cache');
        return '';
      }
      let users: any = JSON.parse(str);
      if (!isEmpty(users[userId])) {
        this.logger.debug(
          `User details from cache for userId ${userId}:`,
          users[userId],
        );
        return users[userId]?.managerId;
      }
      return '';
    } catch (error: any) {
      this.logger.error(`error while fetching Email`);
    }
  }

  async setTeams(teams: any) {
    try {
      this.logger.log('Setting teams in cache');
      Object.keys(teams).forEach((id: string) => {
        const length: number = teams[id].length ?? 0;
        this.logger.debug(`Manager ${id} has ${length} members`);
      });
      await this.cacheManager.set('teams', JSON.stringify(teams), 0);
    } catch (error: any) {}
  }

  async getTeams() {
    let str: string = await this.cacheManager.get('teams');
    if (!str) {
      this.logger.error('Did not get teams from cache');
      return;
    }
    let teams: any = JSON.parse(str);
    return teams;
  }

  async getTeamByManager(managerId: string) {
    try {
      let str: string = await this.cacheManager.get('teams');
      if (!str) {
        this.logger.error('Did not get teams from cache');
        return;
      }
      let teams: any = JSON.parse(str);
      if (isEmpty(teams)) {
        return [];
      }
      if (teams?.hasOwnProperty(managerId)) {
        return teams[managerId];
      } else {
        return [];
      }
    } catch (error: any) {
      this.logger.error('Error in getting team by manager', error);
      return [];
    }
  }
}
