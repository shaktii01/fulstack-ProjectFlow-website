import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
  onClick,
  compact = false,
  className,
}) => (
  <Card
    className={cn(
      onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : '',
      compact ? 'min-w-[170px] sm:min-w-[190px]' : '',
      'transition-all',
      className
    )}
    onClick={onClick}
  >
    <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', compact ? 'px-4 pt-4 pb-1' : '')}>
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${
        variant === 'purple' ? 'bg-purple-500/10' :
        variant === 'green' ? 'bg-emerald-500/10' :
        variant === 'amber' ? 'bg-amber-500/10' :
        variant === 'red' ? 'bg-red-500/10' :
        variant === 'blue' ? 'bg-blue-500/10' :
        'bg-muted'
      }`}>
        <Icon className={`h-4 w-4 ${
          variant === 'purple' ? 'text-purple-400' :
          variant === 'green' ? 'text-emerald-400' :
          variant === 'amber' ? 'text-amber-400' :
          variant === 'red' ? 'text-red-400' :
          variant === 'blue' ? 'text-blue-400' :
          'text-muted-foreground'
        }`} />
      </div>
    </CardHeader>
    <CardContent className={cn(compact ? 'px-4 pb-4 pt-0' : '')}>
      <div className={cn('font-bold', compact ? 'text-2xl' : 'text-3xl')}>{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default StatCard;
