import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile_app/providers/app_provider.dart';
import 'package:mobile_app/govd_app/screens/tabs/govd_profile_tab.dart';
import 'package:mobile_app/screens/profile/profile_screen.dart';
import 'package:mobile_app/govd_app/screens/govd_certificates_desk.dart';
import 'package:mobile_app/screens/certificates/certificates_list_screen.dart';
import 'package:mobile_app/govd_app/screens/tabs/govd_home_tab.dart';
import 'package:mobile_app/govd_app/screens/tabs/govd_bdo_home_tab.dart';
import 'package:mobile_app/govd_app/screens/govd_grievances_desk.dart';
import 'package:mobile_app/screens/grievances/grievances_list_screen.dart';
import 'package:mobile_app/govd_app/screens/govd_tax_desk.dart';
import 'package:mobile_app/screens/taxes/tax_records_screen.dart';
import 'package:mobile_app/govd_app/screens/govd_bdo_panchayats_desk.dart';
import 'package:mobile_app/govd_app/screens/govd_projects_desk.dart';
import 'package:mobile_app/screens/projects/projects_screen.dart';
import 'package:mobile_app/govd_app/screens/govd_user_management_desk.dart';
import 'package:mobile_app/govd_app/screens/govd_gram_sabha_desk.dart';
import 'package:mobile_app/govd_app/screens/govd_notices_desk.dart';
import 'package:mobile_app/screens/notices/notices_screen.dart';
import 'package:mobile_app/govd_app/screens/govd_bdo_reports_desk.dart';
import 'package:mobile_app/govd_app/screens/govd_dashboard_screen.dart';
import 'package:mobile_app/screens/auth/login_screen.dart';
import 'package:mobile_app/screens/auth/register_screen.dart';

class TestHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return _MockHttpClient();
  }
}

class _MockHttpClient implements HttpClient {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #getUrl) {
      return Future.value(_MockHttpClientRequest());
    }
    return null;
  }
}

class _MockHttpClientRequest implements HttpClientRequest {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #close) {
      return Future.value(_MockHttpClientResponse());
    }
    return null;
  }
}

class _MockHttpClientResponse implements HttpClientResponse {
  static const _kTransparentImage = <int>[
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49,
    0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
    0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44,
    0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D,
    0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
    0x60, 0x82,
  ];

  @override
  int get statusCode => 200;

  @override
  int get contentLength => _kTransparentImage.length;

  @override
  HttpClientResponseCompressionState get compressionState => HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.value(_kTransparentImage).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) {
    return null;
  }
}

void main() {
  setUpAll(() {
    HttpOverrides.global = TestHttpOverrides();
  });

  const testWidths = [320.0, 360.0, 375.0, 390.0, 412.0, 430.0];
  const testHeight = 800.0;

  Widget wrapWithApp(Widget child, AppProvider app) {
    return ChangeNotifierProvider<AppProvider>.value(
      value: app,
      child: MaterialApp(
        home: Scaffold(
          body: Material(child: child),
        ),
      ),
    );
  }

  group('Mobile Responsive Multi-Resolution Overflow Tests (320px - 430px)', () {
    late AppProvider app;

    setUp(() {
      app = AppProvider()..init();
    });

    for (final width in testWidths) {
      testWidgets('GovdProfileTab renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdProfileTab(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('Citizen ProfileScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const ProfileScreen(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdCertificatesDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdCertificatesDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('Citizen CertificatesListScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const CertificatesListScreen(showBackButton: false), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdHomeTab renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(GovdHomeTab(onTabChange: (_) {}), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdBdoHomeTab renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(GovdBdoHomeTab(onTabChange: (_) {}), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdGrievancesDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdGrievancesDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('Citizen GrievancesListScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GrievancesListScreen(showBackButton: false), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdTaxDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdTaxDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('Citizen TaxRecordsScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const TaxRecordsScreen(showBackButton: false), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdBdoPanchayatsDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdBdoPanchayatsDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdProjectsDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdProjectsDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('Citizen ProjectsScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const ProjectsScreen(showBackButton: false), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdUserManagementDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdUserManagementDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdGramSabhaDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdGramSabhaDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdNoticesDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdNoticesDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('Citizen NoticesScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const NoticesScreen(showBackButton: false), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdBdoReportsDesk renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdBdoReportsDesk(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('GovdDashboardScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const GovdDashboardScreen(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('LoginScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const LoginScreen(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });

      testWidgets('RegisterScreen renders without overflow on ${width}px width', (tester) async {
        tester.view.physicalSize = Size(width * 2, testHeight * 2);
        tester.view.devicePixelRatio = 2.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        await tester.pumpWidget(wrapWithApp(const RegisterScreen(), app));
        await tester.pump(const Duration(milliseconds: 500));
        expect(tester.takeException(), isNull);
      });
    }
  });
}
