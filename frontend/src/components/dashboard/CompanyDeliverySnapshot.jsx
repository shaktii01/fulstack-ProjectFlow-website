import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const CompanyDeliverySnapshot = ({ completionRate, remainingTasks, stats }) => {
  return (
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
  );
};

export default CompanyDeliverySnapshot;
