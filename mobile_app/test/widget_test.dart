import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/providers/app_provider.dart';
import 'package:mobile_app/screens/splash/splash_screen.dart';

void main() {
  testWidgets('App loads smoke test and renders splash screen instantly with emblem branding', (WidgetTester tester) async {
    final appProvider = AppProvider()..init();
    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: appProvider,
        child: const AapliGramPanchayatApp(),
      ),
    );

    // Verify main app and splash screen mount immediately
    expect(find.byType(AapliGramPanchayatApp), findsOneWidget);
    expect(find.byType(SplashScreen), findsOneWidget);

    // Verify emblem splash branding is visible
    expect(find.text('aapli grampanchayat'), findsOneWidget);
    expect(find.text('आपली ग्रामपंचायत — डिजिटल महाराष्ट्र'), findsOneWidget);

    // Pump timer for animations
    await tester.pump(const Duration(milliseconds: 500));
  });
}
