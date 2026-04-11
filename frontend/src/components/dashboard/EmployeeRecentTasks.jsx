import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { ROUTE_PATHS } from '@/routes/routePaths';

const EmployeeRecentTasks = ({ recentTasks, isLoading }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default EmployeeRecentTasks;
