import 'package:flutter/foundation.dart';
import '../models/app_state.dart';
import '../models/component.dart';
import '../models/page.dart';

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

    final component = Component(
      id: makeId(type),
      type: type,
      layout: layout ?? ComponentLayout(
        x: 12,
        y: 12,
        width: 100,
        height: 40,
        zIndex: page.components.length + 1,
      ),
    );

    page.components = [...page.components, component];
    selectComponent(component.id);
    _pushHistorySnapshot();
    notifyListeners();
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

  void updateComponentLayout(String componentId, ComponentLayout newLayout) {
    final page = getCurrentPage();
    if (page == null) return;

    final index = page.components.indexWhere((c) => c is Component && c.id == componentId);
    if (index == -1) return;

    final component = page.components[index] as Component;
    page.components[index] = component.copyWith(layout: newLayout);
    notifyListeners();
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
    // TODO: Implement local storage
    debugPrint('Saving to local storage: ${_state.appHash()}');
  }

  void restoreFromLocal() {
    // TODO: Implement local storage restoration
    debugPrint('Restoring from local storage');
  }
}
