import { Test, TestingModule } from '@nestjs/testing';
import { ShopBannerController } from './banner.controller';

describe('ShopBannerController', () => {
  let controller: ShopBannerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopBannerController],
    }).compile();

    controller = module.get<ShopBannerController>(ShopBannerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});