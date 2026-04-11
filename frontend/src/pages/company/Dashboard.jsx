import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, FolderKanban, CheckCircle, AlertCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import StatCard from '@/components/dashboard/StatCard';
import RefreshButton from '@/components/ui/refresh-button';
import CompanyDeliverySnapshot from '@/components/dashboard/CompanyDeliverySnapshot';
import CompanyTeamPulse from '@/components/dashboard/CompanyTeamPulse';
import CompanyRecentActivity from '@/components/dashboard/CompanyRecentActivity';
import { getCompanyDashboardStats } from '@/services/companyService';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTE_PATHS } from '@/routes/routePaths';

const CompanyDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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
        <CompanyDeliverySnapshot 
          completionRate={completionRate} 
          remainingTasks={remainingTasks} 
          stats={stats} 
        />
        <CompanyTeamPulse stats={stats} />
      </div>

      <CompanyRecentActivity 
        recentTasks={stats.recentTasks || []} 
        recentEmployees={stats.recentEmployees || []} 
      />
    </div>
  );
};

export default CompanyDashboard;
