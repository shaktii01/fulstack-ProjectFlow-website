import React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export default JoinRequestForm;
