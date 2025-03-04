import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { Types } from 'mongoose';
import { LeavesService } from './leaves.service';

@Controller('/leaves')
export class LeavesController {
    constructor(
        private leaveService:LeavesService,
        private contextService:RequestContextService

    ){  }
    @Post('/create-application')
    async create(@Body() payload:any){
       let response=await this.leaveService.create(payload)
       return response
    }
    @Get('/:id')
    async notification(@Param('id') id:any){
      id= Types.ObjectId.createFromHexString(id)
      let response=  await this.leaveService.findOne({userId:id})
        return response 

    }
    @Get('')
    async getNotification(@Body() params:any){
      const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber*limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
      let query={}
       
      let userId: string = this.contextService.get('userId');
      if(params?.isread) query['read']=params.isread
      let response=  await this.leaveService.findLeaveApplication(skip,
        limit,
        sortKey,
        sortDir,query)
        return response 

    }
    @Patch('/:id')
    async updateNotification(@Body() params:any, @Param('id') id: string){
     let response=await this.leaveService.updatePermission({_id:id},params)
      return response
    }
    @Post('/create-leave')
    async createLeave(@Body() payload:any){
       let response=await this.leaveService.create(payload)
       return response
    }
    @Get('/:id')
    async getOneLeave(@Param('id') id:any){
      id= Types.ObjectId.createFromHexString(id)
      let response=  await this.leaveService.findOne({userId:id})
        return response 

    }
    @Get('')
    async getLeave(@Body() params:any){
      const pageNumber: number = Number(params?.pageNumber) || 0;
    const limit: number = Number(params?.size) || 8;
    const skip: number = pageNumber*limit;
    const sortKey: string = params?.sortKey || 'createdAt';
    const sortDir: string = params?.sortDir || 'DESC';
      let query={}
       
      let userId: string = this.contextService.get('userId');
      if(params?.isread) query['read']=params.isread
      let response=  await this.leaveService.findLeaveApplication(skip,
        limit,
        sortKey,
        sortDir,query)
        return response 

    }
    @Patch('/:id')
    async updateLeave(@Body() params:any, @Param('id') id: string){
     let response=await this.leaveService.updatePermission({_id:id},params)
      return response
    }
}
