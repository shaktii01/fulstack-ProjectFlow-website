import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/user-avatar';
import { Users, Plus, Calendar } from 'lucide-react';

const ProjectInfoBar = ({ project, isCompany, onAddMember }) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Card className="min-w-0 flex-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Members ({project.members?.length || 0})</span>
            </div>
            {isCompany && (
              <Button variant="ghost" size="sm" onClick={onAddMember}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {project.members?.map((m) => (
              <div key={m._id} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full text-xs">
                <UserAvatar
                  src={m.profileImage}
                  name={m.fullName}
                  alt={m.fullName}
                  className="h-5 w-5 bg-primary/20 text-[10px]"
                />
                <span>{m.fullName}</span>
              </div>
            ))}
            {(!project.members || project.members.length === 0) && (
              <p className="text-xs text-muted-foreground">No members assigned yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {project.startDate && (
        <Card className="w-full sm:w-auto sm:min-w-[150px]">
          <CardContent className="p-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Start: </span>
              <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {project.endDate && (
        <Card className="w-full sm:w-auto sm:min-w-[150px]">
          <CardContent className="p-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">End: </span>
              <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectInfoBar;
