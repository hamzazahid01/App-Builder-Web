import 'package:flutter/foundation.dart';
import '../models/app_state.dart';
import '../models/component.dart';
import '../models/page.dart';
import '../models/component_defaults.dart';

class AppStateProvider with ChangeNotifier {
  late AppState _state;

  AppStateProvider() {
    _state = AppState();
    _ensureBootstrap();
  }

  AppState get state => _state;

  AppData get app => _state.app;
  String? get selectedId => _state.selectedId;
  String get selectedType => _state.selectedType;
  double get previewZoom => _state.previewZoom;
  bool get snapToGrid => _state.snapToGrid;
  bool get snapEnabled => _state.snapEnabled;
  String get currentDeviceKey => _state.currentDeviceKey;
  Map<String, DeviceInfo> get deviceMap => _state.deviceMap;

  String makeId(String prefix) {
    return '${prefix}_${DateTime.now().millisecondsSinceEpoch}_${(DateTime.now().microsecond % 10000)}';
  }

  Page? getCurrentPage() {
    return _state.app.pages.firstWhere(
      (p) => p.id == _state.app.currentPageId,
      orElse: () => _state.app.pages.isNotEmpty ? _state.app.pages.first : Page(id: makeId('page'), name: 'Home'),
    );
  }

  void setCurrentPage(String pageId, {bool pushToStack = true}) {
    final page = _state.app.pages.firstWhere(
      (p) => p.id == pageId,
      orElse: () => _state.app.pages.isNotEmpty ? _state.app.pages.first : Page(id: makeId('page'), name: 'Home'),
    );
    if (pushToStack) {
      _state.app.navigationStack = [..._state.app.navigationStack, pageId];
    }
    _state.app.currentPageId = pageId;
    selectComponent(null, type: 'page');
    notifyListeners();
  }

  void _ensureBootstrap() {
    if (_state.app.pages.isEmpty) {
      final home = createDefaultPage('Home Page');
      _state.app.pages = [home];
      _state.app.currentPageId = home.id;
      _state.app.initialPageId = home.id;
      _state.app.splashScreen.nextScreenId = home.id;
    }
  }

  Page createDefaultPage(String name) {
    return Page(
      id: makeId('page'),
      name: name,
      appBar: AppBarConfig(title: name),
    );
  }

  void addPage(Page page) {
    _state.app.pages = [..._state.app.pages, page];
    _pushHistorySnapshot();
    notifyListeners();
  }

  Component? findById(List<Component> nodes, String id) {
    for (final node in nodes) {
      if (node.id == id) return node;
      if (node.children != null && node.children!.isNotEmpty) {
        final found = findById(node.children!, id);
        if (found != null) return found;
      }
    }
    return null;
  }

  Component? findSelectedComponent() {
    final page = getCurrentPage();
    if (page == null) return null;
    return findById(page.components, selectedId ?? '');
  }

  void selectComponent(String? id, {String type = 'component'}) {
    _state.selectedId = id;
    _state.selectedType = id != null ? type : 'page';
    notifyListeners();
  }

  void addComponent(String type, {ComponentLayout? layout}) {
    final page = getCurrentPage();
    if (page == null) return;

    final defaults = ComponentDefaults.getDefaults(type);
    final defaultLayout = defaults['layout'] as Map<String, dynamic>;
    
    final component = Component(
      id: makeId(type),
      type: type,
      layout: layout ?? ComponentLayout(
        x: (defaultLayout['x'] as num).toDouble(),
        y: (defaultLayout['y'] as num).toDouble(),
        width: (defaultLayout['width'] as num).toDouble(),
        height: (defaultLayout['height'] as num).toDouble(),
        zIndex: page.components.length + 1,
      ),
      styles: _createDefaultStyles(type, defaults),
      props: defaults['props'] as Map<String, dynamic>?,
    );

    page.components = [...page.components, component];
    selectComponent(component.id);
    _pushHistorySnapshot();
    notifyListeners();
  }

  ComponentStyles _createDefaultStyles(String type, Map<String, dynamic> defaults) {
    final styleDefaults = defaults['styles'] as Map<String, dynamic>;
    return ComponentStyles(
      backgroundColor: styleDefaults['backgroundColor'] as String?,
      color: styleDefaults['textColor'] as String?,
      fontSize: styleDefaults['fontSize'] as String?,
      fontWeight: styleDefaults['fontWeight'] as String?,
      fontFamily: styleDefaults['fontFamily'] as String?,
      textAlign: styleDefaults['textAlign'] as String?,
      borderRadius: styleDefaults['borderRadius'] as String?,
      borderColor: styleDefaults['borderColor'] as String?,
      borderWidth: styleDefaults['borderWidth'] as String?,
      padding: styleDefaults['padding'] as String?,
      margin: styleDefaults['margin'] as String?,
      opacity: styleDefaults['opacity'] as String?,
    );
  }

  void deleteSelected() {
    if (selectedId == null) return;
    final page = getCurrentPage();
    if (page == null) return;

    page.components = page.components.where((c) => c is Component && c.id != selectedId).cast<Component>().toList();
    selectComponent(null);
    _pushHistorySnapshot();
    notifyListeners();
  }

  void updateComponentLayout(String componentId, ComponentLayout newLayout, {bool notify = false}) {
    final page = getCurrentPage();
    if (page == null) return;

    final index = page.components.indexWhere((c) => c is Component && c.id == componentId);
    if (index == -1) return;

    final component = page.components[index] as Component;
    page.components[index] = component.copyWith(layout: newLayout);
    if (notify) {
      notifyListeners();
    }
  }

  void updateComponentStyles(String componentId, ComponentStyles newStyles) {
    final page = getCurrentPage();
    if (page == null) return;

    final index = page.components.indexWhere((c) => c is Component && c.id == componentId);
    if (index == -1) return;

    final component = page.components[index] as Component;
    page.components[index] = component.copyWith(styles: newStyles);
    notifyListeners();
  }

  void undo() {
    if (_state.history.past.length < 2) return;
    _state.history.isApplying = true;
    final current = _state.history.past.removeLast();
    _state.history.future = [..._state.history.future, current];
    _state.app = AppData.fromJson(_state.history.past.last.toJson());
    selectComponent(null);
    _state.history.watcherLastHash = _state.appHash();
    _state.history.isApplying = false;
    notifyListeners();
  }

  void redo() {
    if (_state.history.future.isEmpty) return;
    _state.history.isApplying = true;
    final snapshot = _state.history.future.removeLast();
    _state.app = AppData.fromJson(snapshot.toJson());
    _state.history.past = [..._state.history.past, AppData.fromJson(snapshot.toJson())];
    selectComponent(null);
    _state.history.watcherLastHash = _state.appHash();
    _state.history.isApplying = false;
    notifyListeners();
  }

  bool canUndo() => _state.history.past.length > 1;
  bool canRedo() => _state.history.future.isNotEmpty;

  void _pushHistorySnapshot() {
    if (_state.history.isApplying) return;
    final hash = _state.appHash();
    if (hash == _state.history.watcherLastHash) return;
    _state.history.past = [..._state.history.past, AppData.fromJson(_state.app.toJson())];
    if (_state.history.past.length > _state.history.max) {
      _state.history.past.removeAt(0);
    }
    _state.history.future = [];
    _state.history.watcherLastHash = hash;
  }

  void setPreviewZoom(double zoom) {
    _state.previewZoom = zoom;
    notifyListeners();
  }

  void setSnapToGrid(bool value) {
    _state.snapToGrid = value;
    notifyListeners();
  }

  void setCurrentDevice(String deviceKey) {
    _state.currentDeviceKey = deviceKey;
    notifyListeners();
  }

  void saveToLocal() {
    // TODO: Implement local storage with shared_preferences
    debugPrint('Saving to local storage: ${_state.appHash()}');
  }

  void restoreFromLocal() {
    // TODO: Implement local storage restoration with shared_preferences
    debugPrint('Restoring from local storage');
  }

  void exportToJson() {
    final jsonString = _state.toJsonString();
    debugPrint('Exported JSON: $jsonString');
    // TODO: Implement file download/export functionality
  }

  void copyComponent(Component component) {
    _state.clipboard = component;
    notifyListeners();
  }

  void pasteComponent() {
    if (_state.clipboard == null) return;
    final page = getCurrentPage();
    if (page == null) return;

    final newComponent = Component(
      id: makeId(_state.clipboard!.type),
      type: _state.clipboard!.type,
      layout: _state.clipboard!.layout?.copyWith(
        x: (_state.clipboard!.layout?.x ?? 0) + 20,
        y: (_state.clipboard!.layout?.y ?? 0) + 20,
      ),
      styles: _state.clipboard!.styles,
      props: _state.clipboard!.props,
    );

    page.components = [...page.components, newComponent];
    selectComponent(newComponent.id);
    _pushHistorySnapshot();
    notifyListeners();
  }

  bool isValidComponentId(String id) {
    final page = getCurrentPage();
    if (page == null) return false;
    return findById(page.components, id) != null;
  }

  bool isValidComponentType(String type) {
    const validTypes = ['button', 'text', 'image', 'input', 'container', 'row', 'column', 'stack', 'appbar', 'bottomnav', 'drawer'];
    return validTypes.contains(type.toLowerCase());
  }

  String? validateComponent(Component component) {
    if (component.id.isEmpty) return 'Component ID cannot be empty';
    if (!isValidComponentType(component.type)) return 'Invalid component type: ${component.type}';
    if (component.layout == null) return 'Component layout is required';
    if (component.layout!.width <= 0) return 'Component width must be greater than 0';
    if (component.layout!.height <= 0) return 'Component height must be greater than 0';
    return null;
  }

  void deleteComponent(String componentId) {
    final page = getCurrentPage();
    if (page == null) return;

    page.components = page.components.where((c) => c.id != componentId).toList();
    if (_state.selectedId == componentId) {
      _state.selectedId = null;
    }
    _pushHistorySnapshot();
    notifyListeners();
  }
}
