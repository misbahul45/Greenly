package activeprice

import (
	"context"
	priceModule "catalog-service/modules/price"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type priceAccessor struct {
	repo priceModule.Repository
}

func (p *priceAccessor) FindByProductID(ctx context.Context, productID string) (PriceInfo, error) {
	price, err := p.repo.FindByProductID(ctx, productID)
	if err != nil {
		return PriceInfo{}, err
	}
	return PriceInfo{
		ID:        price.ID,
		ProductID: price.ProductID,
		Amount:   price.Amount,
		Currency: price.Currency,
	}, nil
}

func ActivePriceRouter(rg *gin.RouterGroup, db *mongo.Database) {
	repo := NewRepository(db)
	priceRepo := priceModule.NewRepository(db)
	priceAcc := &priceAccessor{repo: priceRepo}
	service := NewService(repo, priceAcc)
	handler := NewHandler(service)

	activePrices := rg.Group("/active-prices")
	{
		activePrices.GET("/:productId", handler.FindByProductID)
		activePrices.POST("/:productId/recalculate", handler.Recalculate)
		activePrices.POST("/recalculate-all", handler.RecalculateAll)
	}
}