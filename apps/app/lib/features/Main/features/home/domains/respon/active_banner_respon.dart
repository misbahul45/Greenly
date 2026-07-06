import 'package:Greenly/core/utils/json_mapper.dart';
import 'package:Greenly/features/Main/features/home/domains/data/banner_data.dart';

class ActiveBannerRespon {
  final List<BannerData> data;

  ActiveBannerRespon({required this.data});

  factory ActiveBannerRespon.fromJson(dynamic json) {
    return ActiveBannerRespon(
      data: JsonMapper.list<BannerData>(json, BannerData.fromJson),
    );
  }
}
