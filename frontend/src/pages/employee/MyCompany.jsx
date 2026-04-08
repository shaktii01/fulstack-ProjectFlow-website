import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RefreshButton from '@/components/ui/refresh-button';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  User,
  BriefcaseBusiness,
  FileText,
} from 'lucide-react';

const messageStyles = {
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
};

const JoinRequestForm = ({
  invitationCode,
  onCodeChange,
  onSubmit,
  isPending,
  message,
  title,
  description,
  buttonLabel,
}) => (
  <div className="rounded-xl border border-border/70 bg-background/40 p-5">
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>

    {message.text && (
      <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${messageStyles[message.type]}`}>
        {message.text}
      </div>
    )}

    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Company Invitation Code</label>
        <Input
          value={invitationCode}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Enter company code"
          className="font-mono uppercase tracking-[0.3em]"
          maxLength={16}
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </Button>
    </form>
  </div>
);

const MyCompany = () => {
  const queryClient = useQueryClient();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [invitationCode, setInvitationCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['myCompany'],
    queryFn: async () => {
      const res = await api.get('/profile/my-company');
      return res.data;
    },
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 10000 : false),
  });

  useEffect(() => {
    if (data?.status === 'accepted') {
      checkAuth();
    }
  }, [data?.status, checkAuth]);

  useEffect(() => {
    if (data?.status === 'pending' || data?.status === 'accepted') {
      setInvitationCode('');
      setMessage({ type: '', text: '' });
    }
  }, [data?.status]);

  const requestMutation = useMutation({
    mutationFn: async (code) => {
      const res = await api.post('/profile/my-company/request', { invitationCode: code });
      return res.data;
    },
    onSuccess: async (response) => {
      setMessage({ type: 'success', text: response.message || 'Join request sent successfully.' });
      setInvitationCode('');
      await queryClient.invalidateQueries({ queryKey: ['myCompany'] });
    },
    onError: (error) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send join request',
      });
    },
  });

  const handleRequestSubmit = (event) => {
    event.preventDefault();

    const normalizedCode = invitationCode.trim().toUpperCase();

    if (!normalizedCode) {
      setMessage({ type: 'error', text: 'Please enter a company invitation code.' });
      return;
    }

    requestMutation.mutate(normalizedCode);
  };

  const heading = useMemo(() => ({
    title: 'My Company',
    subtitle: 'Your organization details.',
  }), []);

  const PageHeader = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading.title}</h2>
        <p className="text-muted-foreground">{heading.subtitle}</p>
      </div>
      <RefreshButton
        onRefresh={refetch}
        isRefreshing={isFetching}
        className="w-full sm:w-auto"
      />
    </div>
  );

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
      <div className="max-w-4xl space-y-6">
        <PageHeader />

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
      </div>
    );
  }

  // Pending
  if (data?.status === 'pending') {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader />

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold">Request Pending</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Your request to join <span className="font-semibold text-foreground">{data.companyName}</span> is being reviewed.
              Once the company accepts it, this page will update automatically. You can also use refresh anytime to check for the latest status.
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
        <PageHeader />

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold">Request Rejected</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Your request to join <span className="font-semibold text-foreground">{data.companyName}</span> was not accepted.
              You can try again by entering a company invitation code below.
            </p>
            <Badge variant="destructive" className="mt-4">Rejected</Badge>
          </CardContent>
        </Card>

        <JoinRequestForm
          invitationCode={invitationCode}
          onCodeChange={(value) => {
            setInvitationCode(value.toUpperCase());
            if (message.text) setMessage({ type: '', text: '' });
          }}
          onSubmit={handleRequestSubmit}
          isPending={requestMutation.isPending}
          message={message}
          title="Send Another Request"
          description="Enter a valid company code to send a new request. Once a company accepts it, this input will disappear automatically."
          buttonLabel="Send Request"
        />
      </div>
    );
  }

  // No company
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader />

      <Card>
        <CardContent className="py-16 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No Company</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You have not joined a company yet. Enter a company invitation code below to send a join request.
          </p>
        </CardContent>
      </Card>

      <JoinRequestForm
        invitationCode={invitationCode}
        onCodeChange={(value) => {
          setInvitationCode(value.toUpperCase());
          if (message.text) setMessage({ type: '', text: '' });
        }}
        onSubmit={handleRequestSubmit}
        isPending={requestMutation.isPending}
        message={message}
        title="Request to Join a Company"
        description="Type the company invitation code and we will send a join request for approval."
        buttonLabel="Send Request"
      />
    </div>
  );
};

export default MyCompany;
