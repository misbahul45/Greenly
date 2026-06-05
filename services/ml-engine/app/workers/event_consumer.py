import asyncio
import logging
import socket
import threading
import time
from typing import Any

from kombu import Connection, Exchange, Queue

from app.clients.catalog_client import CatalogClient, normalize_product
from app.config import get_settings
from app.deps import get_embedding_service, get_vector_store
from app.schemas import ProductIndexItem

logger = logging.getLogger(__name__)

_RETRY_DELAYS = [5, 10, 20, 30, 60]


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

        attempt = 0
        while True:
            try:
                logger.info("[event_consumer] connecting to RabbitMQ (%s)...", self.settings.rabbitmq_url)
                with Connection(self.settings.rabbitmq_url) as connection:
                    logger.info("[event_consumer] connected, starting consumer loop")
                    attempt = 0
                    with connection.Consumer(queue, callbacks=[self.handle_message], accept=["json"]):
                        while True:
                            try:
                                connection.drain_events(timeout=5)
                            except socket.timeout:
                                continue
            except Exception as exc:
                delay = _RETRY_DELAYS[min(attempt, len(_RETRY_DELAYS) - 1)]
                logger.exception("[event_consumer] connection lost or failed: %s — retry in %ds", exc, delay)
                attempt += 1
                time.sleep(delay)

    def handle_message(self, body: dict[str, Any], message: Any) -> None:
        try:
            routing_key = (
                getattr(message.delivery_info, "routing_key", None)
                or message.delivery_info.get("routing_key")
            )
            asyncio.run(self.handle_event(routing_key, body))
            message.ack()
        except Exception as exc:
            logger.exception("[event_consumer] handle_message failed for routing_key=%s: %s", body, exc)
            message.reject(requeue=False)

    async def handle_event(self, routing_key: str, body: dict[str, Any]) -> None:
        try:
            data = body.get("data") if isinstance(body.get("data"), dict) else body
            product_id = (
                data.get("product_id")
                or data.get("productId")
                or data.get("id")
                or body.get("product_id")
                or body.get("productId")
            )

            if not product_id:
                logger.debug("[event_consumer] no product_id in event %s, body=%s", routing_key, body)
                return

            if routing_key in {"product.deleted", "ml.product.deleted"}:
                deleted = get_vector_store().delete(str(product_id))
                logger.info("[event_consumer] product.deleted %s — deleted=%s", product_id, deleted)
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
                logger.warning("[event_consumer] could not resolve product %s for event %s", product_id, routing_key)
                return

            embedding = get_embedding_service().embed_products([product])[0]
            get_vector_store().upsert(product, embedding)
            logger.info("[event_consumer] upserted product %s via event %s", product_id, routing_key)
        except Exception as exc:
            logger.exception("[event_consumer] handle_event failed for routing_key=%s: %s", routing_key, exc)
            raise

    async def resolve_product(self, product_id: str, data: dict[str, Any]) -> ProductIndexItem | None:
        if data.get("name"):
            normalized = dict(data)
            normalized["id"] = product_id
            return normalize_product(normalized)
        return await CatalogClient().fetch_product(product_id)


catalog_event_consumer = CatalogEventConsumer()
