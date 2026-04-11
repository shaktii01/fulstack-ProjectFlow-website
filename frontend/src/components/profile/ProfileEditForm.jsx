import React from 'react';
import { User, Mail, Phone, Shield, Building2, MapPin, FileText, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ui/ImageUpload';

const ProfileEditForm = ({
  form,
  setForm,
  passwordForm,
  setPasswordForm,
  user,
  isCompany,
  employeeCompanyName,
  onSave,
  onCancel,
  isPending
}) => {
  return (
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

      {/* Employee Details - Employee Only */}
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
        <Button onClick={onSave} disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
