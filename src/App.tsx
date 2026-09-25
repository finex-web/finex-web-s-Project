import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { ViewType } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LoginView } from './components/auth/LoginView';

// Core Business Views
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { CallsView } from './components/calls/CallsView';
import { RequirementsView } from './components/requirements/RequirementsView';
import { QuotesView } from './components/quotes/QuotesView';
import { ClientsView } from './components/clients/ClientsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { TasksView } from './components/tasks/TasksView';
import { TeamView } from './components/team/TeamView';
import { SalariesView } from './components/salaries/SalariesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { FollowupsView } from './components/followups/FollowupsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { ActivityLogsView } from './components/activity/ActivityLogsView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Deep drilldown entity selection states
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [projectInitialMode, setProjectInitialMode] = useState<'list' | 'kanban'>('list');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E52D27] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-zinc-400">Verifying secure admin credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigate = (view: string, id?: string) => {
    if (view === 'clients' && id) {
      setSelectedClientId(id);
    }
    if (view === 'projects' && id) {
      setSelectedProjectId(id);
    }
    setCurrentView(view as ViewType);
    setIsMobileMenuOpen(false);
  };

  const handleGlobalSelectEntity = (type: string, id: string) => {
    if (type === 'lead') {
      setCurrentView('leads');
    } else if (type === 'client') {
      setSelectedClientId(id);
      setCurrentView('clients');
    } else if (type === 'project') {
      setSelectedProjectId(id);
      setCurrentView('projects');
    } else if (type === 'quote') {
      setCurrentView('quotes');
    } else if (type === 'task') {
      setCurrentView('tasks');
    } else if (type === 'member') {
      setCurrentView('team');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#EDEDED] flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Fixed Desktop Sidebar & Mobile Off-canvas */}
      <Sidebar
        activeView={currentView}
        onSelectView={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Global Control Header */}
        <Header
          activeView={currentView}
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onNavigateToSettings={() => handleNavigate('settings')}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenAddModal={(type) => {
                if (type === 'lead') setCurrentView('leads');
                else if (type === 'project') setCurrentView('projects');
                else if (type === 'client') setCurrentView('clients');
                else if (type === 'payment') setCurrentView('payments');
                else if (type === 'expense') setCurrentView('expenses');
              }}
            />
          )}

          {currentView === 'leads' && <LeadsView onNavigateToClient={() => handleNavigate('clients')} />}

          {currentView === 'calls' && <CallsView />}

          {currentView === 'requirements' && <RequirementsView />}

          {currentView === 'quotes' && <QuotesView />}

          {currentView === 'clients' && (
            <ClientsView
              initialSelectedClientId={selectedClientId}
              onNavigateToProject={(pId) => {
                setSelectedProjectId(pId);
                setCurrentView('projects');
              }}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              initialViewMode={projectInitialMode}
              initialProjectId={selectedProjectId}
              onNavigateToClient={(cId) => {
                setSelectedClientId(cId);
                setCurrentView('clients');
              }}
            />
          )}

          {currentView === 'tasks' && <TasksView />}

          {currentView === 'team' && <TeamView />}

          {currentView === 'salaries' && <SalariesView />}

          {currentView === 'payments' && <PaymentsView />}

          {currentView === 'maintenance' && <MaintenanceView />}

          {currentView === 'followups' && <FollowupsView />}

          {currentView === 'expenses' && <ExpensesView />}

          {currentView === 'reports' && <ReportsView />}

          {currentView === 'activity' && <ActivityLogsView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleGlobalSelectEntity}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
