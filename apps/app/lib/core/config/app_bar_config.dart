class AppBarConfig {
  final String title;
  final bool showSearch;
  final bool showCart;
  final bool showSetting;
  final bool showFavorite;

  const AppBarConfig({
    required this.title,
    this.showSearch = false,
    this.showCart = false,
    this.showSetting = false,
    this.showFavorite = false,
  });
}

const List<AppBarConfig> mainAppBarConfigs = [
  AppBarConfig(
    title: 'Home',
    showSearch: true,
    showCart: true,
    showFavorite: true,
  ),
  AppBarConfig(
    title: 'Notifikasi',
  ),
  AppBarConfig(
    title: 'Chat',
    showCart: true,
  ),
  AppBarConfig(
    title: 'Akun',
    showCart: true,
    showSetting: true,
  ),
];