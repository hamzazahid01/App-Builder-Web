// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app_builder_flutter/main.dart';

void main() {
  testWidgets('AppBuilderApp loads and shows project name', (WidgetTester tester) async {
    // Provide a larger test window so the app layout can render without overflow.
    tester.binding.window.physicalSizeTestValue = const Size(1920, 1080);
    tester.binding.window.devicePixelRatioTestValue = 1.0;
    addTearDown(() {
      tester.binding.window.clearPhysicalSizeTestValue();
      tester.binding.window.clearDevicePixelRatioTestValue();
    });

    await tester.pumpWidget(const AppBuilderApp());
    await tester.pumpAndSettle();

    // Verify that the app loads and the project name is displayed.
    expect(find.text('My App'), findsOneWidget);
  });
}
