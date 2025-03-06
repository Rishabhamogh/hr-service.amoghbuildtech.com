import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { UsersModule } from 'src/users/users.module';
import { CacheModule } from 'src/shared/cache/cache.module';

@Module({
  imports: [CacheModule, UsersModule],
  providers: [StartupService],
  exports: [StartupService],
})
export class StartupModule {}
