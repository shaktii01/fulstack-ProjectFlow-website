import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const AuthLayout = ({ title, subtitle = "Manage tasks, collaborate efficiently.", cardTitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">{title || 'ProjectFlow'}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>
        
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
