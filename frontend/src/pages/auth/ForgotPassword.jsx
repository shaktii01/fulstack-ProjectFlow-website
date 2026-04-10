import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '@/services/authService';
import { ROUTE_PATHS } from '@/routes/routePaths';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccess(false);
      await requestPasswordReset(data);
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send reset link. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Link to={ROUTE_PATHS.LOGIN} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
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
                  <h3 className="font-semibold text-lg">Check your email</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    We've sent a password reset link to your email address. It will expire in 10 minutes.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                {errorMsg && (
                  <div className="mb-4 p-3 flex items-start gap-2 bg-destructive/10 text-destructive text-sm rounded-md font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Email</label>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending link...' : 'Send Reset Link'}
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

export default ForgotPassword;
