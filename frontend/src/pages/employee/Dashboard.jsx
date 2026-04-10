import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RefreshButton from '@/components/ui/refresh-button';
import { FolderKanban, CheckCircle, Clock, ListTodo, TrendingUp, ArrowRight, AlertCircle, CalendarClock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> My Progress
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
              <span>{doneCount} completed</span>
              <span>{myTasks.length - doneCount} remaining</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">In review</span>
                <span className="font-medium">{reviewCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Due soon</span>
                <span className="font-medium">{dueSoonCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarClock className="h-4 w-4" /> Focus Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">To do now</span>
              <span className="font-semibold">{todoCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">In progress</span>
              <span className="font-semibold">{inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Overdue</span>
              <span className="font-semibold text-destructive">{overdueCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Open tasks assigned to you</p>
            <p className="text-2xl font-bold">{myTasks.length}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <button onClick={() => navigate(ROUTE_PATHS.EMPLOYEE_TASKS)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recentTasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No tasks assigned to you yet.</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                    onClick={() => navigate(ROUTE_PATHS.EMPLOYEE_TASKS)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          task.status === 'done'
                            ? 'bg-emerald-400'
                            : task.status === 'in_progress'
                              ? 'bg-amber-400'
                              : task.status === 'review'
                                ? 'bg-blue-400'
                                : 'bg-muted-foreground/30'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-2">
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <Badge variant={task.priority === 'high' || task.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-[10px] capitalize">
                        {task.priority}
                      </Badge>
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

export default EmployeeDashboard;
