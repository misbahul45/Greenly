class AppBarConfig {
  final String title;
  final bool showSearch;
  final bool showCart;
  final bool showSetting;
  final bool showNotification;
  final bool showChat;

  const AppBarConfig({
    required this.title,
    this.showSearch = false,
    this.showCart = false,
    this.showSetting = false,
    this.showNotification = false,
    this.showChat = false,
  });
}

const List<AppBarConfig> mainAppBarConfigs = [
  AppBarConfig(
    title: 'Home',
    showSearch: true,
    showCart: true,
    showNotification: true,
    showChat: true,
  ),
  AppBarConfig(
    title: 'Notifikasi',
  ),
  AppBarConfig(
    title: 'Chat',
  ),
  AppBarConfig(
    title: 'Favorit',
    showCart: true,
  ),
  AppBarConfig(
    title: 'Akun',
    showCart: true,
    showSetting: true,
  ),
];