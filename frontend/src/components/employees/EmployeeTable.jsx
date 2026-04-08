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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
              <tr key={emp._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {emp.fullName.charAt(0)}
                    </div>
                    <span className="font-medium">{emp.fullName}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{emp.email}</td>
                <td className="p-4">{emp.department || <span className="text-muted-foreground/50">—</span>}</td>
                <td className="p-4">{emp.designation || <span className="text-muted-foreground/50">—</span>}</td>
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
