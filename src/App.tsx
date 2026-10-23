import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { DesktopHeader } from './components/DesktopHeader';
import { MobileNav } from './components/MobileNav';
import { Zap } from 'lucide-react';

// Lightweight Auth views
const LoginView = lazy(() => import('./components/Auth/LoginView').then(m => ({ default: m.LoginView })));
const SignupView = lazy(() => import('./components/Auth/SignupView').then(m => ({ default: m.SignupView })));

// Lazy loaded Student views (Loaded on-demand only when student logs in)
const StudentHome = lazy(() => import('./components/Student/StudentHome').then(m => ({ default: m.StudentHome })));
const TricycleCharterRequest = lazy(() => import('./components/Student/TricycleCharterRequest').then(m => ({ default: m.TricycleCharterRequest })));
const CharterStatusView = lazy(() => import('./components/Student/CharterStatusView').then(m => ({ default: m.CharterStatusView })));
const StudentActivity = lazy(() => import('./components/Student/StudentActivity').then(m => ({ default: m.StudentActivity })));
const StudentProfile = lazy(() => import('./components/Student/StudentProfile').then(m => ({ default: m.StudentProfile })));

// Lazy loaded Driver views
const DriverShiftView = lazy(() => import('./components/Driver/DriverShiftView').then(m => ({ default: m.DriverShiftView })));
const DriverRequestsView = lazy(() => import('./components/Driver/DriverRequestsView').then(m => ({ default: m.DriverRequestsView })));
const DriverActivityView = lazy(() => import('./components/Driver/DriverActivityView').then(m => ({ default: m.DriverActivityView })));
const DriverProfileView = lazy(() => import('./components/Driver/DriverProfileView').then(m => ({ default: m.DriverProfileView })));

// Lazy loaded Park Admin views
const ParkAdminDashboard = lazy(() => import('./components/ParkAdmin/ParkAdminDashboard').then(m => ({ default: m.ParkAdminDashboard })));
const ParkAdminDrivers = lazy(() => import('./components/ParkAdmin/ParkAdminDrivers').then(m => ({ default: m.ParkAdminDrivers })));
const ParkAdminCharters = lazy(() => import('./components/ParkAdmin/ParkAdminCharters').then(m => ({ default: m.ParkAdminCharters })));
const ParkAdminDiscipline = lazy(() => import('./components/ParkAdmin/ParkAdminDiscipline').then(m => ({ default: m.ParkAdminDiscipline })));
const ParkAdminActivity = lazy(() => import('./components/ParkAdmin/ParkAdminActivity').then(m => ({ default: m.ParkAdminActivity })));
const ParkAdminProfile = lazy(() => import('./components/ParkAdmin/ParkAdminProfile').then(m => ({ default: m.ParkAdminProfile })));

// Lazy loaded Central Admin views
const CentralAdminLayout = lazy(() => import('./components/CentralAdmin/CentralAdminLayout').then(m => ({ default: m.CentralAdminLayout })));
const CentralAdminOverview = lazy(() => import('./components/CentralAdmin/CentralAdminOverview').then(m => ({ default: m.CentralAdminOverview })));
const CentralAdminParks = lazy(() => import('./components/CentralAdmin/CentralAdminParks').then(m => ({ default: m.CentralAdminParks })));
const CentralAdminDriversVehicles = lazy(() => import('./components/CentralAdmin/CentralAdminDriversVehicles').then(m => ({ default: m.CentralAdminDriversVehicles })));
const CentralAdminBookings = lazy(() => import('./components/CentralAdmin/CentralAdminBookings').then(m => ({ default: m.CentralAdminBookings })));
const CentralAdminAccounts = lazy(() => import('./components/CentralAdmin/CentralAdminAccounts').then(m => ({ default: m.CentralAdminAccounts })));
const CentralAdminActivityLog = lazy(() => import('./components/CentralAdmin/CentralAdminActivityLog').then(m => ({ default: m.CentralAdminActivityLog })));
const CentralAdminProfile = lazy(() => import('./components/CentralAdmin/CentralAdminProfile').then(m => ({ default: m.CentralAdminProfile })));
const AddParkAdminModal = lazy(() => import('./components/CentralAdmin/AddParkAdminModal').then(m => ({ default: m.AddParkAdminModal })));

// Minimalist fast loading spinner
const ViewLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00A86B] via-[#00C269] to-[#34D186] flex items-center justify-center text-white shadow-md shadow-emerald-500/25 animate-pulse">
        <Zap className="w-5 h-5 fill-white text-white" />
      </div>
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 animate-pulse">
        Loading view...
      </span>
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Active navigation tabs for different roles
  const [studentTab, setStudentTab] = useState<string>('home');
  const [studentActiveBookingId, setStudentActiveBookingId] = useState<string | null>(null);

  const [driverTab, setDriverTab] = useState<string>('shift');
  const [parkAdminTab, setParkAdminTab] = useState<string>('overview');
  const [centralAdminTab, setCentralAdminTab] = useState<string>('overview');

  // Park Admin current park selection
  const [currentPark, setCurrentPark] = useState<'Campus Gate' | 'SUB'>('Campus Gate');

  // Central Admin Modal
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  // If user is not logged in
  if (!user) {
    if (isSigningUp) {
      return (
        <Suspense fallback={<ViewLoader />}>
          <SignupView onBackToLogin={() => setIsSigningUp(false)} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<ViewLoader />}>
        <LoginView onGoToSignup={() => setIsSigningUp(true)} />
      </Suspense>
    );
  }

  // 1. Central Admin View (Full responsive layout with collapsible sidebar on mobile, docked on laptop/desktop)
  if (user.role === 'central_admin') {
    return (
      <Suspense fallback={<ViewLoader />}>
        <div className="relative min-h-screen bg-[#F6F8FA] dark:bg-[#0D1017] transition-colors">
          <CentralAdminLayout currentTab={centralAdminTab} setCurrentTab={setCentralAdminTab}>
            {centralAdminTab === 'overview' && (
              <CentralAdminOverview
                onNavigateTab={(tab) => setCentralAdminTab(tab)}
                onOpenAddAdmin={() => setIsAddAdminOpen(true)}
              />
            )}
            {centralAdminTab === 'parks' && <CentralAdminParks />}
            {centralAdminTab === 'drivers-vehicles' && <CentralAdminDriversVehicles />}
            {centralAdminTab === 'bookings' && <CentralAdminBookings />}
            {centralAdminTab === 'admin-accounts' && (
              <CentralAdminAccounts onOpenAddAdmin={() => setIsAddAdminOpen(true)} />
            )}
            {centralAdminTab === 'activity-log' && <CentralAdminActivityLog />}
            {centralAdminTab === 'profile' && <CentralAdminProfile />}
          </CentralAdminLayout>

          {isAddAdminOpen && <AddParkAdminModal onClose={() => setIsAddAdminOpen(false)} />}
        </div>
      </Suspense>
    );
  }

  // 2. Responsive Roles: Student, Driver, Park Admin (Automatically adjusts to Mobile, Laptop, Desktop)
  const renderRoleContent = () => {
    // --- Student ---
    if (user.role === 'student') {
      if (studentTab === 'home') {
        return (
          <StudentHome
            onGoToCharter={() => setStudentTab('charter')}
            onGoToProfile={() => setStudentTab('profile')}
          />
        );
      }
      if (studentTab === 'charter') {
        if (studentActiveBookingId) {
          return (
            <CharterStatusView
              bookingId={studentActiveBookingId}
              onBack={() => setStudentActiveBookingId(null)}
            />
          );
        }
        return (
          <TricycleCharterRequest
            onBack={() => setStudentTab('home')}
            onRequestSubmitted={(id) => setStudentActiveBookingId(id)}
          />
        );
      }
      if (studentTab === 'activity') {
        return (
          <StudentActivity
            onSelectBooking={(id) => {
              setStudentActiveBookingId(id);
              setStudentTab('charter');
            }}
            onGoToCharter={() => {
              setStudentActiveBookingId(null);
              setStudentTab('charter');
            }}
          />
        );
      }
      if (studentTab === 'profile') {
        return <StudentProfile />;
      }
    }

    // --- Driver ---
    if (user.role === 'driver') {
      if (driverTab === 'shift') {
        return <DriverShiftView onGoToProfile={() => setDriverTab('profile')} />;
      }
      if (driverTab === 'requests') {
        return <DriverRequestsView />;
      }
      if (driverTab === 'activity') {
        return <DriverActivityView />;
      }
      if (driverTab === 'profile') {
        return <DriverProfileView />;
      }
    }

    // --- Park Admin ---
    if (user.role === 'park_admin') {
      if (parkAdminTab === 'overview') {
        return (
          <ParkAdminDashboard
            onGoToDrivers={() => setParkAdminTab('drivers')}
            onGoToProfile={() => setParkAdminTab('profile')}
            onGoToCharters={() => setParkAdminTab('charters')}
            onGoToDiscipline={() => setParkAdminTab('discipline')}
          />
        );
      }
      if (parkAdminTab === 'drivers') {
        return <ParkAdminDrivers />;
      }
      if (parkAdminTab === 'charters') {
        return <ParkAdminCharters />;
      }
      if (parkAdminTab === 'discipline') {
        return <ParkAdminDiscipline />;
      }
      if (parkAdminTab === 'activity') {
        return <ParkAdminActivity />;
      }
      if (parkAdminTab === 'profile') {
        return <ParkAdminProfile />;
      }
    }

    return null;
  };

  const getActiveTab = () => {
    if (user.role === 'student') return studentTab;
    if (user.role === 'driver') return driverTab;
    return parkAdminTab;
  };

  const setActiveTab = (tab: string) => {
    if (user.role === 'student') {
      setStudentTab(tab);
      if (tab !== 'charter') setStudentActiveBookingId(null);
    } else if (user.role === 'driver') {
      setDriverTab(tab);
    } else {
      setParkAdminTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#0D1017] text-gray-900 dark:text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Desktop/Laptop Top Navigation Header (Single clean light/dark toggle, hidden on mobile, visible on md/lg/xl) */}
      <DesktopHeader
        role={user.role}
        activeTab={getActiveTab()}
        setActiveTab={setActiveTab}
        currentPark={currentPark}
        onSwitchPark={() => setCurrentPark(currentPark === 'Campus Gate' ? 'SUB' : 'Campus Gate')}
      />

      {/* Main Responsive Content Area (Lazy loaded per role on demand) */}
      <main className="flex-1 w-full">
        <Suspense fallback={<ViewLoader />}>
          {renderRoleContent()}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar (visible on mobile, hidden on md/lg/xl) */}
      <MobileNav
        role={user.role}
        activeTab={getActiveTab()}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
