import 'component.dart';

class AppBarConfig {
  bool enabled;
  String title;
  String backgroundColor;
  String textColor;

  AppBarConfig({
    this.enabled = true,
    this.title = '',
    this.backgroundColor = '#ffffff',
    this.textColor = '#0f172a',
  });

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'title': title,
      'backgroundColor': backgroundColor,
      'textColor': textColor,
    };
  }

  factory AppBarConfig.fromJson(Map<String, dynamic> json) {
    return AppBarConfig(
      enabled: json['enabled'] as bool? ?? true,
      title: json['title'] as String? ?? '',
      backgroundColor: json['backgroundColor'] as String? ?? '#ffffff',
      textColor: json['textColor'] as String? ?? '#0f172a',
    );
  }
}

class PageLayout {
  Map<String, double> padding;
  String alignment;
  String scrollBehavior;
  bool safeArea;

  PageLayout({
    Map<String, double>? padding,
    this.alignment = 'top',
    this.scrollBehavior = 'scroll',
    this.safeArea = true,
  }) : padding = padding ?? {'top': 12, 'right': 12, 'bottom': 12, 'left': 12};

  Map<String, dynamic> toJson() {
    return {
      'padding': padding,
      'alignment': alignment,
      'scrollBehavior': scrollBehavior,
      'safeArea': safeArea,
    };
  }

  factory PageLayout.fromJson(Map<String, dynamic> json) {
    return PageLayout(
      padding: (json['padding'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, (v as num).toDouble()),
          ),
      alignment: json['alignment'] as String? ?? 'top',
      scrollBehavior: json['scrollBehavior'] as String? ?? 'scroll',
      safeArea: json['safeArea'] as bool? ?? true,
    );
  }
}

class Page {
  String id;
  String name;
  List<Component> components;
  String backgroundColor;
  String backgroundType;
  String gradientStart;
  String gradientEnd;
  String gradientDirection;
  String backgroundImage;
  String? backgroundImageData;
  String backgroundFit;
  double backgroundOpacity;
  String backgroundFadeColor;
  int backgroundBlur;
  String orientation;
  bool safeAreaPadding;
  bool scroll;
  bool scrollbarVisible;
  AppBarConfig appBar;
  PageLayout layout;

  Page({
    required this.id,
    required this.name,
    this.components = const [],
    this.backgroundColor = '#f8fafc',
    this.backgroundType = 'solid',
    this.gradientStart = '#2563eb',
    this.gradientEnd = '#7c3aed',
    this.gradientDirection = 'horizontal',
    this.backgroundImage = '',
    this.backgroundImageData,
    this.backgroundFit = 'cover',
    this.backgroundOpacity = 1.0,
    this.backgroundFadeColor = '#ffffff',
    this.backgroundBlur = 0,
    this.orientation = 'portrait',
    this.safeAreaPadding = true,
    this.scroll = true,
    this.scrollbarVisible = true,
    AppBarConfig? appBar,
    PageLayout? layout,
  })  : appBar = appBar ?? AppBarConfig(title: name),
        layout = layout ?? PageLayout();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'components': components.map((c) => c.toJson()).toList(),
      'backgroundColor': backgroundColor,
      'backgroundType': backgroundType,
      'gradientStart': gradientStart,
      'gradientEnd': gradientEnd,
      'gradientDirection': gradientDirection,
      'backgroundImage': backgroundImage,
      if (backgroundImageData != null) 'backgroundImageData': backgroundImageData,
      'backgroundFit': backgroundFit,
      'backgroundOpacity': backgroundOpacity,
      'backgroundFadeColor': backgroundFadeColor,
      'backgroundBlur': backgroundBlur,
      'orientation': orientation,
      'safeAreaPadding': safeAreaPadding,
      'scroll': scroll,
      'scrollbarVisible': scrollbarVisible,
      'appBar': appBar.toJson(),
      'layout': layout.toJson(),
    };
  }

  factory Page.fromJson(Map<String, dynamic> json) {
    return Page(
      id: json['id'] as String,
      name: json['name'] as String,
      components: (json['components'] as List?)
              ?.map((c) => Component.fromJson(c as Map<String, dynamic>))
              .toList() ??
          [],
      backgroundColor: json['backgroundColor'] as String? ?? '#f8fafc',
      backgroundType: json['backgroundType'] as String? ?? 'solid',
      gradientStart: json['gradientStart'] as String? ?? '#2563eb',
      gradientEnd: json['gradientEnd'] as String? ?? '#7c3aed',
      gradientDirection: json['gradientDirection'] as String? ?? 'horizontal',
      backgroundImage: json['backgroundImage'] as String? ?? '',
      backgroundImageData: json['backgroundImageData'] as String?,
      backgroundFit: json['backgroundFit'] as String? ?? 'cover',
      backgroundOpacity: (json['backgroundOpacity'] as num?)?.toDouble() ?? 1.0,
      backgroundFadeColor: json['backgroundFadeColor'] as String? ?? '#ffffff',
      backgroundBlur: json['backgroundBlur'] as int? ?? 0,
      orientation: json['orientation'] as String? ?? 'portrait',
      safeAreaPadding: json['safeAreaPadding'] as bool? ?? true,
      scroll: json['scroll'] as bool? ?? true,
      scrollbarVisible: json['scrollbarVisible'] as bool? ?? true,
      appBar: json['appBar'] != null
          ? AppBarConfig.fromJson(json['appBar'])
          : null,
      layout: json['layout'] != null ? PageLayout.fromJson(json['layout']) : null,
    );
  }
}
