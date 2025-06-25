import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { OnDuty } from "./schemas/on-duty.schema";


@Injectable()
export class OnDutyDbService {
    constructor(
        
        @InjectModel(OnDuty.name) private leaveApplication: Model<OnDuty>,
        private dbErrorService: DatabaseErrorService,
    ) { }

    async save(createLeave: any) {
        try{
        const onDuty = new this.leaveApplication(createLeave)
        const response = await onDuty.save()
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
            console.log("query",query)
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
    async update(filter:any,query:any){
        try{
            const response= await this.leaveApplication.updateOne(filter,query)
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }
    async delete(query:any){
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
            const response= await this.leaveApplication.find(query).exec()
            return response
        }
        catch(error){
            this.dbErrorService.handle(error)
    
        }
    }

 

}
