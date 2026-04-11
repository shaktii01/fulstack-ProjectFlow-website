import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';

const CompanyProfileView = ({ company }) => (
  <div className="grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col items-start gap-4 border-b pb-6 sm:flex-row sm:items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden border border-border/50 shrink-0">
            {company.profileImage ? (
              <img src={company.profileImage} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              company.companyName?.charAt(0) || 'C'
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">{company.companyName}</h3>
            <Badge variant="success" className="mt-1">
              <CheckCircle className="h-3 w-3 mr-1" /> Active Member
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Admin</p>
              <p className="text-sm font-medium">{company.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{company.email}</p>
            </div>
          </div>

          {company.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{company.phone}</p>
              </div>
            </div>
          )}

          {company.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{company.address}</p>
              </div>
            </div>
          )}

          {company.bio && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">About</p>
              <p className="text-sm">{company.bio}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Company Since</p>
              <p className="text-sm font-medium">
                {new Date(company.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default CompanyProfileView;
