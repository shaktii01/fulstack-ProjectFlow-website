import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RefreshButton = ({
  onRefresh,
  isRefreshing = false,
  className,
  label = 'Refresh',
  title = 'Refresh data',
  variant = 'outline',
  size = 'sm',
  showLabel = true,
  hideLabelOnMobile = false,
}) => {
  const [isPending, setIsPending] = useState(false);
  const refreshing = isRefreshing || isPending;

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;

    setIsPending(true);
    try {
      await Promise.resolve(onRefresh());
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={refreshing}
      className={className}
      aria-label={title}
      title={title}
    >
      <RefreshCw
        className={cn(
          'h-4 w-4 shrink-0',
          refreshing && 'animate-spin',
          showLabel && !hideLabelOnMobile && 'mr-2',
          showLabel && hideLabelOnMobile && 'sm:mr-2'
        )}
      />
      {showLabel && (
        <span className={cn(hideLabelOnMobile && 'hidden sm:inline')}>
          {refreshing ? 'Refreshing...' : label}
        </span>
      )}
    </Button>
  );
};

export default RefreshButton;
