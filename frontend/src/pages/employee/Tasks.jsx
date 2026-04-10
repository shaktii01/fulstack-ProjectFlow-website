import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import RefreshButton from '@/components/ui/refresh-button';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { ListTodo, Clock, User as UserIcon, Filter } from 'lucide-react';
import { getTasks, updateTask } from '@/services/taskService';
import { QUERY_KEYS } from '@/constants/queryKeys';

const priorityColors = { low: 'info', medium: 'warning', high: 'destructive', urgent: 'destructive' };
const statusColors = { todo: 'secondary', in_progress: 'warning', review: 'info', done: 'success' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', review: 'In Review', done: 'Done' };

const EmployeeTasks = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const { data: tasks = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.MY_TASKS,
    queryFn: () => getTasks(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_TASKS });
    },
  });

  const myTasks = tasks.filter((t) => t.assignedTo?._id === user?._id);

  const filtered = myTasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">My Tasks</h2>
          <p className="text-muted-foreground">View and update your assigned tasks.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <RefreshButton
            onRefresh={refetch}
            isRefreshing={isFetching}
            className="w-full sm:w-auto"
          />
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 w-full text-xs sm:w-36">
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </Select>
          <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="h-9 w-full text-xs sm:w-36">
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ListTodo className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No tasks found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {myTasks.length === 0
                ? "You don't have any assigned tasks yet."
                : 'No tasks match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card key={task._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedTask(task._id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <Badge variant={priorityColors[task.priority]} className="text-[10px]">{task.priority}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{task.taskType}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{task.project?.name}</span>
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Select
                    value={task.status}
                    onChange={(e) => updateStatusMutation.mutate({ taskId: task._id, status: e.target.value })}
                    className="h-9 w-full text-xs sm:w-36"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default EmployeeTasks;
