import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import RefreshButton from '@/components/ui/refresh-button';
import { FolderKanban, CheckCircle, Clock, ListTodo, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import EmployeeProgress from '@/components/dashboard/EmployeeProgress';
import EmployeeFocusToday from '@/components/dashboard/EmployeeFocusToday';
import EmployeeRecentTasks from '@/components/dashboard/EmployeeRecentTasks';
import { getProjects } from '@/services/projectService';
import { getTasks } from '@/services/taskService';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTE_PATHS } from '@/routes/routePaths';

const EmployeeDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: projects = [], isFetching: isProjectsFetching, refetch: refetchProjects } = useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: getProjects,
  });

  const { data: tasks = [], isLoading, isFetching: isTasksFetching, refetch: refetchTasks } = useQuery({
    queryKey: QUERY_KEYS.MY_TASKS,
    queryFn: () => getTasks(),
  });

  const myTasks = tasks.filter((t) => t.assignedTo?._id === user?._id);
  const todoCount = myTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const reviewCount = myTasks.filter((t) => t.status === 'review').length;
  const doneCount = myTasks.filter((t) => t.status === 'done').length;
  const overdueCount = myTasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const dueSoonCount = myTasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const msDiff = dueDate.getTime() - today.getTime();
    return msDiff >= 0 && msDiff <= 3 * 24 * 60 * 60 * 1000;
  }).length;
  const completionRate = myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0;
  const recentTasks = myTasks.slice(0, 5);
  const refreshPage = () => Promise.all([refetchProjects(), refetchTasks()]);
  const isRefreshing = isProjectsFetching || isTasksFetching;

  const statCards = [
    {
      title: 'Projects',
      value: projects.length,
      icon: FolderKanban,
      variant: 'blue',
      description: 'Assigned to you',
      onClick: () => navigate(ROUTE_PATHS.EMPLOYEE_PROJECTS),
    },
    {
      title: 'To Do',
      value: todoCount,
      icon: ListTodo,
      variant: 'amber',
      description: 'Ready to start',
      onClick: () => navigate(ROUTE_PATHS.EMPLOYEE_TASKS),
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      variant: 'blue',
      description: 'Active work',
    },
    {
      title: 'Completed',
      value: doneCount,
      icon: CheckCircle,
      variant: 'green',
      description: 'Finished tasks',
    },
    {
      title: 'Overdue',
      value: overdueCount,
      icon: AlertCircle,
      variant: 'red',
      description: 'Need attention',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Your daily work snapshot is ready.</p>
        </div>
        <RefreshButton
          onRefresh={refreshPage}
          isRefreshing={isRefreshing}
          className="w-full sm:w-auto"
        />
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
                variant={card.variant}
                description={card.description}
                onClick={card.onClick}
                compact
                className="snap-start"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            variant={card.variant}
            description={card.description}
            onClick={card.onClick}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <EmployeeProgress
          completionRate={completionRate}
          doneCount={doneCount}
          totalCount={myTasks.length}
          reviewCount={reviewCount}
          dueSoonCount={dueSoonCount}
        />

        <EmployeeFocusToday
          todoCount={todoCount}
          inProgressCount={inProgressCount}
          overdueCount={overdueCount}
          totalCount={myTasks.length}
        />

        <EmployeeRecentTasks recentTasks={recentTasks} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
