import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import {
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Users,
  Inbox,
  ListTodo,
  Building2,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/theme/ThemeToggle';
import UserAvatar from '@/components/ui/user-avatar';

const AppLayout = () => {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname, isDesktop]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = user.role === 'company' ? [
    { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/company/projects', icon: FolderKanban },
    { name: 'Employees', path: '/company/employees', icon: Users },
    { name: 'Requests', path: '/company/requests', icon: Inbox },
    { name: 'Settings', path: '/profile', icon: Settings },
  ] : [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/employee/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/employee/tasks', icon: ListTodo },
    { name: 'My Company', path: '/employee/company', icon: Building2 },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === location.pathname) return true;
    // Match sub-routes like /company/projects/123
    if (path !== '/' && location.pathname.startsWith(path + '/')) return true;
    return false;
  };

  const sidebarVisible = isDesktop ? !isSidebarHidden : isMobileSidebarOpen;

  const toggleSidebar = () => {
    if (isDesktop) {
      setIsSidebarHidden((prev) => !prev);
      return;
    }

    setIsMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {!isDesktop && sidebarVisible && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <div
          aria-hidden="true"
          className={cn(
            'hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block',
            sidebarVisible ? 'w-72' : 'w-0'
          )}
        />

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r bg-card shadow-xl transition-transform duration-300 ease-in-out lg:max-w-none lg:shadow-none',
            sidebarVisible ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
            <button
              type="button"
              onClick={() => navigate(user.role === 'company' ? '/company/dashboard' : '/employee/dashboard')}
              className="font-bold text-xl text-primary tracking-tight"
            >
              ProjectFlow
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={isDesktop ? 'Hide sidebar' : 'Close sidebar'}
            >
              {isDesktop ? <ChevronLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-2 border-t border-border p-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors',
                location.pathname === '/profile'
                  ? 'bg-primary/10'
                  : 'hover:bg-accent'
              )}
            >
              <UserAvatar
                src={user.profileImage}
                name={user.fullName}
                alt="Profile"
                className="h-10 w-10 bg-primary/20"
                fallbackClassName="text-base"
              />
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
                aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
              >
                <Menu className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">
                  {sidebarVisible ? 'Hide Menu' : 'Show Menu'}
                </span>
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold capitalize sm:text-lg">{user.role} Portal</h2>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Manage projects and tasks across all screen sizes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle className="h-9 w-9 sm:h-10 sm:w-10" />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {user.companyName || user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex h-9 w-9 items-center justify-center"
                aria-label="Open profile"
              >
                <UserAvatar
                  src={user.profileImage}
                  name={user.fullName}
                  alt="Profile"
                  className="h-9 w-9"
                  fallbackClassName="text-xs"
                />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
