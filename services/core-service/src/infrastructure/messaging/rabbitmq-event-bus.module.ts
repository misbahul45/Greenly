import {Global, Module} from "@nestjs/common";
import {RabbitMqEventBusService} from "./rabbitmq-event-bus.service";

@Global()
@Module({
    providers: [RabbitMqEventBusService],
    exports: [RabbitMqEventBusService],
})
export class RabbitMqEventBusModule {}
