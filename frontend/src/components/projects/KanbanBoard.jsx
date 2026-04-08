import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User as UserIcon, GripVertical } from 'lucide-react';
import useAuthStore from './../../store/authStore';

const priorityColors = { low: 'info', medium: 'warning', high: 'destructive', urgent: 'destructive' };
const statusColors = { todo: 'secondary', in_progress: 'warning', review: 'info', done: 'success' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', review: 'In Review', done: 'Done' };

const KanbanBoard = ({ tasks, projectId, onTaskSelect }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCompany = user?.role === 'company';

  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const dragStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const res = await api.put(`/tasks/${taskId}`, { status });
      return res.data;
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData(['tasks', projectId]);
      queryClient.setQueryData(['tasks', projectId], (old) =>
        old?.map((t) => t._id === taskId ? { ...t, status } : t)
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks', projectId], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const canDrag = (task) => {
    if (isCompany) return true;
    return task.assignedTo?._id === user?._id;
  };

  const handleDragStart = (e, task) => {
    if (!canDrag(task)) { e.preventDefault(); return; }
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    requestAnimationFrame(() => {
      e.target.style.opacity = '0.4';
    });
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) setDragOverColumn(status);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverColumn(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTask && draggedTask.status !== newStatus) {
      dragStatusMutation.mutate({ taskId: draggedTask._id, status: newStatus });
    }
    setDraggedTask(null);
  };

  const grouped = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(grouped).map(([status, statusTasks]) => (
        <div
          key={status}
          className={`space-y-3 rounded-xl p-3 transition-all duration-200 ${
            dragOverColumn === status
              ? 'bg-primary/5 ring-2 ring-primary/30 ring-dashed scale-[1.01]'
              : 'bg-transparent'
          }`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[status]}>{statusLabels[status]}</Badge>
            <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
          </div>
          <div className="space-y-2 min-h-[60px]">
            {statusTasks.map((task) => (
              <Card
                key={task._id}
                className={`hover:shadow-md transition-all select-none ${
                  canDrag(task) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                } ${
                  draggedTask?._id === task._id ? 'opacity-40 scale-95' : ''
                }`}
                draggable={canDrag(task)}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onClick={() => onTaskSelect(task._id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                      <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
                    </div>
                    <Badge variant={priorityColors[task.priority]} className="text-[10px] shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pl-5">
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        <span>{task.assignedTo.fullName}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {statusTasks.length === 0 && (
              <div className={`border-2 border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground transition-colors ${
                dragOverColumn === status ? 'border-primary/40 bg-primary/5 text-primary' : 'border-muted'
              }`}>
                {dragOverColumn === status ? 'Drop here' : 'No tasks'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
