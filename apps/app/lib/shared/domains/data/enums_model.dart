enum ShopStatus {
  pending,
  approved,
  rejected,
  suspended,
}

enum PayoutStatus {
  pending,
  processing,
  completed,
  failed,
}

enum AuthTokenType {
  verifyEmail,
  resetPassword,
  refreshToken,
  deleteUser,
}

enum ApplicationStatus {
  pending,
  review,
  approved,
  rejected,
}

enum OrderStatus {
  pending,
  paid,
  processing,
  shipped,
  completed,
  cancelled,
}

enum PaymentStatus {
  pending,
  success,
  failed,
  expired,
}

enum RefundStatus {
  pending,
  approved,
  rejected,
  completed,
}

enum PromotionType {
  percentage,
  fixed,
}

enum LedgerType {
  credit,
  debit,
}

enum UserStatus {
  active,
  suspended,
  banned,
  pendingVerification,
}

enum BannerType {
  home,
  promo,
  event,
}

T enumFromString<T>(List<T> values, String value) {
  return values.firstWhere(
    (type) =>
        type.toString().split('.').last.toLowerCase() ==
        value.toLowerCase(),
  );
}