import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/components/ui/user-avatar';
import { ROUTE_PATHS } from '@/routes/routePaths';

const CompanyRecentActivity = ({ recentTasks, recentEmployees }) => {
  const navigate = useNavigate();
  const [mobileActivityTab, setMobileActivityTab] = useState('tasks');

  const mobileRecentTasks = recentTasks.slice(0, 4);
  const mobileRecentEmployees = recentEmployees.slice(0, 4);

  return (
    <>
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
    </>
  );
};

export default CompanyRecentActivity;
