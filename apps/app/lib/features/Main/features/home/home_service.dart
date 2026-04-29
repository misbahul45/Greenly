import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/Main/features/home/model/respon/active_banner_respon.dart';
import 'package:app/features/Main/features/home/model/respon/get_categories_respon.dart';
import 'package:app/features/Main/features/home/model/respon/get_products_respon.dart';

class HomeService {
  static String get _baseUrlCore => "${ENV.API}/core";
  static String get _baseUrlCatalog => "${ENV.API}/catalog";

  Future<ApiResponse<ActiveBannerRespon>> getActiveBanners() async {
    return await ApiClient.get(
      "$_baseUrlCore/banners/active",
      fromJsonT: (json) => ActiveBannerRespon.fromJson(json),
    );
  }

  Future<ApiResponse<GetCategoriesRespon>> getCategories() async {
    return await ApiClient.get(
      "$_baseUrlCatalog/categories",
      fromJsonT: (json) => GetCategoriesRespon.fromJson(json),
    );
  }

  Future<ApiResponse<GetProductsRespon>> getProducts({
    required int page,
    int limit = 10,
  }) async {
    return await ApiClient.get(
      "$_baseUrlCatalog/products?page=$page&limit=$limit",
      fromJsonT: (json) => GetProductsRespon.fromJson(json),
    );
  }
}
