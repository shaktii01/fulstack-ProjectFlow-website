import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { User, Mail, Phone, Shield, Save, Building2, MapPin, FileText } from 'lucide-react';
import ImageUpload from '../components/ui/ImageUpload';

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

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/profile', data);
      return res.data;
    },
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your {isCompany ? 'company & ' : ''}account settings.</p>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden border border-border/50">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="capitalize">{user?.role}</Badge>
                  {isCompany && user?.companyName && (
                    <span className="text-sm text-muted-foreground">{user.companyName}</span>
                  )}
                </div>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
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

              <div className="flex gap-2 pt-4">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
