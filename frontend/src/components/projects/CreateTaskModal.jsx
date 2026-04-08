import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';

const CreateTaskModal = ({ open, onClose, projectId, members }) => {
  const queryClient = useQueryClient();
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', taskType: 'task', assignedTo: '', dueDate: '' });
  const [error, setError] = useState('');

  const createTaskMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/tasks', { ...data, project: projectId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      resetAndClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create task'),
  });

  const resetAndClose = () => {
    setTaskForm({ title: '', description: '', priority: 'medium', taskType: 'task', assignedTo: '', dueDate: '' });
    setError('');
    onClose();
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title) { setError('Task title is required'); return; }
    const payload = { ...taskForm };
    if (!payload.assignedTo) delete payload.assignedTo;
    createTaskMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={resetAndClose}>
      <DialogClose />
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
        <form id="create-task-form" onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g. Implement login page" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Describe what needs to be done..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={taskForm.taskType} onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <Select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
        <Button type="submit" form="create-task-form" disabled={createTaskMutation.isPending}>
          {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateTaskModal;
