import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RefreshButton from '@/components/ui/refresh-button';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileViewInfo from '@/components/profile/ProfileViewInfo';
import { updateProfile as updateProfileRequest } from '@/services/profileService';

const Profile = () => {
  const { user, checkAuth } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    bio: user?.bio || '',
    address: user?.address || '',
    profileImage: user?.profileImage || '',
  });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const isCompany = user?.role === 'company';
  const employeeCompanyName =
    typeof user?.companyId === 'object' ? user?.companyId?.companyName : user?.companyName;

  const updateMutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setEditing(false);
      checkAuth();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    },
  });

  const handleSave = () => {
    const payload = { ...form };
    if (passwordForm.password) {
      if (passwordForm.password !== passwordForm.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return;
      }
      if (passwordForm.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }
      payload.password = passwordForm.password;
    }
    updateMutation.mutate(payload);
  };

  const startEditing = () => {
    setForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
      companyName: user?.companyName || '',
      bio: user?.bio || '',
      address: user?.address || '',
    });
    setPasswordForm({ password: '', confirmPassword: '' });
    setEditing(true);
  };

  const refreshProfile = async () => {
    setMessage({ type: '', text: '' });
    setEditing(false);
    setPasswordForm({ password: '', confirmPassword: '' });
    await checkAuth();

    const latestUser = useAuthStore.getState().user;
    setForm({
      fullName: latestUser?.fullName || '',
      email: latestUser?.email || '',
      phone: latestUser?.phone || '',
      profileImage: latestUser?.profileImage || '',
      companyName: latestUser?.companyName || '',
      bio: latestUser?.bio || '',
      address: latestUser?.address || '',
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h2>
          <p className="text-muted-foreground">Manage your {isCompany ? 'company & ' : ''}account settings.</p>
        </div>
        <RefreshButton onRefresh={refreshProfile} className="w-full sm:w-auto" />
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden border border-border/50">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">{user?.fullName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="capitalize">{user?.role}</Badge>
                  {isCompany && user?.companyName && (
                    <span className="text-sm text-muted-foreground">{user.companyName}</span>
                  )}
                </div>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={startEditing}>
                Edit Settings
              </Button>
            )}
          </div>

          {editing ? (
            <ProfileEditForm
              form={form}
              setForm={setForm}
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              user={user}
              isCompany={isCompany}
              employeeCompanyName={employeeCompanyName}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              isPending={updateMutation.isPending}
            />
          ) : (
            <ProfileViewInfo
              user={user}
              isCompany={isCompany}
              employeeCompanyName={employeeCompanyName}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
