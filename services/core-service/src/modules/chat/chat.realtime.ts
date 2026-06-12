import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ChatRealtime {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  stream(conversationId: string): Observable<MessageEvent> {
    return this.subject(conversationId).asObservable();
  }

  emit(conversationId: string, event: string, data: unknown) {
    this.subject(conversationId).next({
      type: event,
      data: data as string | object,
    });
  }

  private subject(conversationId: string) {
    const existing = this.streams.get(conversationId);
    if (existing) {
      return existing;
    }

    const created = new Subject<MessageEvent>();
    this.streams.set(conversationId, created);
    return created;
  }
}
