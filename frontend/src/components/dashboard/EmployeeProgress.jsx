import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const EmployeeProgress = ({ completionRate, doneCount, totalCount, reviewCount, dueSoonCount }) => {
  return (
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
          <span>{totalCount - doneCount} remaining</span>
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
  );
};

export default EmployeeProgress;
