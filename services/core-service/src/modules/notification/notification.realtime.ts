import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationRealtime {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  stream(userId: string): Observable<MessageEvent> {
    return this.subject(userId).asObservable();
  }

  emit(userId: string, event: string, data: unknown) {
    this.subject(userId).next({
      type: event,
      data: data as string | object,
    });
  }

  private subject(userId: string) {
    const existing = this.streams.get(userId);
    if (existing) {
      return existing;
    }

    const created = new Subject<MessageEvent>();
    this.streams.set(userId, created);
    return created;
  }
}
