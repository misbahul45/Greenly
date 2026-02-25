import { Module } from '@nestjs/common';
import { ModulesModule } from './modules/modules.module';
import { LibsModule } from './libs/libs.module';
import { ConfigModule } from '@nestjs/config';
import envConfig from './libs/config/env.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessGuard } from './modules/auth/guards/jwt.access.guard';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ModulesModule, 
    LibsModule,
    ConfigModule.forRoot({
      isGlobal:true,
      load:[envConfig],
      envFilePath:'.env'
    }),
    ScheduleModule.forRoot()
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
  ]
})
export class AppModule {}
