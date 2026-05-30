class AppConfig {
  // Canvas bounds
  static const double canvasMaxWidth = 350.0;
  static const double canvasMaxHeight = 750.0;

  // Grid settings
  static const double gridSize = 10.0;

  // Snap settings
  static const double snapThreshold = 10.0;

  // Zoom settings
  static const double minZoom = 0.5;
  static const double maxZoom = 2.0;
  static const double zoomStep = 0.1;

  // History settings
  static const int maxHistorySize = 60;

  // Component defaults
  static const double defaultComponentWidth = 100.0;
  static const double defaultComponentHeight = 40.0;
  static const double defaultComponentX = 12.0;
  static const double defaultComponentY = 12.0;

  // UI Colors
  static const String primaryColor = '0xFF8B5CF6';
  static const String backgroundColor = '0xFF0B1220';
  static const String surfaceColor = '0xFF070B16';
  static const String borderColor = '#ffffff';
  static const double borderOpacity = 0.08;

  // Typography
  static const double defaultFontSize = 14.0;
  static const String defaultFontWeight = 'normal';
}
