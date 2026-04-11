import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, Loader2, XCircle } from 'lucide-react';
import JoinRequestForm from './JoinRequestForm';

export const JoinRequestPending = ({ companyName }) => (
  <Card>
    <CardContent className="py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
      </div>
      <h3 className="text-lg font-semibold">Request Pending</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
        Your request to join <span className="font-semibold text-foreground">{companyName}</span> is being reviewed.
        Once the company accepts it, this page will update automatically. You can also use refresh anytime to check for the latest status.
      </p>
      <Badge variant="warning" className="mt-4">
        <Clock className="h-3 w-3 mr-1" /> Awaiting Approval
      </Badge>
    </CardContent>
  </Card>
);

export const JoinRequestRejected = ({
  companyName,
  invitationCode,
  setInvitationCode,
  message,
  setMessage,
  handleRequestSubmit,
  isPending,
}) => (
  <div className="space-y-6">
    <Card>
      <CardContent className="py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold">Request Rejected</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Your request to join <span className="font-semibold text-foreground">{companyName}</span> was not accepted.
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
      isPending={isPending}
      message={message}
      title="Send Another Request"
      description="Enter a valid company code to send a new request."
      buttonLabel="Send Request"
    />
  </div>
);

export const NoCompanyState = ({
  invitationCode,
  setInvitationCode,
  message,
  setMessage,
  handleRequestSubmit,
  isPending,
}) => (
  <div className="space-y-6">
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
      isPending={isPending}
      message={message}
      title="Request to Join a Company"
      description="Type the company invitation code and we will send a join request for approval."
      buttonLabel="Send Request"
    />
  </div>
);
