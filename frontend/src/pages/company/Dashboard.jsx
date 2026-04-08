import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Users, FolderKanban, CheckCircle, AlertCircle, ListTodo, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/dashboard/StatCard';

const CompanyDashboard = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['companyStats'],
    queryFn: async () => {
      const response = await api.get('/company/dashboard');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <div className="text-destructive text-center py-20">Failed to load dashboard.</div>;

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.fullName}. Here's your company overview.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invitation Code</p>
          <div className="inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-lg font-mono font-bold text-primary tracking-[0.25em]">
            {user?.invitationCode}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Projects" value={stats.projectCount} icon={FolderKanban}
          description="Active company projects" variant="purple"
          onClick={() => navigate('/company/projects')}
        />
        <StatCard 
          title="Active Employees" value={stats.employeeCount} icon={Users}
          description="In your organization" variant="green"
          onClick={() => navigate('/company/employees')}
        />
        <StatCard 
          title="Pending Requests" value={stats.pendingRequests} icon={AlertCircle}
          description="Awaiting your approval" variant="amber"
          onClick={() => navigate('/company/requests')}
        />
        <StatCard 
          title="Tasks Completed" value={`${stats.completedTasks}/${stats.totalTasks}`} icon={CheckCircle}
          description={`${completionRate}% completion rate`} variant="green"
        />
      </div>

      {/* Progress + Task Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Completion Rate
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
              <span>{stats.completedTasks} done</span>
              <span>{stats.totalTasks - stats.completedTasks} remaining</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListTodo className="h-4 w-4" /> Task Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <Badge variant="warning">{stats.inProgressTasks}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <Badge variant="success">{stats.completedTasks}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <Badge variant="destructive">{stats.overdueTasks}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Tasks</span>
                <span className="font-bold">{stats.totalTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Projects</span>
                <span className="font-bold">{stats.projectCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Team Size</span>
                <span className="font-bold">{stats.employeeCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <button onClick={() => navigate('/company/projects')} className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentTasks?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tasks created yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentTasks?.map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project?.name} · {task.assignedTo?.fullName || 'Unassigned'}</p>
                    </div>
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'} className="text-[10px] ml-2 shrink-0">
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
              <button onClick={() => navigate('/company/employees')} className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentEmployees?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No employees have joined yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentEmployees?.map((emp) => (
                  <div key={emp._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden border border-border/50">
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt={emp.fullName} className="w-full h-full object-cover" />
                      ) : (
                        emp.fullName?.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{emp.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.department || emp.email}</p>
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
