import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';

const EmployeeFocusToday = ({ todoCount, inProgressCount, overdueCount, totalCount }) => {
  return (
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
        <p className="text-2xl font-bold">{totalCount}</p>
      </CardContent>
    </Card>
  );
};

export default EmployeeFocusToday;
