import {Global, Module} from "@nestjs/common";
import {RabbitMqEventBusModule} from "../messaging/rabbitmq-event-bus.module";
import {OutboxPublisherProcessor} from "./outbox-publisher.processor";
import {OutboxService} from "./outbox.service";

@Global()
@Module({
    imports: [RabbitMqEventBusModule],
    providers: [OutboxService, OutboxPublisherProcessor],
    exports: [OutboxService],
})
export class OutboxModule {}
