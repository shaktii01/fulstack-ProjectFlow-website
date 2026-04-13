import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/ui/user-avatar';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Clock, User as UserIcon, MessageSquare, Send, Trash2, Paperclip, X, FileText, Image as ImageIcon, Video, Download } from 'lucide-react';
import { getTaskComments, addTaskComment } from '@/services/commentService';
import { getTaskById, updateTask, deleteTask } from '@/services/taskService';
import { uploadMedia } from '@/services/uploadService';
import { QUERY_KEYS } from '@/constants/queryKeys';

const priorityColors = { low: 'info', medium: 'warning', high: 'destructive', urgent: 'destructive' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', review: 'In Review', done: 'Done' };

const TaskDetail = ({ taskId, projectId, onClose }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCompany = user?.role === 'company';

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [commentText, setCommentText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const invalidateTaskQueries = async () => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK_DETAIL(taskId) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_TASKS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY_STATS }),
    ];

    if (projectId) {
      invalidations.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(projectId) }));
    }

    await Promise.all(invalidations);
  };

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: QUERY_KEYS.TASK_DETAIL(taskId),
    queryFn: () => getTaskById(taskId),
  });

  // Permissions logic - must come after task is defined by useQuery
  const isAssignedToMe = task?.assignedTo?._id === user?._id;
  const allowStatusChange = isCompany || isAssignedToMe;

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: QUERY_KEYS.COMMENTS(taskId),
    queryFn: () => getTaskComments(taskId),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateTask(taskId, data),
    onSuccess: async () => {
      await invalidateTaskQueries();
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: async () => {
      await invalidateTaskQueries();
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (payload) => addTaskComment({ taskId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS(taskId) });
      setCommentText('');
      setSelectedFiles([]);
      setIsUploading(false);
    },
    onError: () => {
      setIsUploading(false);
    }
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

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      let mediaArray = [];
      
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => uploadMedia(file));
        const results = await Promise.all(uploadPromises);
        mediaArray = results.map(res => ({
          url: res.url,
          type: res.type,
          name: res.name
        }));
      }

      addCommentMutation.mutate({ 
        text: commentText.trim(),
        media: mediaArray
      });
    } catch (error) {
      console.error('Failed to upload files:', error);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(f => 
        f.type.startsWith('image/') || 
        f.type.startsWith('video/') || 
        f.type === 'application/pdf'
      );
      
      const newFiles = [...selectedFiles, ...validFiles];
      if (newFiles.length > 5) {
        alert('You can only attach up to 5 files at once.');
        return;
      }
      
      setSelectedFiles(newFiles);
    }
    e.target.value = null; // reset input
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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
              <div className="grid gap-4 text-sm sm:grid-cols-2">
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
                <div className="flex flex-col gap-2 border-t pt-2 sm:flex-row">
                  <Button size="sm" variant="outline" onClick={openEdit}>Edit Task</Button>
                  <Button size="sm" variant="ghost" onClick={handleDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              )}
              {editing && (
                <div className="flex flex-col gap-2 border-t pt-2 sm:flex-row">
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
                        <UserAvatar
                          src={c.user?.profileImage}
                          name={c.user?.fullName}
                          alt={c.user?.fullName}
                          className="mt-0.5 h-7 w-7 text-[10px]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{c.user?.fullName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{c.text}</p>
                          {c.media && c.media.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm">
                              {c.media.map((item, i) => (
                                <div key={i} className="relative rounded overflow-hidden border bg-muted/30">
                                  {item.type === 'image' && (
                                    <a href={item.url} target="_blank" rel="noreferrer">
                                      <img src={item.url} alt={item.name} className="w-full h-24 object-cover hover:opacity-90" />
                                    </a>
                                  )}
                                  {item.type === 'video' && (
                                    <video src={item.url} controls className="w-full h-24 object-cover" />
                                  )}
                                  {item.type === 'pdf' && (
                                    <a href={item.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center h-24 p-2 text-center hover:bg-muted/50">
                                      <FileText className="h-6 w-6 text-destructive mb-1" />
                                      <span className="text-[10px] truncate w-full" title={item.name}>{item.name || 'Document.pdf'}</span>
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-muted/50 px-2 py-1.5 rounded-md border text-xs relative max-w-[150px]">
                        {file.type.startsWith('image/') ? <ImageIcon className="h-3 w-3 shrink-0" /> : file.type.startsWith('video/') ? <Video className="h-3 w-3 shrink-0" /> : <FileText className="h-3 w-3 shrink-0 text-destructive" />}
                        <span className="truncate flex-1">{file.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground shrink-0 rounded-full bg-background border ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleComment} className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="pr-10"
                    />
                    <div className="absolute right-1 top-1 bottom-1">
                      <label htmlFor="media-upload" className="flex items-center justify-center h-full px-2 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </label>
                      <input 
                        id="media-upload" 
                        type="file" 
                        multiple 
                        accept="image/*,video/*,application/pdf" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  <Button type="submit" size="icon" className="w-full sm:w-10" disabled={isUploading || addCommentMutation.isPending || (!commentText.trim() && selectedFiles.length === 0)}>
                    {isUploading ? <span className="animate-spin text-xs">...</span> : <Send className="h-4 w-4" />}
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
