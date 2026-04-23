import { Module, Global } from '@nestjs/common';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { LedgerRepository } from './ledger.repository';
import { LedgerCreatedPublisher } from './publishers/ledger-created.publisher';

@Global()
@Module({
  controllers: [LedgerController],
  providers: [
    LedgerService,
    LedgerRepository,
    LedgerCreatedPublisher,
  ],
  exports: [
    LedgerService,
    LedgerRepository,
    LedgerCreatedPublisher,
  ],
})
export class LedgerModule {}
