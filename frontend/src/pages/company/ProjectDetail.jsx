import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/projects/CreateTaskModal';
import EditProjectModal from '@/components/projects/EditProjectModal';
import AddMemberModal from '@/components/projects/AddMemberModal';
import KanbanBoard from '@/components/projects/KanbanBoard';
import ProjectHeader from '@/components/projects/ProjectHeader';
import ProjectInfoBar from '@/components/projects/ProjectInfoBar';
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
      <ProjectHeader
        project={project}
        isCompany={isCompany}
        refreshPage={refreshPage}
        isRefreshing={isRefreshing}
        onBack={() => navigate(isCompany ? ROUTE_PATHS.COMPANY_PROJECTS : ROUTE_PATHS.EMPLOYEE_PROJECTS)}
        onEdit={() => setEditProjectOpen(true)}
        onDelete={handleDeleteProject}
      />

      <ProjectInfoBar
        project={project}
        isCompany={isCompany}
        onAddMember={() => setAddMemberOpen(true)}
      />

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
