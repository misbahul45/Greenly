class ShopData {
  final String id;
  final String name;
  final String? description;
  final String status;
  final int followerCount;
  final String? avatarUrl;
  final String? ownerName;
  final String? ownerAvatar;

  const ShopData({
    required this.id,
    required this.name,
    this.description,
    required this.status,
    this.followerCount = 0,
    this.avatarUrl,
    this.ownerName,
    this.ownerAvatar,
  });

  factory ShopData.fromJson(Map<String, dynamic> json) {
    final owner = json['owner'];
    final ownerAvatar = owner is Map<String, dynamic>
        ? owner['avatarUrl']?.toString()
        : null;

    return ShopData(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      status: json['status']?.toString() ?? '',
      followerCount: json['followerCount'] is int
          ? json['followerCount'] as int
          : int.tryParse('${json['followerCount']}') ?? 0,
      avatarUrl: json['avatarUrl']?.toString() ?? ownerAvatar,
      ownerName: owner is Map<String, dynamic>
          ? owner['fullName']?.toString() ?? owner['email']?.toString()
          : null,
      ownerAvatar: ownerAvatar,
    );
  }

  static List<ShopData> listFromJson(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(ShopData.fromJson)
        .toList();
  }
}
