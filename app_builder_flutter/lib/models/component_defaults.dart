import 'component.dart';

class ComponentDefaults {
  static Map<String, dynamic> getDefaults(String type) {
    switch (type.toLowerCase()) {
      case 'button':
        return _buttonDefaults();
      case 'text':
        return _textDefaults();
      case 'image':
        return _imageDefaults();
      case 'input':
        return _inputDefaults();
      case 'icon':
        return _iconDefaults();
      case 'group':
        return _groupDefaults();
      default:
        return _containerDefaults();
    }
  }

  static Map<String, dynamic> _buttonDefaults() {
    return {
      'layout': {
        'width': 130.0,
        'height': 44.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'backgroundColor': '#2563eb',
        'textColor': '#ffffff',
        'fontFamily': 'Inter',
        'fontSize': '14',
        'fontWeight': '600',
        'padding': '10,16,10,16',
        'borderRadius': '10',
        'opacity': '1',
        'cursor': 'pointer',
      },
      'props': {
        'text': 'Button',
        'icon': {
          'enabled': false,
          'position': 'left',
          'symbol': '',
        },
      },
    };
  }

  static Map<String, dynamic> _textDefaults() {
    return {
      'layout': {
        'width': 200.0,
        'height': 40.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'textColor': '#1f2937',
        'fontFamily': 'Inter',
        'fontSize': '16',
        'fontWeight': '400',
        'textAlign': 'left',
        'lineHeight': '1.5',
        'opacity': '1',
      },
      'props': {
        'text': 'Text content',
      },
    };
  }

  static Map<String, dynamic> _imageDefaults() {
    return {
      'layout': {
        'width': 200.0,
        'height': 200.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'borderRadius': '0',
        'opacity': '1',
      },
      'props': {
        'src': 'https://via.placeholder.com/200',
        'alt': 'Image',
        'objectFit': 'cover',
      },
    };
  }

  static Map<String, dynamic> _inputDefaults() {
    return {
      'layout': {
        'width': 200.0,
        'height': 40.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'backgroundColor': '#ffffff',
        'textColor': '#1f2937',
        'borderColor': '#d1d5db',
        'borderWidth': '1',
        'borderRadius': '6',
        'padding': '8,12,8,12',
        'fontSize': '14',
        'opacity': '1',
      },
      'props': {
        'placeholder': 'Enter text...',
        'type': 'text',
        'value': '',
      },
    };
  }

  static Map<String, dynamic> _iconDefaults() {
    return {
      'layout': {
        'width': 24.0,
        'height': 24.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'textColor': '#1f2937',
        'opacity': '1',
      },
      'props': {
        'symbol': 'star',
        'size': '24',
      },
    };
  }

  static Map<String, dynamic> _groupDefaults() {
    return {
      'layout': {
        'width': 300.0,
        'height': 300.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'backgroundColor': 'transparent',
        'opacity': '1',
      },
      'props': {
        'name': 'Group',
      },
    };
  }

  static Map<String, dynamic> _containerDefaults() {
    return {
      'layout': {
        'width': 200.0,
        'height': 200.0,
        'x': 12.0,
        'y': 12.0,
        'zIndex': 1,
      },
      'styles': {
        'backgroundColor': '#f3f4f6',
        'borderRadius': '8',
        'padding': '16,16,16,16',
        'opacity': '1',
      },
      'props': {},
    };
  }
}
