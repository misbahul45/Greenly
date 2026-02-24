import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MessaggingModule } from './messagging/messagging.module';
@Module({
  imports: [DatabaseModule, MessaggingModule],
})
export class LibsModule {}
