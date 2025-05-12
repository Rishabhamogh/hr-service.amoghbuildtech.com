import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { query } from "express";
import { LeaveDbService } from "./leave-db.service";


@Injectable()
export class LeavesService {
    constructor(
       private leaveDbService:LeaveDbService
    
    ) { }

    async create(payload: any) {
        payload['userId']= Types.ObjectId.createFromHexString(payload.userId)
        const response = await this.leaveDbService.saveLeaveApplication(payload)
            return response
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
    async updatePermission(filter:any,payload:any){
            const response= await this.leaveDbService.updatePermission(filter, { $set: payload })
            return response
       
    }
    async delete(query:any){
    
        const response= await this.leaveDbService.deletePermission(query)
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
