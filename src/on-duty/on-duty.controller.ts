import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { Types } from 'mongoose';
import { OnDutyService } from './on-duty.service';
import { Department, Roles } from 'src/common/constants/constants';
import { CacheService } from 'src/shared/cache/cache.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('/onDuty')
export class OnDutyController {
  constructor(
    private onDutyService: OnDutyService,
    private contextService: RequestContextService,
    private cacheService: CacheService

  ) { }
  @Post()
  async create(@Body() payload: any) {
    let response = await this.onDutyService.create(payload)
    return response
  }
  @Get('/:id')
  async notification(@Param('id') id: any) {
    id = Types.ObjectId.createFromHexString(id)
    let response = await this.onDutyService.findOne({ userId: id })
    return response

  }
  @Get()
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
    console.log("role", role)
    console.log("userId", userId)
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
    if (params?.userId) {
      query['userId'] = Types.ObjectId.createFromHexString(params.userId);
    }

    switch (role) {

      case Roles.MANAGER:
      case Roles.TEAM_LEAD:
        {
          if (department == Department.HR) {

          }
          else {
            let userIds: string[] = await this.cacheService.getTeamByManager(userId);
            const objectIds = userIds.map(id => new Types.ObjectId(id));
            objectIds.push(new Types.ObjectId(userId));
            userIds.push(userId);
            query['userId'] = { $in: objectIds }
          }
        }
        break;
      case Roles.AGENT: {
        if (department == Department.HR) {

        }
        query['userId'] = new Types.ObjectId(userId)

      }
      default: {
        // query['userId']=params.userId

      }

    }
    let response = await this.onDutyService.findLeaveApplication(skip,
      limit,
      sortKey,
      sortDir, query)
    return response

  }
  @Patch('/:id')
  async updateNotification(@Body() params: any, @Param('id') id: string) {
    let response = await this.onDutyService.updatePermission({ _id: id }, params)
    return response
  }
  @Delete('/:id')
  async lead(@Param('id') id: string) {
    let response = await this.onDutyService.delete({ _id: id })
    return response
  }

  @Get('/:id')
  async getOneLeave(@Param('id') id: any) {
    id = Types.ObjectId.createFromHexString(id)
    let response = await this.onDutyService.findOne({ userId: id })
    return response

  }
  @Get('')
  async getLeave(@Body() params: any) {
    const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber * limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
    let query = {}

    let userId: string = this.contextService.get('userId');
    // if(params?.isread) query['read']=params.isread
    let response = await this.onDutyService.findLeaveApplication(skip,
      limit,
      sortKey,
      sortDir, query)
    return response

  }
  @Patch('add/:id')
  async addInArray(@Body() params: any, @Param('id') id: string) {
    let response = await this.onDutyService.addInArray(id, params?.field, params.value, params?.userId)
    return response
  }
}
