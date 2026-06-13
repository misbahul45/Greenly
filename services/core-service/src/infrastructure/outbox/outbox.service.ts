import {Injectable} from "@nestjs/common";
import {randomUUID} from "crypto";
import {DatabaseService} from "../../libs/database/database.service";

type OutboxEventInput = {
    eventType: string;
    routingKey: string;
    aggregateType?: string;
    aggregateId?: string;
    payload: unknown;
};

@Injectable()
export class OutboxService {
    constructor(private readonly db: DatabaseService) {}

    async createEvent(tx: any, input: OutboxEventInput) {
        return tx.outboxEvent.create({
            data: {
                id: randomUUID(),
                eventType: input.eventType,
                routingKey: input.routingKey,
                aggregateType: input.aggregateType,
                aggregateId: input.aggregateId,
                payload: input.payload,
                status: "PENDING",
            },
        });
    }

    async findPublishable(limit: number) {
        return this.db.outboxEvent.findMany({
            where: {
                status: {in: ["PENDING", "FAILED"]},
                OR: [{nextRetryAt: null}, {nextRetryAt: {lte: new Date()}}],
                attempts: {lt: 10},
            },
            orderBy: {createdAt: "asc"},
            take: limit,
        });
    }

    async markProcessing(id: string) {
        return this.db.outboxEvent.updateMany({
            where: {id, status: {in: ["PENDING", "FAILED"]}},
            data: {status: "PROCESSING"},
        });
    }

    async markPublished(id: string) {
        return this.db.outboxEvent.update({
            where: {id},
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),
                lastError: null,
            },
        });
    }

    async markFailed(id: string, attempts: number, error: unknown) {
        const delaySeconds = Math.min(300, 2 ** Math.max(attempts, 1));
        return this.db.outboxEvent.update({
            where: {id},
            data: {
                status: "FAILED",
                attempts: {increment: 1},
                lastError:
                    error instanceof Error ? error.message : String(error),
                nextRetryAt: new Date(Date.now() + delaySeconds * 1000),
            },
        });
    }
}
