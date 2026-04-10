import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { resetPassword as resetPasswordRequest } from '@/services/authService';
import { ROUTE_PATHS } from '@/routes/routePaths';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      await resetPasswordRequest(token, { password: data.password });
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTE_PATHS.LOGIN);
      }, 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. The link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-emerald-500/10 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Password Reset Successfully</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Redirecting you to login...
                  </p>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => navigate(ROUTE_PATHS.LOGIN)}>
                    Go to Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Enter your new password below.
                </p>
                {errorMsg && (
                  <div className="mb-4 p-3 flex items-start gap-2 bg-destructive/10 text-destructive text-sm rounded-md font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Resetting password...' : 'Reset Password'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
