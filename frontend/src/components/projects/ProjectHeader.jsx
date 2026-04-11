import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RefreshButton from '@/components/ui/refresh-button';

const ProjectHeader = ({
  project,
  isCompany,
  refreshPage,
  isRefreshing,
  onBack,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="font-mono">{project.code}</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{project.name}</h2>
          </div>
          {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <RefreshButton
            onRefresh={refreshPage}
            isRefreshing={isRefreshing}
            className="w-full sm:w-auto"
          />
          {isCompany && (
            <>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onEdit}>Edit</Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
