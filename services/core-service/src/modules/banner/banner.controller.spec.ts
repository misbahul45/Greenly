import { Test, TestingModule } from '@nestjs/testing';
import { BannerAdminController, BannerPublicController } from './banner.controller';

describe('BannerController', () => {
  let adminController: BannerAdminController;
  let publicController: BannerPublicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerAdminController, BannerPublicController],
    }).compile();

    adminController = module.get<BannerAdminController>(BannerAdminController);
    publicController = module.get<BannerPublicController>(BannerPublicController);
  });

  it('should be defined', () => {
    expect(adminController).toBeDefined();
    expect(publicController).toBeDefined();
  });
});