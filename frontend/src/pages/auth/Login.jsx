import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/auth/AuthLayout';
import useAuthStore from '@/store/authStore';
import { ROUTE_PATHS } from '@/routes/routePaths';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const user = await login(data);
      if (user.role === 'company') navigate(ROUTE_PATHS.COMPANY_DASHBOARD);
      else navigate(ROUTE_PATHS.EMPLOYEE_DASHBOARD);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed, check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout cardTitle="Welcome back">
      {errorMsg && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium text-center">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <Input
            type="email"
            placeholder="m@example.com"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <Link to={ROUTE_PATHS.FORGOT_PASSWORD} className="text-sm text-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to={ROUTE_PATHS.REGISTER_COMPANY} className="text-primary hover:underline font-medium">
          Register company
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
