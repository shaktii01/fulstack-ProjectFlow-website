import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { updateProject } from '@/services/projectService';
import { QUERY_KEYS } from '@/constants/queryKeys';

const AddMemberModal = ({ open, onClose, project, employees }) => {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState('');
  const [error, setError] = useState('');

  const addMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      const currentMembers = project.members.map(m => m._id);
      return updateProject(project._id, { members: [...currentMembers, memberId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DETAIL(project._id) });
      resetAndClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to add member'),
  });

  const availableToAdd = employees?.filter(
    (e) => !project?.members?.some((m) => m._id === e._id)
  ) || [];

  const resetAndClose = () => {
    setSelectedMember('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose}>
      <DialogClose />
      <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
      <DialogContent>
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
        {availableToAdd.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">All employees are already members of this project.</p>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employee</label>
            <Select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">Choose an employee...</option>
              {availableToAdd.map((e) => (
                <option key={e._id} value={e._id}>{e.fullName} ({e.email})</option>
              ))}
            </Select>
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
        <Button onClick={() => addMemberMutation.mutate(selectedMember)} disabled={!selectedMember || addMemberMutation.isPending}>
          {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddMemberModal;
