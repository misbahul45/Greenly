class ProfileDetailData {
  final String fullName;
  final String? phone;
  final String? address;
  final String? avatarUrl;
  final String? receiverName;
  final String? addressLine;
  final String? city;
  final String? province;
  final String? postalCode;
  final String? notes;

  const ProfileDetailData({
    required this.fullName,
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

  factory ProfileDetailData.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] is Map<String, dynamic>
        ? json['profile'] as Map<String, dynamic>
        : json;

    final parsedAddress = ProfileAddressData.fromAddressString(
      profile['address']?.toString(),
      fallbackReceiverName: profile['fullName']?.toString(),
      fallbackPhone: (profile['phoneNumber'] ?? profile['phone'])?.toString(),
    );

    return ProfileDetailData(
      fullName: profile['fullName']?.toString() ?? '',
      phone: (profile['phoneNumber'] ?? profile['phone'])?.toString(),
      address: profile['address']?.toString(),
      avatarUrl: profile['avatarUrl']?.toString(),
      receiverName:
          (profile['receiverName'] ?? profile['recipientName'])?.toString() ??
          parsedAddress.receiverName,
      addressLine:
          (profile['addressLine'] ?? profile['streetAddress'])?.toString() ??
          parsedAddress.addressLine,
      city: profile['city']?.toString() ?? parsedAddress.city,
      province: profile['province']?.toString() ?? parsedAddress.province,
      postalCode:
          (profile['postalCode'] ?? profile['zipCode'])?.toString() ??
          parsedAddress.postalCode,
      notes: profile['notes']?.toString() ?? parsedAddress.notes,
    );
  }

  ProfileAddressData get addressData {
    return ProfileAddressData(
      receiverName: receiverName,
      phone: phone,
      addressLine: addressLine,
      city: city,
      province: province,
      postalCode: postalCode,
      notes: notes,
    );
  }
}

class ProfileAddressData {
  final String? receiverName;
  final String? phone;
  final String? addressLine;
  final String? city;
  final String? province;
  final String? postalCode;
  final String? notes;

  const ProfileAddressData({
    this.receiverName,
    this.phone,
    this.addressLine,
    this.city,
    this.province,
    this.postalCode,
    this.notes,
  });

  bool get isEmpty {
    return [
      receiverName,
      phone,
      addressLine,
      city,
      province,
      postalCode,
      notes,
    ].every((value) => value == null || value.trim().isEmpty);
  }

  bool get hasStructuredAddress {
    return [
      receiverName,
      phone,
      addressLine,
      city,
      province,
      postalCode,
    ].any((value) => value != null && value.trim().isNotEmpty);
  }

  String get composed {
    final primary = [
      receiverName,
      phone,
    ].where((value) => value != null && value.trim().isNotEmpty).join(' · ');

    final location = [
      addressLine,
      city,
      province,
      postalCode,
    ].where((value) => value != null && value.trim().isNotEmpty).join(', ');

    final parts = [
      primary,
      location,
      if (notes != null && notes!.trim().isNotEmpty)
        'Catatan: ${notes!.trim()}',
    ].where((value) => value.trim().isNotEmpty).toList();

    return parts.join('\n');
  }

  static ProfileAddressData fromAddressString(
    String? address, {
    String? fallbackReceiverName,
    String? fallbackPhone,
  }) {
    final raw = address?.trim();
    if (raw == null || raw.isEmpty) {
      return ProfileAddressData(
        receiverName: fallbackReceiverName,
        phone: fallbackPhone,
      );
    }

    final lines = raw.split('\n').map((line) => line.trim()).toList();
    String? receiverName = fallbackReceiverName;
    String? phone = fallbackPhone;
    String? addressLine;
    String? city;
    String? province;
    String? postalCode;
    String? notes;

    if (lines.isNotEmpty && lines.first.contains(' · ')) {
      final first = lines.first.split(' · ');
      receiverName = first.isNotEmpty ? first.first.trim() : receiverName;
      phone = first.length > 1 ? first[1].trim() : phone;
      if (lines.length > 1) {
        final parts = lines[1].split(',').map((part) => part.trim()).toList();
        addressLine = parts.isNotEmpty ? parts[0] : null;
        city = parts.length > 1 ? parts[1] : null;
        province = parts.length > 2 ? parts[2] : null;
        postalCode = parts.length > 3 ? parts[3] : null;
      }
      if (lines.length > 2 && lines[2].startsWith('Catatan:')) {
        notes = lines[2].replaceFirst('Catatan:', '').trim();
      }
    } else {
      addressLine = raw;
    }

    return ProfileAddressData(
      receiverName: receiverName,
      phone: phone,
      addressLine: addressLine,
      city: city,
      province: province,
      postalCode: postalCode,
      notes: notes,
    );
  }
}
