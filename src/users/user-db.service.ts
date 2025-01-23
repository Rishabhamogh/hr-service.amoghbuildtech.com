import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { isEmpty } from 'lodash';
import { DatabaseErrorService } from 'src/shared/error-handling/database-error.service';

@Injectable()
export class UserDbService {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    private dbErrorService: DatabaseErrorService,
  ) { }

  async save(payload: any) {
    try {
      const user = new this.users(payload);
      const response = await user.save();
      return response;
    } catch (error: any) {
      this.dbErrorService.handle(error);
    }
  }
//for find all users 
  async getAll(
    skip: number,
    limit: number,
    sortKey: string,
    sortDir: string,
    query: any,
  ) {
    const sortObj: any = {
      [sortKey]: sortDir === 'DESC' ? -1 : 1,
    };
    const totalItems: number = await this.users.countDocuments(query).exec();
    const totalPages: number = Math.floor((totalItems - 1) / limit) + 1;
    let aggregationQuery: any[] = 
    [
      {
        $match: query // Your initial match stage
      },
    
      {
        $lookup: {
          from: 'permission',
          localField: '_id',
          foreignField: 'userId',
          as: 'results'
        }
      },
      {
        $addFields: {
          permissions: { $arrayElemAt: ["$results", 0] } // Convert result array to object
        }
      },
      {
        $unset: 'results'
      },
      {
        $sort: { 'createdAt': -1 }
      }, 
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]
    const users = await this.users.aggregate(aggregationQuery)
    return {
      data: users,
      totalItems,
      totalPages,
    };
  }
//get one user by Query
  async getOne(query: any) {
    const user = await this.users.findOne(query).exec();
    return user;
  }

  async get(query: any, fields: any) {
    const users: any[] = await this.users.find(query).select(fields).exec();
    return users;
  }

  async updateOne(id: string, payload: any) {
    try {
      const user = await this.users.updateOne({ _id: id }, { $set: payload });
      return user;
    } catch (error: any) {
      this.dbErrorService.handle(error);
    }
  }

  async addToArray(id: string, name: string, payload: any) {
    try {
      const user = await this.users.updateOne(
        { _id: id },
        { $push: { [name]: payload } },
      );
      return user;
    } catch (error: any) {
      this.dbErrorService.handle(error);
    }
  }
  //remove from array
  async removeFromArray(id: string, name: string, payload: any) {
    try {
      const user = await this.users.updateOne(
        { _id: id },
        { $pull: { [name]: payload } },
        { multi: true }
      );
      return user;
    } catch (error: any) {
      this.dbErrorService.handle(error);
    }
  }

  async remove(id: any) {
    try {
      const user = await this.users.deleteOne({ _id: id });
      return user;
    } catch (error: any) {
      this.dbErrorService.handle(error);
    }
  }

  async getArrayByField(query: any, fields: string[], sort: any) {
    let objFileds = {};
    fields.map((item) => {
      return objFileds[item] = 1
    });
    let data: any[] = [];
    if (sort) {
      data = await this.users
        .find(query)
        .sort(sort)
        .select(objFileds)
        .exec();
    } else {
      data = await this.users
        .find(query)
        .select(objFileds)
        .exec();
    }
    return data;
  }
}
