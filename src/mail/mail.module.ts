import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailController } from './mail.controller';
import { CacheService } from 'src/shared/cache/cache.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        pool:true,
        auth: {
            user: 'sales@amoghbuildtech.com', 
        pass: 'rdng hazu kgnu dfnd',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      // template: {
      //   dir: join(__dirname, 'templates'),
      //   adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
      //   // options: {
      //   //   strict: true,
      //   // },
      // },
    }),
  ],
  controllers: [MailController],
  providers: [MailService, CacheService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}
