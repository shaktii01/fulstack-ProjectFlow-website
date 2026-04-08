import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/auth/AuthLayout';
import useAuthStore from '@/store/authStore';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  invitationCode: z.string().min(1, { message: 'Company invitation code is required' }),
  phone: z.string().optional(),
});

const RegisterEmployee = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const registerEmployee = useAuthStore((state) => state.registerEmployee);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg('');
      await registerEmployee(data);
      // Wait for company approval, so dashboard might be empty, but they're logged in
      navigate('/employee/dashboard');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      subtitle="Join your team's workspace." 
      cardTitle="Employee Registration"
    >
      {errorMsg && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium text-center">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Full Name</label>
          <Input
            type="text"
            placeholder="Jane Doe"
            {...register('fullName')}
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-primary">Invitation Code</label>
          <Input
            type="text"
            placeholder="e.g. 8A3F122B"
            {...register('invitationCode')}
            className={`font-mono tracking-widest uppercase ${errors.invitationCode ? 'border-destructive' : 'border-primary'}`}
          />
          {errors.invitationCode && <p className="text-xs text-destructive">{errors.invitationCode.message}</p>}
          <p className="text-[10px] text-muted-foreground">Get this code from your company administrator.</p>
        </div>

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

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Phone (optional)</label>
          <Input
            type="text"
            placeholder="123-456-7890"
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Joining workspace...' : 'Register'}
        </Button>
      </form>

      <div className="mt-6 flex flex-col space-y-2 text-center text-sm text-muted-foreground">
        <div>
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
        <div>
          Want to create a workspace?{' '}
          <Link to="/register/company" className="text-primary hover:underline font-medium">
            Register Company
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterEmployee;
