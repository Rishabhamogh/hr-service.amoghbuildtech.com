import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';

export const createHashValue = (str: string) => {
  if (!str) {
    throw new BadRequestException();
  }
  return createHash('sha256').update(str).digest('hex');
};

export const createMobileHash = (mobile: any): string => {
  try {
    let str: string = mobile?.countryCode?.startsWith('+')
      ? mobile.countryCode.slice(1)
      : mobile.countryCode;
    str = str.concat(mobile.number);
    return createHash('sha256').update(str).digest('hex');
  } catch (error) {
    return `${mobile?.countryCode}${mobile?.number}`;
  }
};

export const createEmailHash = (emailId: string): string => {
  return createHash('sha256').update(emailId).digest('hex');
};

export const maskMobileNumber = (mobile: any): string => {
  try {
    let str: string = mobile.number;
    let arr: string[] = str.split('');
    const len: number = arr.length;
    let startIndex: number = 0;
    let endIndex: number = len - 1;
    if (len > 4) {
      startIndex = 2;
      endIndex = len - 3;
      for (let i = startIndex; i < endIndex; i++) {
        arr[i] = '*';
      }
      return arr.join('');
    }
    let countryCode: string = mobile?.countryCode?.startsWith('+')
      ? mobile.countryCode.slice(1)
      : mobile.countryCode;
    return `${countryCode}${str}`;
  } catch (error) {
    return `${mobile?.countryCode}${mobile?.number}`;
  }
};

export const maskEmail = (str: string): string => {
  try {
    let data: string[] = str.split('@');
    if (data.length < 2) {
      return str;
    }
    let name = data[0];
    const len: number = name.length;
    let startIndex: number = 0;
    let endIndex: number = len - 1;
    if (len > 3) {
      startIndex = 1;
      endIndex = len - 2;
      let arr: string[] = name.split('');
      for (let i = startIndex; i < endIndex; i++) {
        arr[i] = '*';
      }
      let maskedName: string = arr.join('');
      return `${maskedName}@${data[1]}`;
    }
    return str;
  } catch (error) {
    return str;
  }
};

export const randomFromArray = (arr: any[]) => {
  const index: number = Math.floor(Math.random() * arr.length);
  return arr[index];
};

export const parseMobileNumber = (value: string) => {
  try {
    if (!value) {
      return value;
    }
    let mobile: string = value.trim();
    let arr: string[] = mobile.split('-');
    if (arr.length > 1) {
      mobile = arr.join('');
    }
    arr = mobile.split(' ');
    if (arr.length > 1) {
      mobile = arr.join('');
    }

    arr = mobile.split('');
    let i: number = 0;
    const length = arr.length;
    while (i < length) {
      if (Number(arr[i])) {
        break;
      } else {
        i++;
      }
    }
    mobile = mobile.slice(i);
    return mobile;
  } catch (error) {
    return value;
  }
}
export const validateApiKey=async(leadKey:string,providedkey: string)=>{
      if (await bcrypt.compare(providedkey, leadKey)) {
          return true;
      }
  return false;
}
  
export const generateApiKey=async()=> {
  const apiKey = uuidv4();
  const encryptedKey = await bcrypt.hash(apiKey, 10);
  return {apiKey,encryptedKey};
}

export const transformKeys = (obj:any, prefix:string) => {
  return Object.entries(obj).reduce((newObj, [key, value]) => {
    // Add the prefix to the key
    const newKey = `${prefix}${key}`;
    // Assign the value to the new key
    newObj[newKey] = value;
    return newObj;
  }, {});
};

export function toObjectId(value: string | string[]): Types.ObjectId | Types.ObjectId[] {
  if (Array.isArray(value)) {
    return value.map((id) => new Types.ObjectId(id));
  }
  return new Types.ObjectId(value);
}
