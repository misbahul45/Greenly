import 'package:app/core/utils/json_mapper.dart';
import 'package:app/features/Main/features/home/model/data/banner_data.dart';

class ActiveBannerRespon {
  final List<BannerData> data;

  ActiveBannerRespon({required this.data});

  factory ActiveBannerRespon.fromJson(dynamic json) {
    return ActiveBannerRespon(
      data: JsonMapper.list<BannerData>(
        json is List ? json : json['data'],
        BannerData.fromJson,
      ),
    );
  }
}