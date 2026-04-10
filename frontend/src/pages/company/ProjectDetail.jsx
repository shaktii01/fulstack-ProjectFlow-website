import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RefreshButton from '@/components/ui/refresh-button';
import UserAvatar from '@/components/ui/user-avatar';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/projects/CreateTaskModal';
import EditProjectModal from '@/components/projects/EditProjectModal';
import AddMemberModal from '@/components/projects/AddMemberModal';
import KanbanBoard from '@/components/projects/KanbanBoard';
import { ArrowLeft, Plus, Users, Calendar, Trash2 } from 'lucide-react';
import { getCompanyEmployees } from '@/services/companyService';
import { deleteProject, getProjectById } from '@/services/projectService';
import { getTasks } from '@/services/taskService';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTE_PATHS } from '@/routes/routePaths';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCompany = user?.role === 'company';

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const {
    data: project,
    isLoading: projectLoading,
    isFetching: isProjectFetching,
    refetch: refetchProject,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_DETAIL(id),
    queryFn: () => getProjectById(id),
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isFetching: isTasksFetching,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_TASKS(id),
    queryFn: () => getTasks({ projectId: id }),
  });

  const {
    data: employees = [],
    isFetching: isEmployeesFetching,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: QUERY_KEYS.COMPANY_EMPLOYEES,
    queryFn: getCompanyEmployees,
    enabled: isCompany,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DETAIL(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_TASKS }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY_STATS }),
      ]);
      navigate(isCompany ? ROUTE_PATHS.COMPANY_PROJECTS : ROUTE_PATHS.EMPLOYEE_PROJECTS);
    },
  });

  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      deleteProjectMutation.mutate();
    }
  };

  const refreshPage = async () => {
    await Promise.all([
      refetchProject(),
      refetchTasks(),
      isCompany ? refetchEmployees() : Promise.resolve(),
    ]);
  };

  const isRefreshing = isProjectFetching || isTasksFetching || (isCompany && isEmployeesFetching);

  if (projectLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading project...</div>;
  }

  if (!project) {
    return <div className="text-center py-20 text-destructive">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate(isCompany ? ROUTE_PATHS.COMPANY_PROJECTS : ROUTE_PATHS.EMPLOYEE_PROJECTS)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
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
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setEditProjectOpen(true)}>Edit</Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleDeleteProject}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members + Info Bar */}
      <div className="flex flex-wrap gap-4">
        <Card className="min-w-0 flex-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Members ({project.members?.length || 0})</span>
              </div>
              {isCompany && (
                <Button variant="ghost" size="sm" onClick={() => setAddMemberOpen(true)}>
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

      {/* Tasks Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold">Tasks</h3>
        {isCompany && (
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Task
          </Button>
        )}
      </div>

      {tasksLoading ? (
        <div className="text-muted-foreground text-center py-8">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks yet. {isCompany ? 'Create your first task!' : ''}</p>
          </CardContent>
        </Card>
      ) : (
        <KanbanBoard tasks={tasks} projectId={id} onTaskSelect={setSelectedTask} />
      )}

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask}
          projectId={id}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {isCompany && (
        <>
          <CreateTaskModal
            open={createTaskOpen}
            onClose={() => setCreateTaskOpen(false)}
            projectId={id}
            members={project.members}
          />
          <EditProjectModal
            open={editProjectOpen}
            onClose={() => setEditProjectOpen(false)}
            project={project}
          />
          <AddMemberModal
            open={addMemberOpen}
            onClose={() => setAddMemberOpen(false)}
            project={project}
            employees={employees}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetail;
