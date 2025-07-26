import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheService } from 'src/shared/cache/cache.service';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
    constructor(
      //  private cacheService: CacheService,
        private httpService:HttpRequestsService,
     //   @Inject(CACHE_MANAGER) private cacheManager: Cache 
          private userService:UsersService
      ) { }

      async sendWhatsAppMessage(mobile:string,varibles:any,campaignName:string){
try{
      let response= await this.userService.findOne({mobile})
      this.logger.log("whats app varibales",varibles)
        if(response.isDeleted) return "User Already deleted"
        let payload={
          
            apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MDg1MmM0ZjcyMDQwMGI3NTYwMjJjYyIsIm5hbWUiOiJBbW9naCBCdWlsZHRlY2ggUHJpdmF0ZSBMaW1pdGVkIiwiYXBwTmFtZSI6IkFpU2Vuc3kiLCJjbGllbnRJZCI6IjY2MDg1MmMzZjcyMDQwMGI3NTYwMjJjNyIsImFjdGl2ZVBsYW4iOiJCQVNJQ19NT05USExZIiwiaWF0IjoxNzExODIxNTA4fQ.C7PsLFPRYRTg3r1FoPdRgqiL35A9dVXH5frNxKD58sY",
            campaignName: campaignName,
            destination: "91"+mobile,
            userName: varibles[1],
            templateParams :varibles
        
        
        }
         this.httpService.post('https://backend.aisensy.com/campaign/t1/api/v2',payload)
      }
    
    catch(error){
      this.logger.error(error)
    }
}
}
