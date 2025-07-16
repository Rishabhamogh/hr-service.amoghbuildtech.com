import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HttpRequestsService {
  private readonly logger = new Logger(HttpRequestsService.name);

  async post(url: string, data: any ) {
    let promise = new Promise((resolve, reject) => {
      try {
        this.logger.log('Post request url: ' + url);
        this.logger.debug('Payload: ', data);
        
        axios
          .post(url, data)
          .then((response: any) => {
            this.logger.debug('Response: ', response.data);
            resolve(response.data);
          })
          .catch((error) => {
            this.logger.error(error);
            reject(error.message);
          });
      } catch (error) {
        this.logger.error('Error in sending post request', error);
        reject(error.message);
      }
    });
    return promise;
  }

  async patch(url: string, data: any) {
    let promise = new Promise((resolve, reject) => {
      try {
        this.logger.log('Patch request url: ' + url);
        this.logger.debug('Payload: ', data);
       
        axios
          .patch(url, data)
          .then((response: any) => {
            this.logger.debug('Response: ', response.data);
            resolve(response.data);
          })
          .catch((error) => {
            this.logger.error(error);
            reject(error.message);
          });
      } catch (error) {
        this.logger.error('Error in sending patch request', error);
        reject(error.message);
      }
    });
    return promise;
  }

  async get(url: string,headers?:any) {
    let promise = new Promise((resolve, reject) => {
      try {
        this.logger.log('Get request url: ' + url );
        axios
          .get(url,{headers})
          .then((response: any) => {
           this.logger.debug('Response: ', response.data);
            resolve(response.data);
          })
          .catch((error) => {
            this.logger.error(error);
            reject(error.message);
          });
      } catch (error) {
        this.logger.error('Error in sending get request', error);
        reject(error.message);
      }
    });
    return promise;
  }
  async delete(url: string,headers?:any) {
    let promise = new Promise((resolve, reject) => {
      try {
        this.logger.log('delete request url: ' + url );
        axios
          .delete(url,{headers})
          .then((response: any) => {
            this.logger.debug('Response: ', response.data);
            resolve(response.data);
          })
          .catch((error) => {
            this.logger.error(error);
            reject(error.message);
          });
      } catch (error) {
        this.logger.error('Error in sending delete request', error);
        reject(error.message);
      }
    });
    return promise;
  }
}
