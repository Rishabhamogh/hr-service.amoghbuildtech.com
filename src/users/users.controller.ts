import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SearchUsersDto } from './dto/search-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { Department, Roles } from 'src/common/constants/constants';
import { TeamDto } from './dto/team.dto';
import { CacheService } from 'src/shared/cache/cache.service';
// import { StartupService } from 'src/startup/startup.service';
// import { ReloadService } from 'src/startup/reload.service';


@Controller()

export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly usersService: UsersService,
    private contextService: RequestContextService,
    private cacheService: CacheService,
  ) { }
  @UseGuards(AuthGuard)
  @Post('/v1/user')

  async create(@Body() createUserDto: CreateUserDto) {
    const role: string = this.contextService.get('role');
    this.logger.log('Request received to add user', createUserDto);
    if (createUserDto?.team) {
      await Promise.all(createUserDto?.team.map(async (userId) => {
        await this.checkUserIfAlreadyPresent(userId)
      }))
    }
    const response = await this.usersService.create(createUserDto);
   
    return response;
  }
  @UseGuards(AuthGuard)
  @Get('/v1/users')

  async findAll(@Query() params: any) {
    this.logger.log('Request received to find all users');
    const role: string = this.contextService.get('role');
    const userId: string = this.contextService.get('userId');
      const department: string = this.contextService.get('department');

    let query = {};
    const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber * limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
    switch (role) {

      case Roles.MANAGER:
        case Roles.TEAM_LEAD:
        if(department.includes(Department.HR)  ){

        }
        else
        {
          let userIds: string[] = await this.cacheService.getTeamByManager(userId);
          userIds.push(userId);
          query = {
            _id: { $in: userIds },
          };
        }
        break;
      case Roles.AGENT: {
        if(department.includes(Department.HR)  ){

        }
        else{
        query = {
          _id: userId,
        };
      }
      }
    }

    const response = await this.usersService.findAll(
      skip,
      limit,
      sortKey,
      sortDir,
      query,
    );
    return response;
  }
  @UseGuards(AuthGuard)
  @Get('/v1/user/team/:id')

  async findTeam(@Param('id') id: string) {
    this.logger.log('Request received to find team of userId: ' + id);
    if (!id) throw new BadRequestException("Id is not valid")
    const role: string = this.contextService.get('role');
    const response = await this.usersService.getTeamDetails(id);
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('/v1/user/details')
  async getUserDetails() {
    this.logger.log('Request received to get logged in user details');
    let role = this.contextService.get('role')
    let userId: string = this.contextService.get('userId')
    let department= this.contextService.get('department')
    console.log("department",department)
    switch (role) {
      case Roles.LEAD_MANAGER: {
        userId = await this.cacheService.getManagerById(userId)
      }
      case Roles.MANAGER: {
        let team = await this.cacheService.getTeamByManager(userId)
        return {
          userId,
          role,
          team,
          department
        }
      }
    }
    return {
      userId: this.contextService.get('userId'),
      role: this.contextService.get('role'),
      department: this.contextService.get('department'),

    }
  }
  @UseGuards(AuthGuard)
  @Get('/v1/user/:id')
  async findOne(@Param('id') id: string) {
    this.logger.log('Request received to find userId', id);
    const role: string = this.contextService.get('role');
    const response = await this.usersService.findOne({ _id: id });
    return response;
  }
  @UseGuards(AuthGuard)
  @Patch('/v1/user/password/reset/:id')
  async resetPassword(@Param('id') userId: string) {
    const role: string = this.contextService.get('role');
    this.logger.log('Request received to reset password for userId: ', userId);
    const response = await this.usersService.resetPassword(userId);
    return response;
  }

  @Patch('/v1/user/reset-password')
  async changePasswordByOTP(@Body() param: any) {
    const role: string = this.contextService.get('role');
    const response = await this.usersService.changePaswwordByOTP(param);
    return response;
  }

  @UseGuards(AuthGuard)
  @Patch('/v1/user/password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    const role: string = this.contextService.get('role');
    const userId: string = this.contextService.get('userId');
    this.logger.log(
      'Request received to change password for userId: ' + userId,
    );
    const response = await this.usersService.changePassword(userId, dto);
    return response;
  }
  @UseGuards(AuthGuard)
  @Post('/v1/user/team/:id')
  async addToTeam(@Param('id') id: string, @Body() dto: TeamDto) {
    this.logger.log('Request received to update team for userId: ' + id);
    const role: string = this.contextService.get('role');
    await Promise.all(dto.userIds.map(async (userId) => {
      let managerId = await this.cacheService.getManagerById(userId)
      if (managerId) throw new BadRequestException(`${userId} already in team of manager ${managerId}`)
    }))
    const response = await this.usersService.addToTeam(id, dto.userIds);
    return response;
  }

  @UseGuards(AuthGuard)
  async checkUserIfAlreadyPresent(id: string) {
    this.logger.log('check user:' + id);
    let managers = await this.usersService.getUserByFields({ '$or': [{ role: Roles.MANAGER }, { role: Roles.TEAM_LEAD }] }, ['team'], '')
    managers?.map((userId) => {
      userId?.team.map((item:any) => {
        if (item === id) {
          throw new BadRequestException(`User is Already in team of ${userId._id}`)
        }
      })
    })
  }
  @UseGuards(AuthGuard)
  @Patch('/v1/user/:id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log('Request received to update userId: ' + id);
    let role: string = this.contextService.get('role');
  
    const response = await this.usersService.update(id, updateUserDto);
    return response;
  }

  @UseGuards(AuthGuard)
  @Delete('/v1/user/:id')
  async remove(@Param('id') id: string) {
    this.logger.log('Request received to delete user', id);
    const role: string = this.contextService.get('role');
    const response = await this.usersService.remove(id);
    return response;
  }
  @UseGuards(AuthGuard)
  @Post('/v1/activate-user/:id')
  async activate(@Param('id') id: string) {
    this.logger.log('Request received to activate user', id);
    const role: string = this.contextService.get('role');
    const response = await this.usersService.activate(id);
    return response;
  }

  @UseGuards(AuthGuard)
  @Get('/v1/users/names')
  async getNames() {
    const role: string = this.contextService.get('role');
    this.logger.log('Request received to find names for all users');
    let query = {}
    // query['$or']=[
    //   {'isDeleted':false},
    //   {'isDeleted':{ '$exists': false }}
    // ]
    const response = await this.usersService.getNames(query);
    return response;
  }

  @UseGuards(AuthGuard)
  @Post('/v1/users/names')
  async getNamesByQuery(@Body() query: any) {
    this.logger.log('Request received to find names for all users');
    const response = await this.usersService.getNames(query);
    return response;
  }

  @UseGuards(AuthGuard)
  @Get('/v1/users/roles')
  async getRoles() {
    this.logger.log('Request received to find roles for all users');
    let query = {}
    // query['$or']=[
    //   {'isDeleted':false},
    //   {'isDeleted':{ '$exists': false }}
    // ]
    const response = await this.usersService.getUsersData(query);
    return response;
  }
  @UseGuards(AuthGuard)
  @Get('/v1/team-leader/:id')
  async getTeamLeaders(@Param('id') id: string) {
    this.logger.log('Request received to find roles for all users');
    let query = {}
    query['managerId'] = id
    query['role'] = Roles.TEAM_LEAD
    const response = await this.usersService.getUsersData(query);
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('/v1/users/search')
  async searchAll(@Body() params: SearchUsersDto) {
    this.logger.log('Request received to search in all users');
    const role: string = this.contextService.get('role');
    const userId: string = this.contextService.get('userId');
    const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber * limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
    let query = {};
    this.logger.log('params', params);

    switch (role) {
      case Roles.ADMIN:
        if (params?.userId) {
          query['userId'] = params.userId;
        }
        break;
      case Roles.MANAGER:
        let userIds: string[] = await this.cacheService.getTeamByManager(userId);
        userIds.push(userId);
        query = {
          userId: { $in: userIds },
        };
        break;
      case Roles.AGENT:
      default:
        query['userId'] = userId;
    }
    if (params?.userId) {
      query['_id'] = params.userId;
    }
    if (params?.mobile) {
      query['mobile'] = params.mobile;
    }
    if (params?.emailId) {
      query['emailId'] = params.emailId;
    }
    if (params?.name) {
      const nameRegex = new RegExp(params.name, 'i');
      query['$or'] = [{ name: { $regex: nameRegex } },
      { emailId: { $regex: params.name } },
      { mobile: { $regex: params.name } }
      ]
    };
    if (params?.role) {
      query['role'] = { $in: params?.role }
    }
    if (params?.deletedUser) {
      query['isDeleted'] = params.deletedUser==="true"?true:false
    }

    if (params?.startTime) {
      const startTime = params.startTime;
      let endTime = new Date().toISOString();
      if (params?.endTime) {
        endTime = params.endTime;
      }
      const value: any = { $gte: new Date(startTime), $lt: new Date(endTime) };
      query['updatedAt'] = value;
    }
    const response = await this.usersService.findAll(
      skip,
      limit,
      sortKey,
      sortDir,
      query,
    );
    return response;
  }
  @UseGuards(AuthGuard)
  @Post('/v1/remove-from-team/:id')
  async removeFromTeam(@Body() body: any, @Param('id') id: string) {
    if (body?.userIds?.length) {
      this.usersService.removeFromTeam(id, body?.userIds)
    }
  }

  

}
