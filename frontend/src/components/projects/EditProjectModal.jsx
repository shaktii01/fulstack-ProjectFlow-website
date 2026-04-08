import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const EditProjectModal = ({ open, onClose, project }) => {
  const queryClient = useQueryClient();
  const [projectForm, setProjectForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (project && open) {
      setProjectForm({
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
      });
    }
  }, [project, open]);

  const updateProjectMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put(`/projects/${project._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to update project'),
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogClose />
      <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
      <DialogContent>
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={projectForm.name || ''} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Input value={projectForm.code || ''} onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value.toUpperCase() })} className="font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={projectForm.description || ''} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={projectForm.startDate || ''} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={projectForm.endDate || ''} onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })} />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => updateProjectMutation.mutate(projectForm)} disabled={updateProjectMutation.isPending}>
          {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditProjectModal;
