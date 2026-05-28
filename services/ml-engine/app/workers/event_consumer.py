import asyncio
import socket
import threading
from typing import Any

from kombu import Connection, Exchange, Queue

from app.clients.catalog_client import CatalogClient, normalize_product
from app.config import get_settings
from app.deps import get_embedding_service, get_vector_store
from app.schemas import ProductIndexItem


class CatalogEventConsumer:
    def __init__(self):
        self.settings = get_settings()
        self.thread: threading.Thread | None = None
        self.started = False

    def start(self) -> None:
        if self.started:
            return
        self.started = True
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.thread.start()

    def run(self) -> None:
        exchange = Exchange("greenly_events", type="topic", durable=True)
        queue = Queue(
            "ml-engine-products",
            exchange=exchange,
            routing_key="#",
            durable=True,
        )

        try:
            with Connection(self.settings.rabbitmq_url) as connection:
                with connection.Consumer(queue, callbacks=[self.handle_message], accept=["json"]):
                    while True:
                        try:
                            connection.drain_events(timeout=5)
                        except socket.timeout:
                            continue
        except Exception:
            self.started = False

    def handle_message(self, body: dict[str, Any], message: Any) -> None:
        try:
            routing_key = getattr(message.delivery_info, "routing_key", None) or message.delivery_info.get("routing_key")
            asyncio.run(self.handle_event(routing_key, body))
            message.ack()
        except Exception:
            message.reject(requeue=False)

    async def handle_event(self, routing_key: str, body: dict[str, Any]) -> None:
        data = body.get("data") if isinstance(body.get("data"), dict) else body
        product_id = (
            data.get("product_id")
            or data.get("productId")
            or data.get("id")
            or body.get("product_id")
            or body.get("productId")
        )

        if not product_id:
            return

        if routing_key in {"product.deleted", "ml.product.deleted"}:
            get_vector_store().delete(str(product_id))
            return

        if routing_key not in {
            "product.created",
            "product.updated",
            "product.eco_attribute.updated",
            "price.updated",
            "inventory.updated",
            "discount.applied",
            "ml.product.created",
            "ml.product.updated",
            "ml.inventory.updated",
            "ml.price.updated",
            "ml.discount.applied",
        }:
            return

        product = await self.resolve_product(str(product_id), data)
        if product is None:
            return

        embedding = get_embedding_service().embed_products([product])[0]
        get_vector_store().upsert(product, embedding)

    async def resolve_product(self, product_id: str, data: dict[str, Any]) -> ProductIndexItem | None:
        if data.get("name"):
            normalized = dict(data)
            normalized["id"] = product_id
            return normalize_product(normalized)
        return await CatalogClient().fetch_product(product_id)


catalog_event_consumer = CatalogEventConsumer()
