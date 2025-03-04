import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { Leave } from "./schemas/leave.schema";
import { LeaveApplication } from "./schemas/leaves-application.schema";


@Injectable()
export class LeaveDbService {
    constructor(
        @InjectModel(Leave.name)
        private leave: Model<Leave>,
        @InjectModel(LeaveApplication.name) private leaveApplication: Model<LeaveApplication>,
        private dbErrorService: DatabaseErrorService,
    ) { }

    async saveLeaveApplication(createLeave: any) {
        try{
        const notifcations = new this.leaveApplication(createLeave)
        const response = await notifcations.save()
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
        }
    }

    async findAll(skip: number,
        limit: number,
        sortKey: string,
        sortDir: string,
        query: any = {}){
        try{
            const sortObj: any = {
                [sortKey]: sortDir === 'DESC' ? -1 : 1,
              };
              const totalItems: number = await this.leaveApplication
                .countDocuments(query)
                .exec();
              const totalPages: number = Math.floor((totalItems - 1) / limit) + 1;
              const properties = await this.leaveApplication
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortObj)
                .exec();
              return {
                data: properties,
                totalItems,
                totalPages,
              };
        
        }
        catch(error){
         this.dbErrorService.handle(error)
        }
    }
    async updatePermission(filter:any,query:any){
        try{
            const response= await this.leaveApplication.updateOne(filter,query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }
    async deletePermission(query:any){
    try{
        const response= await this.leaveApplication.deleteMany(query)
        return response
    }
    catch(error){
        this.dbErrorService.handle(error)

    }
    }
    async findOne(query:any){
        try{
            const response= await this.leaveApplication.findOne(query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }

    async findAllWithoutPagination(query:any){
        try{
            const response= await this.leaveApplication.find(query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }

    async saveLeave(createLeave: any) {
        try{
        const notifcations = new this.leave(createLeave)
        const response = await notifcations.save()
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
        }
    }

    async findAllLeave(skip: number,
        limit: number,
        sortKey: string,
        sortDir: string,
        query: any = {}){
        try{
            const sortObj: any = {
                [sortKey]: sortDir === 'DESC' ? -1 : 1,
              };
              const totalItems: number = await this.leave
                .countDocuments(query)
                .exec();
              const totalPages: number = Math.floor((totalItems - 1) / limit) + 1;
              const properties = await this.leave
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortObj)
                .exec();
              return {
                data: properties,
                totalItems,
                totalPages,
              };
        
        }
        catch(error){
         this.dbErrorService.handle(error)
        }
    }
    async updateLeave(filter:any,query:any){
        try{
            const response= await this.leave.updateOne(filter,query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }
    async deleteLeave(query:any){
    try{
        const response= await this.leave.deleteMany(query)
        return response
    }
    catch(error){
        this.dbErrorService.handle(error)

    }
    }
    async findOneLeave(query:any){
        try{
            const response= await this.leave.findOne(query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }

    async findAllLeaveWithoutPagination(query:any){
        try{
            const response= await this.leave.find(query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }


}
