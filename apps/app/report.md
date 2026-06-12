# Mobile Flutter UI Audit Report

## 1. Executive Summary

Audit hanya mencakup `apps/app`. Mobile app sudah punya pondasi cukup baik: feature folder, `flutter_bloc`, API client terpusat, skeleton widget, beberapa empty/error state, dan flow utama auth, home, search, product, cart, checkout, order, chat, profile sudah sebagian besar tersambung API.

Risiko terbesar:

1. Auth state bug: `AuthCheckRequested` menghapus storage sebelum membaca token.
2. Route argument crash risk pada beberapa route utama.
3. Product detail punya tombol "Beli Sekarang" yang belum connect flow checkout.
4. Search fallback catalog tidak menerapkan filter.
5. Cart remove/clear mengabaikan error backend.
6. `.env` wajib asset tapi file tidak ada, sehingga `flutter analyze` dan `flutter test` gagal.
7. Test mobile masih template counter dan tidak relevan.

## 2. Mobile App Structure

| Path | Fungsi | Status | Catatan |
|---|---|---:|---|
| `apps/app/lib/main.dart` | Entry point, DI global, BlocProvider | Partial | Global providers hanya sebagian service/bloc |
| `apps/app/lib/core/router` | Named routing manual | Risk | Beberapa cast argumen langsung |
| `apps/app/lib/core/theme` | Theme dasar | Partial | Belum ada full design token typography/button/card state |
| `apps/app/lib/core/utils/api_client.dart` | HTTP, refresh token, stream | Partial | Stream error diam-diam, parser SSE swallow error |
| `apps/app/lib/features` | Feature modules | Partial | Konsisten sebagian, ada `Main`, `product-detail`, `ml-products`, typo `respon` |
| `apps/app/lib/shared/widgets` | Shared UI | Good | Skeleton/product/category cukup reusable |
| `apps/app/test` | Test | Weak | Hanya template counter |

## 3. Flutter Stack

Flutter: 3.44.1 stable. Dart: 3.12.1. Package utama: `flutter_bloc`, `http`, `flutter_dotenv`, `flutter_secure_storage`, `shared_preferences`, `intl`, `url_launcher`, `webview_flutter`, `fl_chart`. Routing memakai `MaterialApp` + `onGenerateRoute`, bukan declarative routing. API client manual berbasis `http.Request`. Theme utama ada di `AppTheme.lightTheme`.

## 4. UI Architecture Review

Struktur feature-based sudah ada, tetapi belum konsisten. Beberapa screen terlalu besar: `cart_screen.dart` 750 baris, `chat_screen.dart` 560 baris, `product_detail_screen.dart` 484 baris, `search_product_screen.dart` 430 baris, `home_screen.dart` 411 baris. Logic API masih muncul langsung di UI pada `ChatScreen`, `NotificationScreen`, `EditProfileScreen`, `AddressSectionWidget`, dan checkout bottom sheet. Shared widget sudah baik untuk product/category/skeleton, tetapi empty/error/retry widget belum distandarkan.

## 5. Navigation Findings

| File/path | Problem | Impact | Severity | Recommendation |
|---|---|---|---:|---|
| `core/router/router_generate.dart:97` | `settings.arguments as String` untuk product detail | Crash jika argumen null/wrong type | High | Guard argument seperti payment/shop |
| `core/router/router_generate.dart:107` | `settings.arguments as String` untuk order detail | Crash route order | High | Validate `orderId` |
| `core/router/router_generate.dart:161` | `settings.arguments as Map<String,dynamic>` untuk reviews | Crash jika argumen tidak lengkap | High | Safe map parsing |
| `core/router/app_routes.dart` | `notifications`, `settings` tidak ada case router | Route action/deep link bisa Page Not Found | Medium | Tambah route atau hapus constant jika tidak dipakai |
| `product-detail/product_detail_screen.dart:116` | Back memaksa ke `/main` dan clear stack | UX rusak dari search/favorite/order | Medium | Pakai `Navigator.pop` bila bisa pop |

## 6. Screen-by-Screen Findings

| Screen | File/path | Problem | Impact | Severity | Recommendation |
|---|---|---|---|---:|---|
| Splash | `onboarding/.../splash_screen.dart` | Auth check langsung token, tidak validasi refresh/user | Token stale tetap masuk main | Medium | Dispatch auth check yang benar |
| Login | `auth/.../login_screen.dart` | Error verify email dideteksi via string message | Fragile terhadap perubahan backend | Medium | Pakai status/code khusus |
| Register | `auth/.../register_screen.dart` | API langsung dari screen, bukan Bloc | State flow auth tidak konsisten | Medium | Pindahkan ke AuthBloc bertahap |
| Verify Email | `auth/.../verify_email_screen.dart` | Route args email/type tidak dipakai oleh form | Resend butuh input ulang | Medium | Prefill email dari args/state |
| Forgot Password | `auth/.../forgot_password_screen.dart` | Navigasi raw string | Mudah typo/broken route | Low | Pakai `AuthRoutes` |
| Change Password | `auth/.../bloc/auth_bloc.dart:200` | Gagal API tidak emit error | UI bisa stuck loading/token state hilang | High | Emit `AuthError` |
| Home | `Main/features/home/home_screen.dart` | Semua fetch dipicu init, global error dipakai lintas section | Error category/product bisa salah tampil | Medium | State error per section |
| Product Grid | `home/widgets/product_grid.dart` | Fixed 2 kolom aspect 0.55 | Tablet/narrow layout buruk | Medium | Adaptive max cross-axis extent |
| Search | `search-product/service/search_product_service.dart:40` | Fallback tidak pakai filter | UI filter menipu user | High | Kirim query filter ke catalog |
| Product Detail | `product-detail/product_detail_screen.dart:402` | "Beli Sekarang" hanya snackbar | Main commerce flow belum jalan | High | Connect add-to-cart + checkout sheet |
| Shop Detail | `shop/.../shop_detail_screen.dart` | Product grid fixed 2 kolom, no loading more footer | UX pagination kurang jelas | Medium | Adaptive sliver grid + footer |
| Cart | `cart/presentation/screens/cart_screen.dart` | Checkout logic besar di UI | Sulit test dan rawan regression | Medium | Extract checkout controller/bloc small |
| Cart Bloc | `cart/presentation/bloc/cart_bloc.dart:77` | Remove item ignore error | UI/server bisa diverge | High | Check response, emit error, reload only on success |
| Order List | `order/.../order_list_screen.dart` | Pull refresh async tidak menunggu state selesai | Refresh indicator bisa selesai terlalu cepat | Low | Await bloc completion pattern |
| Order Detail | `order/.../order_detail_screen.dart` | Product rows tanpa image/status timeline | UX detail minim | Low | Tambah timeline bertahap |
| Payment WebView | `order/.../payment_webview_screen.dart` | Tidak handle `onWebResourceError` | Blank/freeze saat WebView gagal | High | Tambah error state + retry/open external |
| Notification | `notification_screen.dart:35` | `setState` setelah await tanpa `mounted` | Potensi setState after dispose | High | Guard `if (!mounted) return` |
| Chat List | `chat_list_screen.dart` | FutureBuilder + setState `_error` bercampur | State sulit diprediksi | Medium | Bloc/Cubit atau Future state object |
| Chat | `chat_screen.dart` | API + realtime + optimistic UI dalam screen besar | Sulit test, race risk | Medium | Extract ChatCubit |
| Profile | `profile_service.dart:41` | Error stats ditelan jadi 0 | UI menyamarkan API failure | Medium | Return error/partial state |
| Edit Profile | `edit_profile_screen.dart` | Avatar URL manual, bukan upload/picker | UX update foto lemah | Low | Tambah picker/upload setelah API siap |

## 7. Responsive Layout Findings

Hardcoded/fixed-grid risk ditemukan di `ProductGrid`, `ProductListScreen`, `ShopDetailScreen`, `FavoriteScreen`, `CategoryGrid`. Banyak form sudah memakai `SingleChildScrollView` dan `SafeArea`, bagus untuk keyboard. Bottom sheet checkout sudah memakai `viewInsets.bottom`, bagus. Risiko utama: product grid fixed 2 column, chat bubble max width `0.78` memakai full screen width, OTP field fixed width 50 per digit berpotensi sempit di small screen.

## 8. Design System Findings

Theme dasar ada, tetapi banyak screen masih langsung memakai `Colors.white`, `Colors.grey`, `Colors.red`, fontSize literal, radius literal. `UIConstants` membantu spacing, tapi belum ada semantic tokens untuk success/warning/error/surface, text styles, button variants, empty/error widgets. Dark mode belum ditemukan di repository. Skeleton sudah cukup konsisten.

## 9. API to UI Mapping Findings

| File/path | Problem | Impact | Severity | Recommendation |
|---|---|---|---:|---|
| `pubspec.yaml:71` | `.env` asset wajib tapi file tidak ada | Analyze/test/build asset gagal | High | Commit safe `.env` dev atau ubah loading strategy |
| `api_client.dart:345` | SSE status non-2xx hanya `return` | Chat/notif realtime gagal tanpa error UI | Medium | Yield error/result atau callback error |
| `search_product_service.dart:38` | ML error ditelan | User tidak tahu fallback dipakai | Low | Expose fallback banner/chip |
| `ReviewData.fromJson` | Direct `DateTime.parse`, direct field cast | Crash jika response null/format beda | Medium | Defensive parser + unit test |
| `CartService._enrichItems` | N request produk per cart item | Slow cart besar | Medium | Backend include product snapshot atau batch endpoint |

## 10. State Management Findings

BLoC dipakai pada auth/home/cart/order/search/shop/favorite/profile. Masalah utama: event dipanggil dari builder pada `product_detail_screen.dart:203`, optimistic follow reset follower count ke `shop.followerCount` bukan current state pada failure, favorite list langsung request ulang setelah toggle tanpa menunggu toggle selesai, dan beberapa screen state masih manual `setState` untuk API async.

## 11. Performance Findings

Grid besar memakai `GridView.builder`, itu baik. Risiko: cart enrichment per item, `IndexedStack` menyimpan Home/Notification/Chat/Profile aktif sekaligus (`MainScreen:31`) sehingga notification/chat stream bisa tetap hidup ketika tab tidak aktif, product detail membuat bloc HomeBloc baru untuk related product dan bisa fetch list tambahan, image network belum pakai cache package khusus, chat list/messages limit 50 tanpa pagination UI.

## 12. Accessibility and UX Findings

Tap target mostly cukup karena `IconButton`/buttons. Masalah UX: snackbar dipakai untuk aksi penting tanpa state permanen, `Beli Sekarang` dummy, Payment WebView tanpa error/retry, empty state beberapa tidak punya CTA, error state notification hanya text tanpa retry, profile stats error menjadi angka 0, form OTP tidak prefill email, destructive clear cart sudah ada confirmation.

## 13. Mobile Testing Gap

| Area | Current test evidence | Missing test | Suggested test file | Priority |
|---|---|---|---|---:|
| App smoke | `test/widget_test.dart` counter template | Splash/auth routing smoke | `test/app_smoke_test.dart` | P0 |
| Routing args | Belum ada | Null/wrong args product/order/reviews | `test/router_generate_test.dart` | P0 |
| Auth | Belum ada | login, verify, forgot, change error | `test/features/auth/auth_bloc_test.dart` | P0 |
| Search | Belum ada | filter fallback query mapping | `test/features/search/search_product_service_test.dart` | P0 |
| Cart | Belum ada | remove error, checkout validation | `test/features/cart/cart_bloc_test.dart` | P0 |
| Payment | Belum ada | redirect/error/close behavior | `test/features/order/payment_webview_test.dart` | P1 |
| Product detail | Belum ada | loading/error/empty/favorite/add cart | `test/features/product/product_detail_test.dart` | P1 |
| Chat/Notification | Belum ada | realtime error/list empty/send fail | `test/features/chat/chat_screen_test.dart` | P1 |
| Integration | Belum ditemukan di repository | auth-search-cart-checkout-order | `integration_test/mobile_core_flow_test.dart` | P1 |

## 14. Top 20 Mobile UI Bugs/Risks

1. Title: `.env` missing breaks analyze/test/build asset. File: `pubspec.yaml:71`. Severity: High. Proposed fix: provide dev env or non-asset fallback. Acceptance criteria: `flutter analyze` and `flutter test` run. Test required: smoke/analyze.
2. Title: Product detail route can crash. File: `router_generate.dart:97`. Severity: High. Proposed fix: safe argument parsing. Acceptance criteria: invalid args show friendly screen. Test required: route arg test.
3. Title: Order detail route can crash. File: `router_generate.dart:107`. Severity: High. Proposed fix: safe parsing. Acceptance criteria: invalid order id does not crash. Test required: route arg test.
4. Title: Reviews route can crash. File: `router_generate.dart:161`. Severity: High. Proposed fix: validate map keys. Acceptance criteria: missing keys show fallback UI. Test required: route arg test.
5. Title: Auth check clears session. File: `auth_bloc.dart:133`. Severity: High. Proposed fix: remove `AuthStorage.clear()`. Acceptance criteria: stored token/user remains authenticated. Test required: auth bloc test.
6. Title: Change password failure not emitted. File: `auth_bloc.dart:200`. Severity: High. Proposed fix: emit `AuthError`. Acceptance criteria: API failure shows error and exits loading. Test required: auth bloc test.
7. Title: Search fallback ignores filters. File: `search_product_service.dart:40`. Severity: High. Proposed fix: map filters to catalog query. Acceptance criteria: fallback sends category/price/eco filter. Test required: service test.
8. Title: Buy Now dummy. File: `product_detail_screen.dart:402`. Severity: High. Proposed fix: connect add-to-cart + checkout path. Acceptance criteria: tap opens actual checkout/cart flow. Test required: widget/integration test.
9. Title: Cart remove ignores backend error. File: `cart_bloc.dart:77`. Severity: High. Proposed fix: inspect response. Acceptance criteria: failed remove preserves item and shows error. Test required: cart bloc test.
10. Title: Notification setState after dispose risk. File: `notification_screen.dart:35`. Severity: High. Proposed fix: mounted guard. Acceptance criteria: no setState after dispose. Test required: widget async test.
11. Title: Payment WebView no load error UI. File: `payment_webview_screen.dart`. Severity: High. Proposed fix: `onWebResourceError`. Acceptance criteria: web error shows retry/close state. Test required: widget test.
12. Title: Product back clears stack. File: `product_detail_screen.dart:116`. Severity: Medium. Proposed fix: normal pop. Acceptance criteria: user returns to source screen. Test required: navigation test.
13. Title: Event dispatched in build. File: `product_detail_screen.dart:203`. Severity: Medium. Proposed fix: trigger after product loaded listener/init. Acceptance criteria: no duplicate favorite check on rebuild. Test required: widget/bloc interaction test.
14. Title: Profile stats hide API failures. File: `profile_service.dart:41`. Severity: Medium. Proposed fix: partial error state. Acceptance criteria: API failure visible. Test required: service/bloc test.
15. Title: SSE errors silent. File: `api_client.dart:345`. Severity: Medium. Proposed fix: expose stream errors. Acceptance criteria: realtime failure can be shown/retried. Test required: api client stream test.
16. Title: Fixed 2-column product grids. File: multiple product grid screens. Severity: Medium. Proposed fix: adaptive grid. Acceptance criteria: small/large widths render without awkward sizing. Test required: responsive widget test.
17. Title: Cart enrichment N+1. File: `cart_service.dart:48`. Severity: Medium. Proposed fix: batch/include snapshot. Acceptance criteria: cart load avoids per-item serial UI pain. Test required: service test.
18. Title: Favorite toggle list reload race. File: `favorite_screen.dart:174`. Severity: Medium. Proposed fix: await/listen success then reload. Acceptance criteria: removed favorite updates predictably. Test required: bloc/widget test.
19. Title: Chat screen too stateful. File: `chat_screen.dart`. Severity: Medium. Proposed fix: ChatCubit. Acceptance criteria: loading/error/send/realtime state covered by tests. Test required: cubit/widget test.
20. Title: Test file invalid template. File: `test/widget_test.dart:14`. Severity: Medium. Proposed fix: replace with real app tests. Acceptance criteria: no counter assumptions. Test required: flutter test.

## 15. First 10 Safe PR Plan

| PR | Title | Goal | Files likely touched | Risk | Tests | Rollback |
|---:|---|---|---|---:|---|---|
| 1 | Fix mobile env/test bootstrap | Make analyze/test runnable | `pubspec.yaml`, `.env.example`, test setup | Low | analyze/test | revert env handling |
| 2 | Safe route arguments | Prevent navigation crashes | `router_generate.dart` | Low | router tests | revert route guards |
| 3 | Auth state fixes | Fix session/check/change error | `auth_bloc.dart` | Medium | auth bloc tests | revert auth bloc patch |
| 4 | Payment WebView error state | Avoid blank payment screen | `payment_webview_screen.dart` | Medium | widget test | revert screen only |
| 5 | Cart mutation error handling | Keep cart UI/server consistent | `cart_bloc.dart` | Medium | cart bloc tests | revert bloc patch |
| 6 | Search filter fallback | Correct filtered search | `search_product_service.dart` | Medium | service unit test | revert query map |
| 7 | Product detail CTA/back | Fix Buy Now/back UX | `product_detail_screen.dart` | Medium | widget test | revert screen patch |
| 8 | Notification mounted/retry | Remove dispose risk + retry | `notification_screen.dart` | Low | widget test | revert screen patch |
| 9 | Adaptive product grids | Reduce overflow/tablet issues | grid widgets/screens | Medium | golden/widget small widths | revert grid delegate |
| 10 | Shared empty/error widgets | Consistency without rewrite | `shared/widgets`, selected screens | Low | widget tests | revert shared widgets |

## 16. Quick Wins

- Gunakan `AuthRoutes`/`AppRoutes` menggantikan raw string.
- Tambahkan `mounted` guard di notification.
- Tambahkan route fallback safe screen untuk product/order/reviews.
- Hapus counter test template.
- Tambahkan retry button di notification error.
- Tambahkan `onWebResourceError` di WebView.

## 17. Clarifying Questions

1. Apakah mobile app memang harus menyertakan `.env` lokal sebagai asset, atau lebih baik memakai `--dart-define`/flavor config?
2. Untuk "Beli Sekarang", flow yang diinginkan langsung checkout current product atau add to cart lalu buka cart?
3. Apakah search catalog endpoint mendukung filter `categoryId`, `minPrice`, `maxPrice`, `minEcoScore`?
4. Apakah payment success/cancel URL sudah distandarkan dari backend?
5. Apakah chat/notification realtime wajib tetap aktif saat tab tidak terlihat?

## 18. Final Recommendation

Urutan paling aman: PR 1 sampai PR 3 dulu karena memulihkan verifikasi dan mencegah crash/session bug. Setelah itu PR 4 sampai PR 7 untuk flow commerce utama: payment, cart, search, product detail. Baru lanjut PR 8 sampai PR 10 untuk UX consistency, responsive grid, dan shared state widgets.

Saya belum mengubah kode aplikasi. Mau saya mulai dari PR mobile UI P0 nomor berapa?
