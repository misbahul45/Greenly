class VerifyPasswordResponse {
  final String id;
  final String userId;
  final String tokenHash;
  final String type;
  final DateTime expiresAt;
  final DateTime? usedAt;
  final DateTime createdAt;

  VerifyPasswordResponse({
    required this.id,
    required this.userId,
    required this.tokenHash,
    required this.type,
    required this.expiresAt,
    required this.usedAt,
    required this.createdAt,
  });

  factory VerifyPasswordResponse.fromJson(Map<String, dynamic> json) {
    return VerifyPasswordResponse(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      tokenHash: json['tokenHash'] ?? '',
      type: json['type'] ?? '',
      expiresAt: DateTime.parse(json['expiresAt']),
      usedAt: json['usedAt'] != null
          ? DateTime.parse(json['usedAt'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}