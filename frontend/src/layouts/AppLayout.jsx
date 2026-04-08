import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { LogOut, LayoutDashboard, FolderKanban, Users, Inbox, ListTodo, Building2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppLayout = () => {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate('/login');
    return null;
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

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-primary tracking-tight">
          ProjectFlow
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Profile Link */}
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
              location.pathname === '/profile'
                ? "bg-primary/10"
                : "hover:bg-accent"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-border/50 shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.fullName.charAt(0)
              )}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center text-sm font-medium text-destructive hover:bg-destructive/10 px-3 py-2 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold capitalize">{user.role} Portal</h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.companyName || user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden border border-border/50">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.fullName.charAt(0)
              )}
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
