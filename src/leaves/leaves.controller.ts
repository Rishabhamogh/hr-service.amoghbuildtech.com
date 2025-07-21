import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { Types } from 'mongoose';
import { LeavesService } from './leaves.service';
import { Department, Roles } from 'src/common/constants/constants';
import { CacheService } from 'src/shared/cache/cache.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('/leaves')
export class LeavesController {
  constructor(
    private leaveService: LeavesService,
    private contextService: RequestContextService,
    private cacheService: CacheService,

  ) { }
  @Post('/create-application')
  async create(@Body() payload: any) {
    let response = await this.leaveService.create(payload)
    return response
  }
  // @Get('/:id')
  // async notification(@Param('id') id:any){
  //   id= Types.ObjectId.createFromHexString(id)
  //   let response=  await this.leaveService.findOne({userId:id})
  //     return response 

  // }
  @Get("/application")
  async getNotification(@Query() params: any) {
    console.log("pp", params)
    const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber * limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
    let query = {}

    let userId: string = this.contextService.get('userId');
    let department: string = this.contextService.get('department');
    let role: string = this.contextService.get('role');


    // if(params?.userId)  query['userId'] = new Types.ObjectId(userId); 
    switch (role) {
      case Roles.ADMIN:
        console.log("ADMIN")
 if (params?.userId) {
            let role = await this.cacheService.getRoleById(params?.userId);
            if(role===Roles.TEAM_LEAD || role===Roles.MANAGER){
           let userIds: string[] = await this.cacheService.getTeamByManager(params?.userId);

             const objectIds = userIds.map(id => new Types.ObjectId(id));
          // objectIds.push(new Types.ObjectId(userId));
        // userIds.push(userId);
          query['userId'] = { $in: objectIds }
            }
            else{
              query['userId'] = Types.ObjectId.createFromHexString(params?.userId);
            }

          }
        break;
      case Roles.MANAGER:
      case Roles.TEAM_LEAD:

        if (department?.includes(Department.HR)) {
          
        }
        else {
       
          
          let userIds: string[] = await this.cacheService.getTeamByManager(userId);
          const objectIds = userIds.map(id => new Types.ObjectId(id));
          objectIds.push(new Types.ObjectId(userId));
          userIds.push(userId);
          query['userId'] = { $in: objectIds }
        }
        if (params?.userId) {
            let role = await this.cacheService.getRoleById(params?.userId);
            console.log("role", role)
            if(role===Roles.TEAM_LEAD || role===Roles.MANAGER){
           let userIds: string[] = await this.cacheService.getTeamByManager(params?.userId);

             const objectIds = userIds.map(id => new Types.ObjectId(id));
          objectIds.push(new Types.ObjectId(userId));
          userIds.push(userId);
          query['userId'] = { $in: objectIds }
            }
            else{
              query['userId'] = Types.ObjectId.createFromHexString(params.userId);
            }

          }
        break;

      case Roles.MARKETING_MANAGER:

      case Roles.AGENT:
        if (department?.includes(Department.HR)) {
            if (params?.userId) {
            let role = await this.cacheService.getRoleById(params?.userId);
            if(role===Roles.TEAM_LEAD || role===Roles.MANAGER){
           let userIds: string[] = await this.cacheService.getTeamByManager(params?.userId);

             const objectIds = userIds.map(id => new Types.ObjectId(id));
          objectIds.push(new Types.ObjectId(userId));
          userIds.push(userId);
          query['userId'] = { $in: objectIds }
            }
            else{
              query['userId'] = Types.ObjectId.createFromHexString(params.userId);
            }

          }
        }
        else {

          query['userId'] = new Types.ObjectId(userId)

        }
        break;
      default:
        console.log("default case")

        query['userId'] = userId
        break
    }
    if (params?.startTime) {
      const startTime = params.startTime;
      let endTime = new Date().toISOString();
      if (params?.endTime) {
        endTime = params.endTime;
      }

      query['$or'] = [
        { fromDate: { $gte: new Date(startTime), $lt: new Date(endTime) } },
        { toDate: { $gte: new Date(startTime), $lt: new Date(endTime) } }
      ];
    }
    if(params?.status){
      query['status'] = params?.status
    }

    let response = await this.leaveService.findLeaveApplication(skip,
      limit,
      sortKey,
      sortDir, query)
    return response

  }
  @Patch('/:id')
  async updateNotification(@Body() params: any, @Param('id') id: string) {
    let response = await this.leaveService.update({ _id: id }, params)
    return response
  }
  @Delete('/:id')
  async lead(@Param('id') id: string) {
    let response = await this.leaveService.delete({ _id: id })
    return response
  }
  @Post('/create-leave')
  async createLeave(@Body() payload: any) {
    let response = await this.leaveService.createLeave(payload)
    return response
  }
  @Get('/:id')
  async getOneLeave(@Param('id') id: any) {
    id = Types.ObjectId.createFromHexString(id)
    let response = await this.leaveService.findOne({ userId: id })
    return response

  }
  @Patch('leaves/:id')
 async updateLeave(@Body() params: any, @Param('id') id: string) {
  let filter = { _id: id }
  let query = params
            const response= await this.leaveService.updateLeave(filter,query)
            return response
       
    }
  @Get()
  async getLeave(@Query() params: any) {
    const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber * limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
    let query = {}

    let userId: string = this.contextService.get('userId');
    let role: string = this.contextService.get('role');

    if (params?.startTime) {
      const startTime = params.startTime;
      let endTime = new Date().toISOString();
      if (params?.endTime) {
        endTime = params.endTime;
      }
      const value: any = {
        $gte: new Date(startTime),
        $lt: new Date(endTime),
      };
      query['createdAt'] = value;
    }

    console.log("role", role)
    console.log("useId", userId)

    query['userId'] = new Types.ObjectId(userId);
    if (params?.userId) {
      query['userId'] = new Types.ObjectId(params.userId);
    }
    switch (role) {
      case Roles.MANAGER:
      case Roles.TEAM_LEAD:
        {
          let userIds: string[] = await this.cacheService.getTeamByManager(userId);
          const objectIds = userIds.map(id => new Types.ObjectId(id));
          objectIds.push(new Types.ObjectId(userId));
          userIds.push(userId);
          query['userId'] = { $in: objectIds }
        }
        break;
      case Roles.AGENT: {
        query['userId'] = new Types.ObjectId(userId)

      }
      default: {
        // query['userId']=new Types.ObjectId(userId)

      }

    }
    // if (params?.userId) {
    //   query['userId'] = new Types.ObjectId(params.userId.toString());
    // }
    let response = await this.leaveService.findLeave(skip,
      limit,
      sortKey,
      sortDir, query)
    return response

  }
  @Patch('add/:id')
  async addInArray(@Body() params: any, @Param('id') id: string) {
    let response = await this.leaveService.addInArray(id, params?.field, params.value, params?.userId)
    return response
  }
}
