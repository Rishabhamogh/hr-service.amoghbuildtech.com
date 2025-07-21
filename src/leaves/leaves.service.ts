import { BadRequestException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { query } from "express";
import { LeaveDbService } from "./leave-db.service";


@Injectable()
export class LeavesService {
      private readonly logger = new Logger(LeavesService.name);

    constructor(
       private leaveDbService:LeaveDbService
    
    ) { }

    async create(payload: any) {
        payload['userId']= Types.ObjectId.createFromHexString(payload.userId)
        const response = await this.leaveDbService.saveLeaveApplication(payload)
            return response
    }
        
     async createLeave(payload: any) {
        payload['userId']= Types.ObjectId.createFromHexString(payload.userId)
        const response = await this.leaveDbService.saveLeave(payload)
            return response
    }
 async addInArray(id: string, field: string, value: any,userId: string) {
    try {
      let payload: any = { $push: { [field]: {value,userId ,createdAt:new Date() } }}
      let response = await this.leaveDbService.update({_id:id}, payload);
      return response;
    } catch (error) {
      this.logger.error('Error in adding in array:', error);
      switch (error.name) {
        case 'InternalServerError':
          throw new BadRequestException(error.message || JSON.stringify(error));
        default:
          throw error;
      }
    }
  }


    async findLeaveApplication(skip: number,
        limit: number,
        sortKey: string,
        sortDir: string, 
        query:any){
       let response=await this.leaveDbService.findAll(skip,
        limit,
        sortKey,
        sortDir, 
        query)
       return response
    }
     async findLeave(skip: number,
        limit: number,
        sortKey: string,
        sortDir: string, 
        query:any){
       let response=await this.leaveDbService.findAllLeave(skip,
        limit,
        sortKey,
        sortDir, 
        query)
       return response
    }
    async update(filter:any,payload:any){
            const response= await this.leaveDbService.update(filter, { $set: payload })
            return response
       
    }
    async delete(query:any){
    
        const response= await this.leaveDbService.deletePermission(query)
        return response

    }
    async updateLeave(filter:any,query:any){
      
            const response= await this.leaveDbService.updateLeave(filter,query)
            return response
       
    }
    async findOne(query:any){
        let response=await this.leaveDbService.findOne(query)
        return response
    }

    async findAllWithouPagination(query:any){
        let response=await this.leaveDbService.findAllWithoutPagination(query)
        return response
    }

}
