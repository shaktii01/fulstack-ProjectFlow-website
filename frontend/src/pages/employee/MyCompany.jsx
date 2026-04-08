import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Mail, Phone, MapPin, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const MyCompany = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myCompany'],
    queryFn: async () => {
      const res = await api.get('/profile/my-company');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Accepted - Show full company details
  if (data?.status === 'accepted' && data.company) {
    const company = data.company;
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Company</h2>
          <p className="text-muted-foreground">Your organization details.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
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
                  <p className="text-xs text-muted-foreground">Member Since</p>
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
  }

  // Pending
  if (data?.status === 'pending') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Company</h2>
          <p className="text-muted-foreground">Your organization details.</p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold">Request Pending</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Your request to join <span className="font-semibold text-foreground">{data.companyName}</span> is being reviewed.
              You'll be notified once the company admin accepts your request.
            </p>
            <Badge variant="warning" className="mt-4">
              <Clock className="h-3 w-3 mr-1" /> Awaiting Approval
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rejected
  if (data?.status === 'rejected') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Company</h2>
          <p className="text-muted-foreground">Your organization details.</p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold">Request Rejected</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Your request to join <span className="font-semibold text-foreground">{data.companyName}</span> was not accepted.
              Please contact the company admin for more details.
            </p>
            <Badge variant="destructive" className="mt-4">Rejected</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No company
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Company</h2>
        <p className="text-muted-foreground">Your organization details.</p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No Company</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You haven't joined a company yet. Register with a company invitation code to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCompany;
