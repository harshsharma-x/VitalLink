import 'package:flutter_test/flutter_test.dart';
import 'package:vitallink_flutter/main.dart';

void main() {
  testWidgets('App renders', (WidgetTester tester) async {
    await tester.pumpWidget(const VitalLinkApp());
    expect(find.text('VitalLink'), findsOneWidget);
  });
}
