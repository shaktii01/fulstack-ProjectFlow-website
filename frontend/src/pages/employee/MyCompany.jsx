import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import RefreshButton from '@/components/ui/refresh-button';
import CompanyProfileView from '@/components/company/CompanyProfileView';
import { JoinRequestPending, JoinRequestRejected, NoCompanyState } from '@/components/company/CompanyStatusCards';
import { getMyCompanyProfile, requestToJoinCompany } from '@/services/profileService';
import { QUERY_KEYS } from '@/constants/queryKeys';

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
    queryKey: QUERY_KEYS.MY_COMPANY,
    queryFn: getMyCompanyProfile,
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
    mutationFn: requestToJoinCompany,
    onSuccess: async (response) => {
      setMessage({ type: 'success', text: response.message || 'Join request sent successfully.' });
      setInvitationCode('');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_COMPANY });
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

  const PageHeader = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">My Company</h2>
        <p className="text-muted-foreground">Your organization details.</p>
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
    return (
      <div className="max-w-4xl space-y-6">
        <PageHeader />
        <CompanyProfileView company={data.company} />
      </div>
    );
  }

  // Pending
  if (data?.status === 'pending') {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader />
        <JoinRequestPending companyName={data.companyName} />
      </div>
    );
  }

  // Rejected
  if (data?.status === 'rejected') {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader />
        <JoinRequestRejected
          companyName={data.companyName}
          invitationCode={invitationCode}
          setInvitationCode={setInvitationCode}
          message={message}
          setMessage={setMessage}
          handleRequestSubmit={handleRequestSubmit}
          isPending={requestMutation.isPending}
        />
      </div>
    );
  }

  // No company
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader />
      <NoCompanyState
        invitationCode={invitationCode}
        setInvitationCode={setInvitationCode}
        message={message}
        setMessage={setMessage}
        handleRequestSubmit={handleRequestSubmit}
        isPending={requestMutation.isPending}
      />
    </div>
  );
};

export default MyCompany;
