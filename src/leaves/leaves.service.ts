import { BadRequestException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { query } from "express";
import { LeaveDbService } from "./leave-db.service";
import { WhatsAppService } from "src/users/whatsapp/whatsapp.service";
import { MailService } from "src/mail/mail.service";
import { CacheService } from "src/shared/cache/cache.service";
import { LeaveStatus } from "src/common/constants/constants";


@Injectable()
export class LeavesService {
      private readonly logger = new Logger(LeavesService.name);

    constructor(
       private leaveDbService:LeaveDbService,
       private whatsappService: WhatsAppService,
       private mailService: MailService,
       private cacheService: CacheService,
    
    ) { }

    async create(payload: any) {
        payload['userId']= Types.ObjectId.createFromHexString(payload.userId)
        const response = await this.leaveDbService.saveLeaveApplication(payload)
        // let res= await this.whatsappService.sendWhatsAppMessage(payload.mobile,[payload.firstName,payload.lastName],payload.type)
const res = await this.cacheService.getUserData(payload.userId);
    const managerId = await this.cacheService.getManagerById(payload.userId);
      this.logger.log(`On Duty request created for user: ${managerId}`);
      this.logger.log(`On Duty request created for user: ${res}`,payload);
    if (managerId) {
      const managerData = await this.cacheService.getUserData(managerId);
      console.log('Manager data:', managerData);

 await this.mailService.sendMailTemplate(
    managerData.emailId,
    'leave' ,
    'requestSubmitted',
    {
      recipientName: res.name,
      employeeName: res.name,
      // employeeLastName: res.lastName,
      type: payload.type,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      reason: payload.reason
    }
  );
    }


    
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
            const response :any= await this.leaveDbService.update(filter, { $set: payload })
            this.logger.log("resss",response)
            if(payload.status === LeaveStatus.APPROVED || payload.status === LeaveStatus.REJECTED) {
              const userData = await this.cacheService.getUserData(response.userId.toString());
              this.logger.log(`On Duty request updated for user: ${userData}`, payload);
              if (userData) {
                 await this.mailService.sendMailTemplate(
    userData.emailId,
    'leave' ,
  payload.status===LeaveStatus.APPROVED? 'requestApproved':'requestRejected',
    {
      recipientName: userData.name,
      // employeeName: res.firstName,
      // employeeLastName: res.lastName,
      type: payload.type,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      reason: payload.reason
    }
  );
              }
            }
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
