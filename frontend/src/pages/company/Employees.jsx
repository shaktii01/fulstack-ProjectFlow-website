import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import EmployeeTable from '../../components/employees/EmployeeTable';
import EditEmployeeModal from '../../components/employees/EditEmployeeModal';

const Employees = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({ open: false, employee: null });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['companyEmployees'],
    queryFn: async () => {
      const res = await api.get('/company/employees');
      return res.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/company/employees/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['companyStats'] });
    },
  });

  const openEdit = (emp) => {
    setEditModal({ open: true, employee: emp });
  };

  const handleRemove = (id, name) => {
    if (window.confirm(`Remove ${name} from your company? This action cannot be undone.`)) {
      removeMutation.mutate(id);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage your team members.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <EmployeeTable 
        employees={filtered} 
        onEdit={openEdit} 
        onRemove={handleRemove} 
      />

      <EditEmployeeModal 
        open={editModal.open} 
        employee={editModal.employee} 
        onClose={() => setEditModal({ open: false, employee: null })} 
      />
    </div>
  );
};

export default Employees;
