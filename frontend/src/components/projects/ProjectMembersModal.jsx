import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/ui/user-avatar';
import { Mail, Users } from 'lucide-react';

const ProjectMembersModal = ({ open, onClose, project }) => {
  const members = project?.members || [];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogClose />
      <DialogHeader>
        <DialogTitle>
          {project?.name ? `${project.name} Members` : 'Project Members'}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        {!project ? null : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">No members added yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add team members to this project to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
              <span className="text-sm text-muted-foreground">Total members</span>
              <Badge variant="secondary">{members.length}</Badge>
            </div>

            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/40 px-4 py-3"
              >
                <UserAvatar
                  src={member.profileImage}
                  name={member.fullName}
                  alt={member.fullName}
                  className="h-11 w-11 border-border/60 text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.fullName}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectMembersModal;
