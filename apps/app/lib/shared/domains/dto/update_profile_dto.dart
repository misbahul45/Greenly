class UpdateProfileDto {
  final String? name;
  final String? phone;
  final String? address;
  final String? avatarUrl;

  UpdateProfileDto({
    this.name,
    this.phone,
    this.address,
    this.avatarUrl,
  });

  Map<String, dynamic> toJson() => {
    if (name != null && name!.isNotEmpty) 'name': name,
    if (phone != null) 'phone': phone,
    if (address != null) 'address': address,
    if (avatarUrl != null && avatarUrl!.isNotEmpty) 'avatarUrl': avatarUrl,
  };
}
