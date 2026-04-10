import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '@/components/ui/button';
import RefreshButton from '@/components/ui/refresh-button';
import UserAvatar from '@/components/ui/user-avatar';
import { Inbox, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getCompanyJoinRequests, updateCompanyJoinRequest } from '@/services/companyService';
import { QUERY_KEYS } from '@/constants/queryKeys';

const JoinRequests = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.COMPANY_REQUESTS,
    queryFn: getCompanyJoinRequests,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => updateCompanyJoinRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY_REQUESTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY_EMPLOYEES });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Join Requests</h2>
          <p className="text-muted-foreground">Review and manage employee join requests.</p>
        </div>
        <RefreshButton
          onRefresh={refetch}
          isRefreshing={isFetching}
          className="w-full sm:w-auto"
        />
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No pending requests</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All join requests have been processed. New employees can request to join using your invitation code.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card key={req._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      src={req.employeeId?.profileImage}
                      name={req.employeeId?.fullName}
                      alt={req.employeeId?.fullName}
                      className="h-12 w-12 text-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-base">{req.employeeId?.fullName || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">{req.employeeId?.email || 'No email'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Requested {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => updateMutation.mutate({ id: req._id, status: 'accepted' })}
                      disabled={updateMutation.isPending}
                      className="flex-1 sm:flex-none"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateMutation.mutate({ id: req._id, status: 'rejected' })}
                      disabled={updateMutation.isPending}
                      className="flex-1 sm:flex-none"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinRequests;
