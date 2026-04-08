import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, CheckCircle, Clock, ListTodo, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

const EmployeeDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data;
    },
  });

  const myTasks = tasks.filter((t) => t.assignedTo?._id === user?._id);
  const todoCount = myTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const reviewCount = myTasks.filter((t) => t.status === 'review').length;
  const doneCount = myTasks.filter((t) => t.status === 'done').length;
  const overdueCount = myTasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const completionRate = myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0;
  const recentTasks = myTasks.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {user?.fullName?.split(' ')[0]}!</h2>
        <p className="text-muted-foreground mt-1">Here's an overview of your work today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Projects" value={projects.length} icon={FolderKanban}
          variant="purple" onClick={() => navigate('/employee/projects')}
        />
        <StatCard
          title="To Do" value={todoCount} icon={ListTodo}
          variant="blue" onClick={() => navigate('/employee/tasks')}
        />
        <StatCard
          title="In Progress" value={inProgressCount} icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Completed" value={doneCount} icon={CheckCircle}
          variant="green"
        />
        <StatCard
          title="Overdue" value={overdueCount} icon={AlertCircle}
          variant="red"
        />
      </div>

      {/* Progress + Recent Tasks */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> My Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{completionRate}%</div>
            <div className="w-full bg-muted rounded-full h-2.5 mt-3">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{doneCount} completed</span>
              <span>{myTasks.length - doneCount} remaining</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">To Do</span>
                <span className="font-medium">{todoCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">{inProgressCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">In Review</span>
                <span className="font-medium">{reviewCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <button onClick={() => navigate('/employee/tasks')} className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks assigned to you yet.</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/employee/tasks')}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        task.status === 'done' ? 'bg-emerald-400' :
                        task.status === 'in_progress' ? 'bg-amber-400' :
                        task.status === 'review' ? 'bg-blue-400' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <Badge variant={task.priority === 'high' || task.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-[10px]">
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
