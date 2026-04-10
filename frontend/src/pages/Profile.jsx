import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import RefreshButton from '@/components/ui/refresh-button';
import { User, Mail, Phone, Shield, Save, Building2, MapPin, FileText } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
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
            <div className="space-y-5">
              {/* Personal Info */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Information</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="col-span-full flex flex-col items-center gap-3 mb-4 p-4 border rounded-lg bg-muted/20">
                    <ImageUpload
                      currentImage={form.profileImage}
                      onUpload={(url) => setForm({ ...form, profileImage: url })}
                      shape={isCompany ? 'square' : 'circle'}
                      size={88}
                      label={isCompany ? 'Upload company logo' : 'Upload profile picture'}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {isCompany ? 'Company Logo' : 'Profile Picture'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name</label>
                    <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 col-span-full">
                    <label className="text-sm font-medium flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Company Settings - Company Only */}
              {isCompany && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company Settings</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Company Name</label>
                      <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Address</label>
                      <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Company address" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> About / Bio</label>
                      <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell your team about your company..." rows={3} />
                    </div>
                  </div>
                </div>
              )}

              {!isCompany && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Employee Details</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Company</label>
                      <Input value={employeeCompanyName || 'Not assigned yet'} readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> Department</label>
                      <Input value={user?.department || 'Not assigned'} readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-muted-foreground" /> Designation</label>
                      <Input value={user?.designation || 'Not assigned'} readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Address</label>
                      <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-sm font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> About / Bio</label>
                      <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell your company a little about yourself..." rows={3} />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Change Password
                </h4>
                <div className="space-y-3">
                  <Input type="password" placeholder="New password (leave blank to keep current)" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                  <Input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* View Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">{user?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user?.phone || 'Not set'}</p>
                  </div>
                </div>
                {user?.invitationCode && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Invitation Code</p>
                      <p className="text-sm font-mono font-bold text-primary tracking-widest">{user.invitationCode}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Details View */}
              {isCompany && (user?.companyName || user?.address || user?.bio) && (
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user?.companyName && (
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Company</p>
                          <p className="text-sm font-medium">{user.companyName}</p>
                        </div>
                      </div>
                    )}
                    {user?.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="text-sm font-medium">{user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {user?.bio && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">About</p>
                      <p className="text-sm">{user.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {!isCompany && (employeeCompanyName || user?.department || user?.designation || user?.address || user?.bio) && (
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Employee Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {employeeCompanyName && (
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Company</p>
                          <p className="text-sm font-medium">{employeeCompanyName}</p>
                        </div>
                      </div>
                    )}
                    {user?.department && (
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="text-sm font-medium">{user.department}</p>
                        </div>
                      </div>
                    )}
                    {user?.designation && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Designation</p>
                          <p className="text-sm font-medium">{user.designation}</p>
                        </div>
                      </div>
                    )}
                    {user?.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="text-sm font-medium">{user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {user?.bio && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">About</p>
                      <p className="text-sm">{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
