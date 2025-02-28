import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DatabaseErrorService {
  private readonly logger = new Logger(DatabaseErrorService.name);
  constructor(
    @InjectModel(Error.name) private error: Model<Error>, 
    
  ){

  }
  handle(error: any) {
    switch (error?.name) {
      case 'MongoServerError': {
        let obj: any = {
          statusCode: 422,
          message: error.message,
          error: 'MongoServerError',
        };
        throw new UnprocessableEntityException(obj);
      }
      case 'ValidationError': {
        let obj: any = {
          statusCode: 400,
          message: error.message,
          error: 'MongoValidationError',
        };
        throw new BadRequestException(obj);
      }
      case 'NotFoundException': {
        let obj: any = {
          statusCode: 400,
          message: error.message,
          error: 'MongoNotFoundError',
        };
        throw new BadRequestException(obj);
      }
      case 'InternalServerError': {
        let obj: any = {
          statusCode: 400,
          message: error.message,
          error: 'InternalServerError',
        };
        throw new BadRequestException(obj);
      }
      default:
        this.logger.error('Error ', error);
    }
    throw error;
  }

  async saveError(payload:any){
    const lead = new this.error(payload);
    const response = await lead.save();
    return response;
  }
}
