'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/Toaster';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'JOB_SEEKER' as 'JOB_SEEKER' | 'EMPLOYER' | 'FREELANCER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      toast.success('Welcome to Beleqet!', 'Your account has been created successfully');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || 'Please try again';
      toast.error('Registration failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pageBg flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-brandGreen to-darkGreen"></div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Join Beleqet Community</h3>
            <p className="text-xl opacity-90 mb-8">
              Start your career journey with Ethiopia's leading job platform
            </p>
            <div className="space-y-4 text-left max-w-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <span>AI-powered job matching</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <span>Instant Telegram job alerts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <span>Verified employers only</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <span>Freelance opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink">Create account</h2>
            <p className="mt-2 text-muted">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-brandGreen hover:text-darkGreen">
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`cursor-pointer border rounded-lg p-3 text-center text-sm font-medium transition-colors ${
                    formData.role === 'JOB_SEEKER' 
                      ? 'border-brandGreen bg-brandGreen bg-opacity-10 text-brandGreen' 
                      : 'border-border text-muted hover:border-brandGreen'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="JOB_SEEKER"
                      checked={formData.role === 'JOB_SEEKER'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <User className="w-5 h-5 mx-auto mb-1" />
                    Job Seeker
                  </label>
                  <label className={`cursor-pointer border rounded-lg p-3 text-center text-sm font-medium transition-colors ${
                    formData.role === 'EMPLOYER' 
                      ? 'border-brandGreen bg-brandGreen bg-opacity-10 text-brandGreen' 
                      : 'border-border text-muted hover:border-brandGreen'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="EMPLOYER"
                      checked={formData.role === 'EMPLOYER'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Users className="w-5 h-5 mx-auto mb-1" />
                    Employer
                  </label>
                  <label className={`cursor-pointer border rounded-lg p-3 text-center text-sm font-medium transition-colors ${
                    formData.role === 'FREELANCER' 
                      ? 'border-brandGreen bg-brandGreen bg-opacity-10 text-brandGreen' 
                      : 'border-border text-muted hover:border-brandGreen'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="FREELANCER"
                      checked={formData.role === 'FREELANCER'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <User className="w-5 h-5 mx-auto mb-1" />
                    Freelancer
                  </label>
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-ink mb-2">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-ink mb-2">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-brandGreen focus:ring-brandGreen border-border rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-muted">
                I agree to the{' '}
                <Link href="/terms" className="text-brandGreen hover:text-darkGreen">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-brandGreen hover:text-darkGreen">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brandGreen hover:bg-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandGreen disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}