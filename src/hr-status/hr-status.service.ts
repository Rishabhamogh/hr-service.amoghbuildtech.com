import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { query } from "express";
import { HRStatusDbService } from "./hr-status.db.service";


@Injectable()
export class HRStausService {
          private readonly logger = new Logger(HRStausService.name);
    
    constructor(
       private HRStatusDbService:HRStatusDbService
    
    ) { }

    async create(payload: any) {
        payload['userId']= Types.ObjectId.createFromHexString(payload.userId)
        const response = await this.HRStatusDbService.save(payload)
            return response
    }
        
    

    async findLeaveApplication(skip: number,
        limit: number,
        sortKey: string,
        sortDir: string, 
        query:any){
       let response=await this.HRStatusDbService.findAll(skip,
        limit,
        sortKey,
        sortDir, 
        query)
       return response
    }
    async updatePermission(filter:any,payload:any){
            const response= await this.HRStatusDbService.update(filter, { $set: payload })
                this.addInArray(filter._id,"logs",payload.logs,payload.userId)
            return response
       
    }
    async delete(query:any){
    
        const response= await this.HRStatusDbService.delete(query)
        return response

    }
    async findOne(query:any){
      this.logger.log(`Finding HR status for query: ${JSON.stringify(query)}`,query);
        let response=await this.HRStatusDbService.findOne(query)
        return response
    }

    async findAllWithouPagination(query:any){
        let response=await this.HRStatusDbService.findAllWithoutPagination(query)
        return response
    }
   async addInArray(id: string, field: string, value: any,userId: string) {
    try {
      let payload: any = { $push: { [field]: {value,userId } }}
      let response = await this.HRStatusDbService.update({_id:id}, payload);
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
}
