import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersRepositository } from './users.repository';

@Injectable()
export class ScheduleService {
  constructor(private readonly repo: UsersRepositository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Jakarta',
  })
  async cleanUpUser() {
    const threshold = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const result = await this.repo.anonymizeUsersOlderThan(threshold);

    console.log(`Deleted ${result.count} users permanently`);
  }
}