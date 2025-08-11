import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { createHashValue } from 'src/common/utils/utilities';
import { isEmpty } from 'lodash';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserDbService } from './user-db.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { Roles } from 'src/common/constants/constants';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { ReloadService } from 'src/startup/reload.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { response } from 'express';


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private dbService: UserDbService,
    private cacheService: CacheService,
    private reloadService: ReloadService,
    //private authGaurd:AuthGuard
  ) { }

  createDefaultPassword() {
    const password = 'AmoghCRM@890';
    return createHashValue(password);
  }
  async create(createUserDto: 
    CreateUserDto) {
    try {
      let payload: any = { ...createUserDto };
      payload['password'] = this.createDefaultPassword();
      let response = await this.dbService.save(payload);
      return response;
    } catch (error) {
      this.logger.error('Error in creating user:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async findAll(
    skip: number,
    limit: number,
    sortKey: string,
    sortDir: string,
    query: any,
  ) {
    try {
      this.logger.debug('Find user payload: ' + JSON.stringify(query));
      const sortObj: any = {
        [sortKey]: sortDir === 'DESC' ? -1 : 1,
      };
      let response = await this.dbService.getAll(
        skip,
        limit,
        sortKey,
        sortDir,
        query,
      );

      return response;
    } catch (error) {
      this.logger.error('Error in finding all users:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }
  async getTeamUnderManager(userId: string) {
    let data: any[] = [];
    const role: string = await this.cacheService.getRoleById(userId);
    if (
      role === Roles.AGENT ||
      role === Roles.ADMIN ||
      role === Roles.SUPER_ADMIN
    ) {
      this.logger.verbose(userId + ' is ' + Roles.AGENT);
      return data;
    }
    const user: any = await this.dbService.getOne({ _id: userId });
    if (isEmpty(user)) {
      this.logger.verbose(userId + ' is empty');
      return data;
    }

    const team: string[] = user?.team || [];
    if (!team.length) {
      this.logger.verbose(userId + ' does not have a team');
      return data;
    }

    for (let idx of team) {
      const childRole: string = await this.cacheService.getRoleById(idx);
      this.logger.debug('Role of child ' + idx + ' is ' + childRole);
      const isDeleted= await this.cacheService.isUserDeleted(idx);
      if (role === Roles.MANAGER || role===Roles.TEAM_LEAD) {
        let users: any[] = await this.getTeamUnderManager(idx);
        data.push({ userId: idx, role: childRole, team: users,isDeleted });
      } else {
        data.push({ userId: idx, role: childRole,isDeleted }); 
      }
    }
    return data;
  }

 
  async getTeamDetails(userId: string) {
    try {
      const role: string = await this.cacheService.getRoleById(userId);
      this.logger.debug('Role:' + role);
      if (
        !(
          role === Roles.ADMIN ||
          role === Roles.MANAGER ||
          role === Roles.LEAD_MANAGER ||
          role === Roles.SUPER_ADMIN ||
          role===Roles.TEAM_LEAD
        )
      ) {
        this.logger.log('User can not have a team');
        return [];
      }
      if (role === Roles.LEAD_MANAGER) {
        let user: any = await this.findUser({ _id: userId });
        if (isEmpty(user)) {
          throw new NotFoundException('User does not exist');
        }
        if (!user?.managerId) {
          throw new BadRequestException('Lead manager does not have manager');
        }
        userId = user.managerId;
      }

      let data: any[] = await this.getTeamUnderManager(userId);
      this.logger.log('Team details: ' + JSON.stringify(data));
      return data;
    } catch (error) {
      this.logger.error('Error in getting team details:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async getOne(query: any) {
    try {
      this.logger.debug('Find user payload: ' + JSON.stringify(query));
      let response: any = await this.dbService.getOne(query);
      if (isEmpty(response)) {
        throw new NotFoundException(JSON.stringify(query) + ' does not exist');
      }
      return response;
    } catch (error) {
      this.logger.error('Error in finding one user:', error);
      switch (error.name) {
        // case 'InternalServerError':
        //   throw new BadRequestException(error.message || JSON.stringify(error));
        // default:
        //   throw error;
      }
    }
  }

  async findOne(query: any) {
    try {
      let response: any = await this.dbService.getOne(query);
      if (isEmpty(response)) {
        throw new NotFoundException(JSON.stringify(query) + ' does not exist');
      }
      if (response.role === Roles.AGENT) {
        return response;
      }

      const userId: string = response._id.toString();
      response.team = await this.getTeamDetails(userId);

      return response;
    } catch (error) {
      this.logger.error('Error in finding one user:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      this.logger.debug(
        'Updating userId: ' +
        id +
        ' with payload: ' +
        JSON.stringify(updateUserDto),
      );
      let response = await this.dbService.updateOne(id, updateUserDto);
     await this.cacheService.setUser(response)
      return response;
    } catch (error) {
      this.logger.error('Error in updating user:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async addToTeam(id: string, userIds: string[]) {
    try {
   
      let manager=await this.findOne({_id:id})
      this.logger.debug('Manager details:', manager);
      for (let idx of userIds) {
        if(manager?.teams?.includes(idx)) throw new BadRequestException("User already in team")
        let response = await this.dbService.addToArray(id, 'team', idx);
      }
      this.logger.log('Added to team successfully for userId: ', id);
    } catch (error) {
      this.logger.error('Error in adding user to team:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      if (dto.oldPassword === dto.newPassword) {
        throw new BadRequestException(
          'New password can not be same old password',
        );
      }

      let user: any = await this.dbService.getOne({ _id: userId });
      if (isEmpty(user)) {
        throw new NotFoundException('User does not exist');
      }

      /*Matching old password*/
      const oldPassword = createHashValue(dto.oldPassword);
      if (oldPassword !== user.password) {
        throw new BadRequestException('Old password did not match');
      }

      const password: string = createHashValue(dto.newPassword);
      const payload: any = {
        password: password,
      };
      await this.dbService.updateOne(userId, payload);
      this.logger.log('Password updated successfully for ' + userId);
    } catch (error) {
      this.logger.error('Error in changing password:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async changePaswwordByOTP( params: any) {
    try {
      let query={}
      query['$or']=[
        {personalEmail: params.email},
        {emailId: params.email},
      ]
      let user: any = await this.dbService.getOne(query);
      if(!user) throw new BadRequestException("Not user")
      if(user.isDeleted) throw new BadRequestException("User Already deleted")
      const password: string = createHashValue(params.password);
      const payload: any = {
        password: password,
      };
     let response= await this.dbService.updateOne(user?._id, payload);
      return response
    } catch (error) {
      this.logger.error('Error in changing password:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }
  async resetPassword(userId: string) {
    try {
      const password: string = this.createDefaultPassword();
      const payload: any = {
        password: password,
      };
      const response: any = await this.dbService.updateOne(userId, payload);
      return response;
    } catch (error) {
      this.logger.error('Error in resetting password:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async remove(id: string) {
    try {
      await this.dbService.updateOne(id, { 'isDeleted': true });
    } catch (error) {
      this.logger.error('Error in removing user:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async findUser(query: any) {
    try {
      const user: any = await this.dbService.getOne(query);
      return user;
    } catch (error) {
      this.logger.error('Error in finding user:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async findOneByEmailId(emailId: string) {
    try {
      const user: any = await this.dbService.getOne({ emailId: emailId });
      return user;
    } catch (error) {
      this.logger.error('Error in finding by email id:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async login(loginDto: any) {
    try {
      if (!(loginDto.emailId || loginDto.mobile)) {
        throw new BadRequestException();
      }
      let query: any = {};
      if (loginDto.emailId) {
        query['$or'] = [{ emailId: { $regex: `^${loginDto.emailId}$`, $options: 'i' } },
          { personalEmail: { $regex: `^${loginDto.emailId}$`, $options: 'i' } }
        ]
      }
      if (loginDto.mobile) {
        query = { mobile: loginDto.mobile };
      }
      const user: any = await this.findUser(query);
      if (!isEmpty(user)) {
        return user;
      }
      throw new NotFoundException();
    } catch (error) {
      this.logger.error('Error in login:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async getNames(query: any) {
    try {
      const names: any[] = await this.dbService.getArrayByField(
        query,
        ['name', 'role','managerId','isDeleted','linkedWithManagerId',"employeeCode"],
        { "name": 1}
      );
      return names;
    } catch (error) {
      this.logger.error('Error in getting names:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async getUsersData(query: any) {
    try {
      const users: any[] = await this.dbService.getArrayByField(
        query,
        ['role', 'emailId', 'name', 'mobile', 'managerId','isDeleted',"_id","employeeCode","machineNumber","weekEnds","department","linkedWithManagerId","shiftStartAt","shiftEndAt"],
        '',
      );
      return users;
    } catch (error) {
      this.logger.error('Error in users data:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async getDocuments(query: any, filters: any) {
    try {
      const response: any[] = await this.dbService.get(query, filters);
      return response;
    } catch (error) {
      this.logger.error('Error in getting documents:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async getUserByFields(query: any, feilds: string[], sort: any) {
    const users: any[] = await this.dbService.getArrayByField(
      query,
      feilds,
      sort,
    );
    return users;
  } catch(error) {
    this.logger.error('Error in users data:', error);
    switch (error.name) {
      case 'InternalServerError':
        throw new BadRequestException(error.message || JSON.stringify(error));
      default:
        throw error;
    }
  }

  async updateUserAndMarketingManager(userId: string, data: any) {
    let managerId = await this.cacheService.getManagerById(userId)
   // let team = managerId && await this.cacheService.getTeamByManager(managerId)
    // if (team.length) {
    //   team.forEach(async user => {
    //     let role = await this.cacheService.getRoleById(user)
    //     if (role === Roles.AGENT) {
    //       await this.update(user, data)
    //     }
    //   });
    // }
    await this.update(managerId, data)
    await this.update(userId, data)
  }
  async activate(id: string) {
    try {
      await this.dbService.updateOne(id, { 'isDeleted': false });
    } catch (error) {
      this.logger.error('Error in removing user:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }

  async removeFromTeam(id: string, userIds: any, managerId?: string ,feildTochange?:string) {
    this.logger.debug('Remove from team:', id);
    let response = await Promise.all(userIds.map(async (userId) => {
      await this.dbService.removeFromArray(id, 'team', userId)
      this.logger.debug('update managerID:', managerId);
      this.logger.debug('feild change', feildTochange );

    await this.dbService.updateOne(userId, { feildTochange : managerId ? managerId : '' })
      await this.reloadService.loadTeamByManagerId(managerId)
    }))
    return response
  }

  async checkUserIfAlreadyPresent(id: string) {
    this.logger.log('check user:' + id);
    let managers = await this.getUserByFields({ '$or': [{ role: Roles.MANAGER }, { role: Roles.TEAM_LEAD }] }, ['team'], '')
 
   for (const manager of managers) {
        if (manager?.team?.includes(id)) {
            const managerName = await this.cacheService.getNameById(manager._id);
            throw new BadRequestException(`User is Already in team of ${managerName}`);
        }
    }
  }
  async changeManager(userId: string, managerId: string, feildTochange:string) {
    this.logger.debug('Request recieve to change manager of userId:', userId);
    let prevManager = await this.dbService.getOne({ _id: userId })
    // if(prevManager.team.includes(userId))
   await this.removeFromAllTeams(userId);
    this.logger.debug('Previous manager detail:', prevManager);
    if(prevManager?.managerId) await this.removeFromTeam(prevManager?.managerId, [userId], managerId,feildTochange)
console.log("prevManager",userId)
      await this.checkUserIfAlreadyPresent(userId)

    await this.addToTeam(managerId, [userId])
  }

  async removeFromAllTeams(userId: string) {  
    this.logger.debug('Request received to remove userId: ' + userId + ' from all teams');
    let managers = await this.getUserByFields({ '$or': [{ role: Roles.MANAGER }, { role: Roles.TEAM_LEAD }] }, ['team'], '')
    for (const manager of managers) {
      if (manager?.team?.includes(userId)) {
        await this.removeFromTeam(manager._id, [userId], '', 'managerId')
      }
    }
    this.logger.debug('User removed from all teams successfully');

  }
  async getAllWithoutPagination(query: any, ) {
    return await this.dbService.get(query, '');
  }

  async logOutFromAllDevices(userId:string){
   // this.authGaurd.canActivate
  }

}
