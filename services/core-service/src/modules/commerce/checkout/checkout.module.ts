import {Module} from "@nestjs/common";
import {CheckoutController} from "./checkout.controller";
import {CheckoutService} from "./checkout.service";
import {CheckoutInitiatedPublisher} from "./checkout-initiated.publisher";
import {CartModule} from "../cart/cart.module";
import {OrderModule} from "../order/order.module";
import {PaymentModule} from "../../finance/payment/payment.module";
import {CatalogClientService} from "./catalog-client.service";

@Module({
    imports: [CartModule, OrderModule, PaymentModule],
    controllers: [CheckoutController],
    providers: [CheckoutService, CheckoutInitiatedPublisher, CatalogClientService],
})
export class CheckoutModule {}
