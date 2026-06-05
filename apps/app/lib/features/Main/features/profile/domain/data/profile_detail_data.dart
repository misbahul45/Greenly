class ProfileDetailData {
  final String fullName;
  final String? phone;
  final String? address;
  final String? avatarUrl;

  const ProfileDetailData({
    required this.fullName,
    this.phone,
    this.address,
    this.avatarUrl,
  });

  factory ProfileDetailData.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] is Map<String, dynamic>
        ? json['profile'] as Map<String, dynamic>
        : json;

    return ProfileDetailData(
      fullName: profile['fullName']?.toString() ?? '',
      phone: (profile['phoneNumber'] ?? profile['phone'])?.toString(),
      address: profile['address']?.toString(),
      avatarUrl: profile['avatarUrl']?.toString(),
    );
  }
}
