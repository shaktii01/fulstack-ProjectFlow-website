import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FolderKanban, CheckCircle, AlertCircle, TrendingUp, ArrowRight, BriefcaseBusiness } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import StatCard from '@/components/dashboard/StatCard';
import RefreshButton from '@/components/ui/refresh-button';
import UserAvatar from '@/components/ui/user-avatar';
import { getCompanyDashboardStats } from '@/services/companyService';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTE_PATHS } from '@/routes/routePaths';

const CompanyDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [mobileActivityTab, setMobileActivityTab] = useState('tasks');

  const { data: stats, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.COMPANY_STATS,
    queryFn: getCompanyDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (error) return <div className="py-20 text-center text-destructive">Failed to load dashboard.</div>;

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const remainingTasks = Math.max(stats.totalTasks - stats.completedTasks, 0);
  const recentTasks = stats.recentTasks || [];
  const recentEmployees = stats.recentEmployees || [];
  const mobileRecentTasks = recentTasks.slice(0, 4);
  const mobileRecentEmployees = recentEmployees.slice(0, 4);

  const statCards = [
    {
      title: 'Projects',
      value: stats.projectCount,
      icon: FolderKanban,
      description: 'Active projects',
      variant: 'blue',
      onClick: () => navigate(ROUTE_PATHS.COMPANY_PROJECTS),
    },
    {
      title: 'Employees',
      value: stats.employeeCount,
      icon: Users,
      description: 'Team members',
      variant: 'green',
      onClick: () => navigate(ROUTE_PATHS.COMPANY_EMPLOYEES),
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      icon: AlertCircle,
      description: 'Join requests',
      variant: 'amber',
      onClick: () => navigate(ROUTE_PATHS.COMPANY_REQUESTS),
    },
    {
      title: 'Completed',
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      icon: CheckCircle,
      description: `${completionRate}% done`,
      variant: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Welcome back, {user?.fullName}. Here is your live team snapshot.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
            <RefreshButton
              onRefresh={refetch}
              isRefreshing={isFetching}
              className="w-full md:w-auto"
            />
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Invitation Code</p>
              <p className="font-mono text-sm font-bold tracking-[0.18em] text-primary sm:text-base">{user?.invitationCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="flex snap-x gap-3 px-1">
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                description={card.description}
                variant={card.variant}
                onClick={card.onClick}
                compact
                className="snap-start"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            variant={card.variant}
            onClick={card.onClick}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Delivery Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">{completionRate}%</div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-muted">
              <div
                className="h-2.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{stats.completedTasks} done</span>
              <span>{remainingTasks} remaining</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">In Progress</p>
                <p className="mt-1 text-xl font-semibold">{stats.inProgressTasks}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Completed</p>
                <p className="mt-1 text-xl font-semibold">{stats.completedTasks}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Overdue</p>
                <p className="mt-1 text-xl font-semibold text-destructive">{stats.overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BriefcaseBusiness className="h-4 w-4" /> Team Pulse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Projects</span>
              <span className="font-semibold">{stats.projectCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Employees</span>
              <span className="font-semibold">{stats.employeeCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Pending approvals</span>
              <span className="font-semibold">{stats.pendingRequests}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total tasks in active projects</p>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 md:hidden">
        <div className="inline-flex w-full rounded-lg border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setMobileActivityTab('tasks')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${mobileActivityTab === 'tasks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Recent Tasks
          </button>
          <button
            type="button"
            onClick={() => setMobileActivityTab('employees')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${mobileActivityTab === 'employees' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Team Activity
          </button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {mobileActivityTab === 'tasks' ? 'Recent Tasks' : 'Recent Employees'}
              </CardTitle>
              <button
                onClick={() => navigate(mobileActivityTab === 'tasks' ? ROUTE_PATHS.COMPANY_PROJECTS : ROUTE_PATHS.COMPANY_EMPLOYEES)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {mobileActivityTab === 'tasks' ? (
              mobileRecentTasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No tasks created yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {mobileRecentTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {task.project?.name} | {task.assignedTo?.fullName || 'Unassigned'}
                        </p>
                      </div>
                      <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'} className="ml-2 text-[10px] capitalize">
                        {task.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )
            ) : (
              mobileRecentEmployees.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No employees have joined yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {mobileRecentEmployees.map((emp) => (
                    <div key={emp._id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-2.5">
                      <UserAvatar
                        src={emp.profileImage}
                        name={emp.fullName}
                        alt={emp.fullName}
                        className="h-8 w-8 bg-primary/15 text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{emp.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{emp.department || emp.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <button onClick={() => navigate(ROUTE_PATHS.COMPANY_PROJECTS)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No tasks created yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project?.name} | {task.assignedTo?.fullName || 'Unassigned'}</p>
                    </div>
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'} className="ml-2 shrink-0 text-[10px] capitalize">
                      {task.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Employees</CardTitle>
              <button onClick={() => navigate(ROUTE_PATHS.COMPANY_EMPLOYEES)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEmployees.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No employees have joined yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEmployees.map((emp) => (
                  <div key={emp._id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-2.5 transition-colors hover:bg-muted/50">
                    <UserAvatar
                      src={emp.profileImage}
                      name={emp.fullName}
                      alt={emp.fullName}
                      className="h-8 w-8 bg-primary/15 text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{emp.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{emp.department || emp.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
