import React from 'react';
import { User, Mail, Phone, Shield, Building2, MapPin } from 'lucide-react';

const ProfileViewInfo = ({ user, isCompany, employeeCompanyName }) => {
  return (
    <div className="space-y-4">
      {/* Basic View */}
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

      {/* Employee Details View */}
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
  );
};

export default ProfileViewInfo;
