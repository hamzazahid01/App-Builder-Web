class ComponentLayout {
  double x;
  double y;
  double width;
  double height;
  int zIndex;
  LayoutPercent? layoutPercent;
  String? createdOnDevice;
  ComponentConstraints? constraints;

  ComponentLayout({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.zIndex = 1,
    this.layoutPercent,
    this.createdOnDevice,
    this.constraints,
  });

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
      'width': width,
      'height': height,
      'zIndex': zIndex,
      if (layoutPercent != null) 'layoutPercent': layoutPercent!.toJson(),
      if (createdOnDevice != null) 'createdOnDevice': createdOnDevice,
      if (constraints != null) 'constraints': constraints!.toJson(),
    };
  }

  factory ComponentLayout.fromJson(Map<String, dynamic> json) {
    return ComponentLayout(
      x: (json['x'] as num).toDouble(),
      y: (json['y'] as num).toDouble(),
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
      zIndex: json['zIndex'] as int? ?? 1,
      layoutPercent: json['layoutPercent'] != null
          ? LayoutPercent.fromJson(json['layoutPercent'])
          : null,
      createdOnDevice: json['createdOnDevice'] as String?,
      constraints: json['constraints'] != null
          ? ComponentConstraints.fromJson(json['constraints'])
          : null,
    );
  }
}

class LayoutPercent {
  double x;
  double y;
  double width;
  double height;

  LayoutPercent({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
      'width': width,
      'height': height,
    };
  }

  factory LayoutPercent.fromJson(Map<String, dynamic> json) {
    return LayoutPercent(
      x: (json['x'] as num).toDouble(),
      y: (json['y'] as num).toDouble(),
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
    );
  }
}

class ComponentConstraints {
  bool pinLeft;
  bool pinRight;
  bool pinTop;
  bool pinBottom;
  bool fixedWidth;
  bool fixedHeight;
  bool centerX;
  bool centerY;

  ComponentConstraints({
    this.pinLeft = true,
    this.pinRight = false,
    this.pinTop = true,
    this.pinBottom = false,
    this.fixedWidth = true,
    this.fixedHeight = true,
    this.centerX = false,
    this.centerY = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'pinLeft': pinLeft,
      'pinRight': pinRight,
      'pinTop': pinTop,
      'pinBottom': pinBottom,
      'fixedWidth': fixedWidth,
      'fixedHeight': fixedHeight,
      'centerX': centerX,
      'centerY': centerY,
    };
  }

  factory ComponentConstraints.fromJson(Map<String, dynamic> json) {
    return ComponentConstraints(
      pinLeft: json['pinLeft'] as bool? ?? true,
      pinRight: json['pinRight'] as bool? ?? false,
      pinTop: json['pinTop'] as bool? ?? true,
      pinBottom: json['pinBottom'] as bool? ?? false,
      fixedWidth: json['fixedWidth'] as bool? ?? true,
      fixedHeight: json['fixedHeight'] as bool? ?? true,
      centerX: json['centerX'] as bool? ?? false,
      centerY: json['centerY'] as bool? ?? false,
    );
  }
}

class ComponentStyles {
  String? fontSize;
  String? color;
  String? backgroundColor;
  String? fontWeight;
  String? fontFamily;
  String? fontStyle;
  String? letterSpacing;
  String? lineHeight;
  String? textAlign;
  String? textDecoration;
  String? borderRadius;
  String? borderWidth;
  String? borderColor;
  String? opacity;

  ComponentStyles({
    this.fontSize,
    this.color,
    this.backgroundColor,
    this.fontWeight,
    this.fontFamily,
    this.fontStyle,
    this.letterSpacing,
    this.lineHeight,
    this.textAlign,
    this.textDecoration,
    this.borderRadius,
    this.borderWidth,
    this.borderColor,
    this.opacity,
  });

  Map<String, dynamic> toJson() {
    return {
      if (fontSize != null) 'fontSize': fontSize,
      if (color != null) 'color': color,
      if (backgroundColor != null) 'backgroundColor': backgroundColor,
      if (fontWeight != null) 'fontWeight': fontWeight,
      if (fontFamily != null) 'fontFamily': fontFamily,
      if (fontStyle != null) 'fontStyle': fontStyle,
      if (letterSpacing != null) 'letterSpacing': letterSpacing,
      if (lineHeight != null) 'lineHeight': lineHeight,
      if (textAlign != null) 'textAlign': textAlign,
      if (textDecoration != null) 'textDecoration': textDecoration,
      if (borderRadius != null) 'borderRadius': borderRadius,
      if (borderWidth != null) 'borderWidth': borderWidth,
      if (borderColor != null) 'borderColor': borderColor,
      if (opacity != null) 'opacity': opacity,
    };
  }

  factory ComponentStyles.fromJson(Map<String, dynamic> json) {
    return ComponentStyles(
      fontSize: json['fontSize'] as String?,
      color: json['color'] as String?,
      backgroundColor: json['backgroundColor'] as String?,
      fontWeight: json['fontWeight'] as String?,
      fontFamily: json['fontFamily'] as String?,
      fontStyle: json['fontStyle'] as String?,
      letterSpacing: json['letterSpacing'] as String?,
      lineHeight: json['lineHeight'] as String?,
      textAlign: json['textAlign'] as String?,
      textDecoration: json['textDecoration'] as String?,
      borderRadius: json['borderRadius'] as String?,
      borderWidth: json['borderWidth'] as String?,
      borderColor: json['borderColor'] as String?,
      opacity: json['opacity'] as String?,
    );
  }
}

class Component {
  String id;
  String type;
  ComponentLayout? layout;
  ComponentStyles? styles;
  Map<String, dynamic>? props;
  List<Component>? children;
  ComponentStyles? originalStyles;

  Component({
    required this.id,
    required this.type,
    this.layout,
    this.styles,
    this.props,
    this.children,
    this.originalStyles,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      if (layout != null) 'layout': layout!.toJson(),
      if (styles != null) 'styles': styles!.toJson(),
      if (props != null) 'props': props,
      if (children != null) 'children': children!.map((c) => c.toJson()).toList(),
      if (originalStyles != null) 'originalStyles': originalStyles!.toJson(),
    };
  }

  factory Component.fromJson(Map<String, dynamic> json) {
    return Component(
      id: json['id'] as String,
      type: json['type'] as String,
      layout: json['layout'] != null
          ? ComponentLayout.fromJson(json['layout'])
          : null,
      styles: json['styles'] != null
          ? ComponentStyles.fromJson(json['styles'])
          : null,
      props: json['props'] as Map<String, dynamic>?,
      children: json['children'] != null
          ? (json['children'] as List)
              .map((c) => Component.fromJson(c as Map<String, dynamic>))
              .toList()
          : null,
      originalStyles: json['originalStyles'] != null
          ? ComponentStyles.fromJson(json['originalStyles'])
          : null,
    );
  }

  Component copyWith({
    String? id,
    String? type,
    ComponentLayout? layout,
    ComponentStyles? styles,
    Map<String, dynamic>? props,
    List<Component>? children,
    ComponentStyles? originalStyles,
  }) {
    return Component(
      id: id ?? this.id,
      type: type ?? this.type,
      layout: layout ?? this.layout,
      styles: styles ?? this.styles,
      props: props ?? this.props,
      children: children ?? this.children,
      originalStyles: originalStyles ?? this.originalStyles,
    );
  }
}
