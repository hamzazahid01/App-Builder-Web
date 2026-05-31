import 'dart:convert';
import 'component.dart';
import 'page.dart';

class SplashScreen {
  bool enabled;
  String backgroundColor;
  String logoImage;
  String titleText;
  int duration;
  String? nextScreenId;

  SplashScreen({
    this.enabled = true,
    this.backgroundColor = '#111827',
    this.logoImage = 'https://placehold.co/120x120',
    this.titleText = 'Welcome',
    this.duration = 2,
    this.nextScreenId,
  });

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'backgroundColor': backgroundColor,
      'logoImage': logoImage,
      'titleText': titleText,
      'duration': duration,
      if (nextScreenId != null) 'nextScreenId': nextScreenId,
    };
  }

  factory SplashScreen.fromJson(Map<String, dynamic> json) {
    return SplashScreen(
      enabled: json['enabled'] as bool? ?? true,
      backgroundColor: json['backgroundColor'] as String? ?? '#111827',
      logoImage: json['logoImage'] as String? ?? 'https://placehold.co/120x120',
      titleText: json['titleText'] as String? ?? 'Welcome',
      duration: json['duration'] as int? ?? 2,
      nextScreenId: json['nextScreenId'] as String?,
    );
  }
}

class AppData {
  String appName;
  String theme;
  String primaryColor;
  String fontFamily;
  String baseDevice;
  SplashScreen splashScreen;
  List<Page> pages;
  List<dynamic> pageGroups;
  bool pagePanelCollapsed;
  String? currentPageId;
  String? initialPageId;
  List<String> navigationStack;

  AppData({
    this.appName = 'My No-Code App',
    this.theme = 'light',
    this.primaryColor = '#2563eb',
    this.fontFamily = 'Inter',
    this.baseDevice = 'iphone-14',
    SplashScreen? splashScreen,
    this.pages = const [],
    this.pageGroups = const [],
    this.pagePanelCollapsed = false,
    this.currentPageId,
    this.initialPageId,
    this.navigationStack = const [],
  }) : splashScreen = splashScreen ?? SplashScreen();

  Map<String, dynamic> toJson() {
    return {
      'appName': appName,
      'theme': theme,
      'primaryColor': primaryColor,
      'fontFamily': fontFamily,
      'baseDevice': baseDevice,
      'splashScreen': splashScreen.toJson(),
      'pages': pages.map((p) => p.toJson()).toList(),
      'pageGroups': pageGroups,
      'pagePanelCollapsed': pagePanelCollapsed,
      if (currentPageId != null) 'currentPageId': currentPageId,
      if (initialPageId != null) 'initialPageId': initialPageId,
      'navigationStack': navigationStack,
    };
  }

  factory AppData.fromJson(Map<String, dynamic> json) {
    return AppData(
      appName: json['appName'] as String? ?? 'My No-Code App',
      theme: json['theme'] as String? ?? 'light',
      primaryColor: json['primaryColor'] as String? ?? '#2563eb',
      fontFamily: json['fontFamily'] as String? ?? 'Inter',
      baseDevice: json['baseDevice'] as String? ?? 'iphone-14',
      splashScreen: json['splashScreen'] != null
          ? SplashScreen.fromJson(json['splashScreen'])
          : null,
      pages: (json['pages'] as List?)
              ?.map((p) => Page.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      pageGroups: json['pageGroups'] as List? ?? [],
      pagePanelCollapsed: json['pagePanelCollapsed'] as bool? ?? false,
      currentPageId: json['currentPageId'] as String?,
      initialPageId: json['initialPageId'] as String?,
      navigationStack: (json['navigationStack'] as List?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}

class History {
  List<AppData> past;
  List<AppData> future;
  int max;
  String watcherLastHash;
  bool isApplying;

  History({
    this.past = const [],
    this.future = const [],
    this.max = 60,
    this.watcherLastHash = '',
    this.isApplying = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'past': past.map((a) => a.toJson()).toList(),
      'future': future.map((a) => a.toJson()).toList(),
      'max': max,
      'watcherLastHash': watcherLastHash,
      'isApplying': isApplying,
    };
  }

  factory History.fromJson(Map<String, dynamic> json) {
    return History(
      past: (json['past'] as List?)
              ?.map((a) => AppData.fromJson(a as Map<String, dynamic>))
              .toList() ??
          [],
      future: (json['future'] as List?)
              ?.map((a) => AppData.fromJson(a as Map<String, dynamic>))
              .toList() ??
          [],
      max: json['max'] as int? ?? 60,
      watcherLastHash: json['watcherLastHash'] as String? ?? '',
      isApplying: json['isApplying'] as bool? ?? false,
    );
  }
}

class DeviceInfo {
  double width;
  double height;
  String label;

  DeviceInfo({
    required this.width,
    required this.height,
    required this.label,
  });

  Map<String, dynamic> toJson() {
    return {
      'width': width,
      'height': height,
      'label': label,
    };
  }

  factory DeviceInfo.fromJson(Map<String, dynamic> json) {
    return DeviceInfo(
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
      label: json['label'] as String,
    );
  }
}

class AppState {
  AppData app;
  String? selectedId;
  String selectedType;
  String? draggedNodeId;
  int suppressCanvasClickUntil;
  Component? clipboard;
  double previewZoom;
  bool snapToGrid;
  bool snapEnabled;
  String currentDeviceKey;
  bool runtimeMode;
  String? runtimeSplashTimer;
  String runtimeScreen;
  History history;
  Map<String, DeviceInfo> deviceMap;

  AppState({
    AppData? app,
    this.selectedId,
    this.selectedType = 'none',
    this.draggedNodeId,
    this.suppressCanvasClickUntil = 0,
    this.clipboard,
    this.previewZoom = 1.0,
    this.snapToGrid = true,
    this.snapEnabled = true,
    this.currentDeviceKey = 'iphone-14',
    this.runtimeMode = false,
    this.runtimeSplashTimer,
    this.runtimeScreen = 'page',
    History? history,
    Map<String, DeviceInfo>? deviceMap,
  })  : app = app ?? AppData(),
        history = history ?? History(),
        deviceMap = deviceMap ?? _defaultDeviceMap();

  static Map<String, DeviceInfo> _defaultDeviceMap() {
    return {
      'iphone-se': DeviceInfo(width: 320, height: 568, label: 'iPhone SE'),
      'iphone-8': DeviceInfo(width: 375, height: 667, label: 'iPhone 8 / SE2'),
      'iphone-x': DeviceInfo(width: 375, height: 812, label: 'iPhone X / 11 Pro'),
      'iphone-12': DeviceInfo(width: 390, height: 844, label: 'iPhone 12 / 13'),
      'iphone-14': DeviceInfo(width: 390, height: 844, label: 'iPhone 14'),
      'iphone-14-plus': DeviceInfo(width: 428, height: 926, label: 'iPhone 14 Plus'),
      'iphone-14-pro': DeviceInfo(width: 393, height: 852, label: 'iPhone 14 Pro'),
      'iphone-14-pro-max': DeviceInfo(width: 430, height: 932, label: 'iPhone 14 Pro Max'),
      'iphone-15': DeviceInfo(width: 393, height: 852, label: 'iPhone 15'),
      'iphone-15-pro-max': DeviceInfo(width: 430, height: 932, label: 'iPhone 15 Pro Max'),
      'iphone-16-pro': DeviceInfo(width: 402, height: 874, label: 'iPhone 16 Pro'),
      'pixel-5': DeviceInfo(width: 393, height: 851, label: 'Pixel 5'),
      'pixel-7': DeviceInfo(width: 412, height: 915, label: 'Pixel 7 / 8'),
      'pixel-8-pro': DeviceInfo(width: 448, height: 998, label: 'Pixel 8 Pro'),
      'galaxy-s21': DeviceInfo(width: 360, height: 800, label: 'Galaxy S21'),
      'galaxy-s23': DeviceInfo(width: 360, height: 780, label: 'Galaxy S23'),
      'galaxy-s24': DeviceInfo(width: 360, height: 780, label: 'Galaxy S24'),
      'galaxy-s24-ultra': DeviceInfo(width: 384, height: 824, label: 'Galaxy S24 Ultra'),
      'galaxy-z-fold': DeviceInfo(width: 344, height: 882, label: 'Galaxy Z Fold (cover)'),
      'ipad-mini': DeviceInfo(width: 744, height: 1133, label: 'iPad Mini'),
      'ipad-air': DeviceInfo(width: 820, height: 1180, label: 'iPad Air'),
      'ipad-pro-11': DeviceInfo(width: 834, height: 1194, label: 'iPad Pro 11"'),
      'ipad-pro-12': DeviceInfo(width: 1024, height: 1366, label: 'iPad Pro 12.9"'),
      'android-small': DeviceInfo(width: 360, height: 640, label: 'Android Small'),
      'android-medium': DeviceInfo(width: 384, height: 854, label: 'Android Medium'),
      'android-large': DeviceInfo(width: 412, height: 915, label: 'Android Large'),
      'desktop-small': DeviceInfo(width: 1280, height: 720, label: 'Desktop 720p'),
      'desktop-medium': DeviceInfo(width: 1920, height: 1080, label: 'Desktop 1080p'),
      'desktop-large': DeviceInfo(width: 2560, height: 1440, label: 'Desktop 1440p'),
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'app': app.toJson(),
      if (selectedId != null) 'selectedId': selectedId,
      'selectedType': selectedType,
      if (draggedNodeId != null) 'draggedNodeId': draggedNodeId,
      'suppressCanvasClickUntil': suppressCanvasClickUntil,
      if (clipboard != null) 'clipboard': clipboard!.toJson(),
      'previewZoom': previewZoom,
      'snapToGrid': snapToGrid,
      'snapEnabled': snapEnabled,
      'currentDeviceKey': currentDeviceKey,
      'runtimeMode': runtimeMode,
      if (runtimeSplashTimer != null) 'runtimeSplashTimer': runtimeSplashTimer,
      'runtimeScreen': runtimeScreen,
      'history': history.toJson(),
      'deviceMap': deviceMap.map((k, v) => MapEntry(k, v.toJson())),
    };
  }

  factory AppState.fromJson(Map<String, dynamic> json) {
    return AppState(
      app: json['app'] != null ? AppData.fromJson(json['app']) : null,
      selectedId: json['selectedId'] as String?,
      selectedType: json['selectedType'] as String? ?? 'none',
      draggedNodeId: json['draggedNodeId'] as String?,
      suppressCanvasClickUntil: json['suppressCanvasClickUntil'] as int? ?? 0,
      clipboard: json['clipboard'] != null
          ? Component.fromJson(json['clipboard'])
          : null,
      previewZoom: (json['previewZoom'] as num?)?.toDouble() ?? 1.0,
      snapToGrid: json['snapToGrid'] as bool? ?? true,
      snapEnabled: json['snapEnabled'] as bool? ?? true,
      currentDeviceKey: json['currentDeviceKey'] as String? ?? 'iphone-14',
      runtimeMode: json['runtimeMode'] as bool? ?? false,
      runtimeSplashTimer: json['runtimeSplashTimer'] as String?,
      runtimeScreen: json['runtimeScreen'] as String? ?? 'page',
      history: json['history'] != null ? History.fromJson(json['history']) : null,
      deviceMap: (json['deviceMap'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, DeviceInfo.fromJson(v)),
          ),
    );
  }

  String toJsonString() {
    return jsonEncode(toJson());
  }

  factory AppState.fromJsonString(String jsonString) {
    return AppState.fromJson(jsonDecode(jsonString));
  }

  String appHash() {
    return jsonEncode(app.toJson());
  }
}
