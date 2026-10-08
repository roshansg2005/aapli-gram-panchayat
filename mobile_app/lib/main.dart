import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/app_provider.dart';
import 'screens/splash/splash_screen.dart';

void main() {
  final startTime = DateTime.now();
  debugPrint('[PERF] APP START: ${startTime.toIso8601String()}');

  WidgetsFlutterBinding.ensureInitialized();
  debugPrint('[PERF] NATIVE READY: +${DateTime.now().difference(startTime).inMilliseconds}ms');

  // Set system UI overlay style immediately for light splash background
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark, // Dark icons on light background
      statusBarBrightness: Brightness.light,
    ),
  );

  // Immediately render app UI
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()..init()),
      ],
      child: const AapliGramPanchayatApp(),
    ),
  );
}

class AapliGramPanchayatApp extends StatelessWidget {
  const AapliGramPanchayatApp({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();

    return MaterialApp(
      title: 'आपली ग्रामपंचायत - Aapli Gram Panchayat',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: app.isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: const SplashScreen(),
    );
  }
}
