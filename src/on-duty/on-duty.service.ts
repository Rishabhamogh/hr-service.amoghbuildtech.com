import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DatabaseErrorService } from "src/shared/error-handling/database-error.service";
import { query } from "express";
import { OnDutyDbService } from "./on-duty-db.service";
import { WhatsAppService } from "src/users/whatsapp/whatsapp.service";
import { CacheService } from "src/shared/cache/cache.service";
import { MailService } from "src/mail/mail.service";
import { OnDutyStatus } from "src/common/constants/constants";


@Injectable()
export class OnDutyService {
          private readonly logger = new Logger(OnDutyService.name);
    
    constructor(
       private leaveDbService:OnDutyDbService,
        private whatsappService: WhatsAppService,
        private cacheService: CacheService,
        private mailService: MailService,
    
    ) { }

    async create(payload: any) {
    payload['userId'] = Types.ObjectId.createFromHexString(payload.userId);
    const response = await this.leaveDbService.save(payload);
    const res = await this.cacheService.getUserData(payload.userId);
    const managerId = await this.cacheService.getManagerById(payload.userId);
      this.logger.log(`On Duty request created for user: ${managerId}`);
      this.logger.log(`On Duty request created for user: ${res}`,payload);
    if (managerId) {
      const managerData = await this.cacheService.getUserData(managerId);
      console.log('Manager data:', managerData);

    await this.mailService.sendMailTemplate(
    managerData.emailId,
    'onDuty' ,
    'requestSubmitted',
    {
      recipientName: managerData.name,
      employeeName: res.name,
      // employeeLastName: res.lastName,
      type: payload.type,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      reason: payload.reason
    }
  );
      
      // await this.whatsappService.sendWhatsAppMessage(
      //   managerData.mobile,
      //   [res.firstName, res.lastName],
      //   payload.type
      // );
    }

    await this.mailService.sendMailTemplate(
    res.emailId,
    'onDuty' ,
    'requestSubmitted',
    {
      recipientName: res.firstName,
      employeeName: res.firstName,
      // employeeLastName: res.lastName,
      type: payload.type,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      reason: payload.reason
    }
  );
   

    return response;
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
        
            const response= await this.leaveDbService.update(filter, { $set: payload })
            this.logger.log("resss",response)
            if(payload.status === 'APPROVED' || payload.status === 'REJECTED') {
              const userData = await this.cacheService.getUserData(response.userId.toString());
              this.logger.log(`On Duty request updated for user: ${userData}`, payload);
              if (userData) {
                 await this.mailService.sendMailTemplate(
    userData.emailId,
    'onDuty' ,
    payload.status===OnDutyStatus.APPROVED?'requestApproved': 'requestRejected',
    {
      recipientName: userData.name,
      // employeeName: response.firstName,
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
    
        const response= await this.leaveDbService.delete(query)
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
   async addInArray(id: string, field: string, value: any,userId: string) {
    try {
      let payload: any = { $push: { [field]: {value,userId } }}
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
}
