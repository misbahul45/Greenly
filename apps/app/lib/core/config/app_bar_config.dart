class AppBarConfig {
  final String title;
  final bool showSearch;
  final bool showCart;
  final bool showSetting;

  const AppBarConfig({
    required this.title,
    this.showSearch = false,
    this.showCart = false,
    this.showSetting = false,
  });
}


const List<AppBarConfig> mainAppBarConfigs = [
  AppBarConfig(
    title: "Home",
    showSearch: true,
    showCart: true,
  ),

  AppBarConfig(
    title: "Notifikasi",
  ),

  AppBarConfig(
    title: "Chat",
  ),

  AppBarConfig(
    title: "Favorite",
  ),

  AppBarConfig(
    title: "Account",
    showCart: true,
    showSetting: true,
  ),
];