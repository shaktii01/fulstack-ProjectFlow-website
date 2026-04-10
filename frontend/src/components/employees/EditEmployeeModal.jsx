import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateCompanyEmployee } from '@/services/companyService';
import { QUERY_KEYS } from '@/constants/queryKeys';

const EditEmployeeModal = ({ open, onClose, employee }) => {
  const queryClient = useQueryClient();
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (employee && open) {
      setEditForm({
        fullName: employee.fullName || '',
        phone: employee.phone || '',
        department: employee.department || '',
        designation: employee.designation || '',
      });
    }
  }, [employee, open]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCompanyEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY_EMPLOYEES });
      onClose();
    },
  });

  const handleSaveEdit = () => {
    if (!employee) return;
    updateMutation.mutate({ id: employee._id, data: editForm });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogClose />
      <DialogHeader>
        <DialogTitle>Edit Employee</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input value={editForm.fullName || ''} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} placeholder="e.g. Engineering" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Designation</label>
            <Input value={editForm.designation || ''} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} placeholder="e.g. Senior Developer" />
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditEmployeeModal;
