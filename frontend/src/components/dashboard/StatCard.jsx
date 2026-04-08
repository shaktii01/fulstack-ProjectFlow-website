import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const StatCard = ({ title, value, icon: Icon, description, variant = 'default', onClick }) => (
  <Card className={`${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''} transition-all`} onClick={onClick}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default StatCard;
