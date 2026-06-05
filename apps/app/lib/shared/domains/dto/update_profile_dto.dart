class UpdateProfileDto {
  final String? name;
  final String? phone;
  final String? address;
  final String? avatarUrl;
  final String? receiverName;
  final String? addressLine;
  final String? city;
  final String? province;
  final String? postalCode;
  final String? notes;

  UpdateProfileDto({
    this.name,
    this.phone,
    this.address,
    this.avatarUrl,
    this.receiverName,
    this.addressLine,
    this.city,
    this.province,
    this.postalCode,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
    if (name != null && name!.isNotEmpty) 'name': name,
    if (phone != null) 'phone': phone,
    if (address != null) 'address': address,
    if (avatarUrl != null && avatarUrl!.isNotEmpty) 'avatarUrl': avatarUrl,
    if (receiverName != null && receiverName!.isNotEmpty)
      'receiverName': receiverName,
    if (addressLine != null && addressLine!.isNotEmpty)
      'addressLine': addressLine,
    if (city != null && city!.isNotEmpty) 'city': city,
    if (province != null && province!.isNotEmpty) 'province': province,
    if (postalCode != null && postalCode!.isNotEmpty) 'postalCode': postalCode,
    if (notes != null && notes!.isNotEmpty) 'notes': notes,
  };
}
