import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Pencil, Trash2 } from 'lucide-react';

const EmployeeTable = ({ employees, onEdit, onRemove }) => {
  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No employees found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Share your invitation code to let employees join your workspace, or try a different search.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3 p-4 md:hidden">
        {employees.map((emp) => (
          <div key={emp._id} className="rounded-xl border border-border/70 bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {emp.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{emp.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{emp.email}</p>
                </div>
              </div>
              <Badge variant={emp.isActive ? 'success' : 'destructive'}>
                {emp.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                <p className="mt-1">{emp.department || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Designation</p>
                <p className="mt-1">{emp.designation || 'Not set'}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(emp)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemove(emp._id, emp.fullName)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Designation</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {emp.fullName.charAt(0)}
                    </div>
                    <span className="font-medium">{emp.fullName}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{emp.email}</td>
                <td className="p-4">{emp.department || <span className="text-muted-foreground/50">Not set</span>}</td>
                <td className="p-4">{emp.designation || <span className="text-muted-foreground/50">Not set</span>}</td>
                <td className="p-4">
                  <Badge variant={emp.isActive ? 'success' : 'destructive'}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(emp)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(emp._id, emp.fullName)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default EmployeeTable;
