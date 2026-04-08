import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Clock, User as UserIcon, MessageSquare, Send, Trash2 } from 'lucide-react';

const priorityColors = { low: 'info', medium: 'warning', high: 'destructive', urgent: 'destructive' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', review: 'In Review', done: 'Done' };

const TaskDetail = ({ taskId, projectId, onClose }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCompany = user?.role === 'company';

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [commentText, setCommentText] = useState('');

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}`);
      return res.data;
    },
  });

  // Permissions logic - must come after task is defined by useQuery
  const isAssignedToMe = task?.assignedTo?._id === user?._id;
  const allowStatusChange = isCompany || isAssignedToMe;

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await api.get(`/comments/task/${taskId}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put(`/tasks/${taskId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/tasks/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text) => {
      const res = await api.post('/comments', { taskId, text });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setCommentText('');
    },
  });

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ status: newStatus });
  };

  const openEdit = () => {
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setEditing(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate(editForm);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this task? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogClose />
      {taskLoading ? (
        <DialogContent className="py-12 text-center text-muted-foreground">Loading task...</DialogContent>
      ) : !task ? (
        <DialogContent className="py-12 text-center text-destructive">Task not found.</DialogContent>
      ) : (
        <>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
              <Badge variant="outline" className="capitalize">{task.taskType}</Badge>
            </div>
            {editing ? (
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-lg font-semibold"
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
          </DialogHeader>

          <DialogContent>
            <div className="space-y-5">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                {editing ? (
                  <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </Select>
                ) : (
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => allowStatusChange && handleStatusChange(key)}
                        disabled={!allowStatusChange}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          task.status === key
                            ? 'bg-primary text-primary-foreground'
                            : allowStatusChange
                              ? 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer'
                              : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    {!allowStatusChange && (
                      <p className="text-[10px] text-muted-foreground mt-1 w-full">Only the assigned employee can change status.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                {editing ? (
                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                )}
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {task.assignedTo && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{task.assignedTo.fullName}</p>
                    </div>
                  </div>
                )}
                {(task.dueDate || editing) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      {editing ? (
                        <Input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className="h-8 text-xs mt-0.5" />
                      ) : (
                        <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}
                {editing && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <Select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isCompany && !editing && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={openEdit}>Edit Task</Button>
                  <Button size="sm" variant="ghost" onClick={handleDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              )}
              {editing && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              )}

              {/* Comments */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Comments ({comments.length})</span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                  {commentsLoading ? (
                    <p className="text-xs text-muted-foreground">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                          {c.user?.fullName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{c.user?.fullName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleComment} className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={addCommentMutation.isPending || !commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default TaskDetail;
