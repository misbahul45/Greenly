import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

export type CatalogProductSnapshot = {
    id: string;
    shopId: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
    imageUrl?: string;
};

@Injectable()
export class CatalogClientService {
    private readonly logger = new Logger(CatalogClientService.name);

    constructor(private readonly configService: ConfigService) {}

    async resolveProducts(
        productIds: string[]
    ): Promise<Map<string, CatalogProductSnapshot>> {
        const uniqueIds = [...new Set(productIds)];
        const products = await Promise.all(
            uniqueIds.map((id) => this.fetchProduct(id))
        );

        return new Map(products.map((product) => [product.id, product]));
    }

    private async fetchProduct(id: string): Promise<CatalogProductSnapshot> {
        const baseUrl =
            this.configService.get<string>("catalog.url") ||
            process.env.CATALOG_SERVICE_URL ||
            "http://catalog-service:8081";
        const url = `${baseUrl.replace(/\/$/, "")}/products/${encodeURIComponent(id)}`;

        const response = await fetch(url, {
            headers: {Accept: "application/json"},
        });

        if (!response.ok) {
            this.logger.warn(`Catalog lookup failed for ${id}: ${response.status}`);
            throw new BadRequestException(`Product ${id} is not available`);
        }

        const body = await response.json();
        const product = body?.data ?? body;
        const price = Number(product.finalPrice ?? product.price);
        const stock = Number(product.stock ?? 0);

        if (!product?.id || !product?.shopId || !product?.name || price <= 0) {
            throw new BadRequestException(`Invalid catalog data for ${id}`);
        }

        return {
            id: String(product.id),
            shopId: String(product.shopId),
            name: String(product.name),
            price: Math.round(price),
            stock,
            isActive: product.isActive !== false,
            imageUrl: Array.isArray(product.imageUrls)
                ? product.imageUrls[0]
                : undefined,
        };
    }
}
