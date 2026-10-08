import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CertificateViewerModal } from './components/common/CertificateViewerModal';
import { TaxReceiptModal } from './components/common/TaxReceiptModal';
import { AuthModal } from './components/common/AuthModal';
import { AuthGatewayScreen } from './components/auth/AuthGatewayScreen';
import { CheckCircle2 } from 'lucide-react';

// Citizen Mobile Components
import { CitizenLayout } from './components/citizen/CitizenLayout';
import { CitizenHome } from './components/citizen/CitizenHome';
import { CitizenCertificates } from './components/citizen/CitizenCertificates';
import { CitizenGrievances } from './components/citizen/CitizenGrievances';
import { CitizenTaxPayment } from './components/citizen/CitizenTaxPayment';
import { CitizenSchemes } from './components/citizen/CitizenSchemes';
import { CitizenNotices } from './components/citizen/CitizenNotices';
import { CitizenDirectory } from './components/citizen/CitizenDirectory';
import { CitizenProfile } from './components/citizen/CitizenProfile';

// Desktop Panchayat ERP Components
import { DesktopLayout } from './components/desktop/DesktopLayout';
import { DesktopDashboard } from './components/desktop/DesktopDashboard';
import { DesktopCertificates } from './components/desktop/DesktopCertificates';
import { DesktopGrievanceDesk } from './components/desktop/DesktopGrievanceDesk';
import { DesktopTaxCounter } from './components/desktop/DesktopTaxCounter';
import { DesktopSchemesManager } from './components/desktop/DesktopSchemesManager';
import { DesktopDevelopmentWorks } from './components/desktop/DesktopDevelopmentWorks';
import { DesktopGramSabha } from './components/desktop/DesktopGramSabha';
import { DesktopVillageDirectory } from './components/desktop/DesktopVillageDirectory';
import { DesktopWardMemberDesk } from './components/desktop/DesktopWardMemberDesk';
import { DesktopTalukaOversight } from './components/desktop/DesktopTalukaOversight';
import { DesktopAdminUserManagement } from './components/desktop/DesktopAdminUserManagement';
import { AdminLoginScreen } from './components/auth/AdminLoginScreen';

const MainAppContent: React.FC = () => {
  const { appMode, setAppMode, mobileTab, desktopTab, setDesktopTab, currentUser, toast, isMobileScreen } = useApp();

  // 🛡️ Secret Admin URL listener (/admin, /admin-login, /unknownpage, /#admin, etc.)
  React.useEffect(() => {
    const checkAdminRoute = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdminUrl = 
        path.includes('/admin') ||
        path.includes('/unknownpage') ||
        path.includes('/secret-admin') ||
        path.includes('/master-admin') ||
        hash.includes('admin') ||
        search.includes('admin');

      if (isAdminUrl) {
        if (currentUser && currentUser.role === 'admin') {
          setAppMode('panchayat-desktop');
          setDesktopTab('admin_users');
        } else {
          setAppMode('admin-login');
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [currentUser]);

  const renderCitizenTab = () => {
    switch (mobileTab) {
      case 'home': return <CitizenHome />;
      case 'certificates': return <CitizenCertificates />;
      case 'grievances': return <CitizenGrievances />;
      case 'tax': return <CitizenTaxPayment />;
      case 'schemes': return <CitizenSchemes />;
      case 'notices': return <CitizenNotices />;
      case 'directory': return <CitizenDirectory />;
      case 'profile': return <CitizenProfile />;
      default: return <CitizenHome />;
    }
  };

  const renderDesktopTab = () => {
    switch (desktopTab) {
      case 'admin_users': return <DesktopAdminUserManagement />;
      case 'dashboard': return <DesktopDashboard />;
      case 'ward_desk': return <DesktopWardMemberDesk />;
      case 'taluka_oversight': return <DesktopTalukaOversight />;
      case 'certificates': return <DesktopCertificates />;
      case 'grievances': return <DesktopGrievanceDesk />;
      case 'tax': return <DesktopTaxCounter />;
      case 'schemes': return <DesktopSchemesManager />;
      case 'development': return <DesktopDevelopmentWorks />;
      case 'gramsabha': return <DesktopGramSabha />;
      case 'directory': return <DesktopVillageDirectory />;
      default: return <DesktopDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans">
      {/* Main Secure Viewport Container */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {appMode === 'admin-login' ? (
          /* 🛡️ Secret Master Admin Login (Accessible only via secret URL) */
          <AdminLoginScreen />
        ) : appMode === 'gateway' ? (
          /* 1. Public Authentication Gateway: Citizen & Panchayat Staff only */
          <AuthGatewayScreen />
        ) : appMode === 'citizen-mobile' ? (
          /* 2. Citizen Portal: Responsive full-screen on desktop and mobile */
          <div className="flex-1 bg-slate-100 flex flex-col overflow-y-auto">
            <CitizenLayout>
              {renderCitizenTab()}
            </CitizenLayout>
          </div>
        ) : (
          /* 3. Gram Panchayat Administration ERP: Protected to Staff */
          <DesktopLayout>
            {renderDesktopTab()}
          </DesktopLayout>
        )}
      </div>

      {/* Global Toast Feedback */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/40 flex items-center space-x-2 text-xs font-bold animate-slide-up no-print max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      {/* Official Document Modals & Login Modal */}
      <CertificateViewerModal />
      <TaxReceiptModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
