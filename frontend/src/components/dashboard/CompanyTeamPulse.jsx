import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness } from 'lucide-react';

const CompanyTeamPulse = ({ stats }) => {
  return (
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
  );
};

export default CompanyTeamPulse;
