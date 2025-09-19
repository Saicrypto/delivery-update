import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'developer' | 'store_owner' | 'driver'>('developer');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
      onSuccess?.();
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const roleConfig = {
    developer: {
      title: 'Developer Login',
      description: 'System administration and development access',
      color: 'bg-blue-600',
      borderColor: 'border-blue-600',
      textColor: 'text-blue-600',
      credentials: {
        username: 'admin_dev',
        password: 'Dev@2024!Secure'
      }
    },
    store_owner: {
      title: 'Store Owner Login',
      description: 'Store management and order processing',
      color: 'bg-green-600',
      borderColor: 'border-green-600',
      textColor: 'text-green-600',
      credentials: {
        username: 'store_manager',
        password: 'Store@2024!Secure'
      }
    },
    driver: {
      title: 'Driver Login',
      description: 'Delivery management and route optimization',
      color: 'bg-orange-600',
      borderColor: 'border-orange-600',
      textColor: 'text-orange-600',
      credentials: {
        username: 'driver_john',
        password: 'Driver@2024!Secure'
      }
    }
  };

  const currentRole = roleConfig[selectedRole];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Delivery Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure login for delivery management
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['developer', 'store_owner', 'driver'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedRole === role
                      ? `${roleConfig[role].borderColor} ${roleConfig[role].color} text-white`
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-xs font-medium capitalize">
                    {role.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username', { required: 'Username is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${currentRole.color} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Demo Credentials for {currentRole.title}
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Username:</strong> {currentRole.credentials.username}</p>
              <p><strong>Password:</strong> {currentRole.credentials.password}</p>
            </div>
            <p className="text-xs text-red-600 mt-2">
              ⚠️ These are demo credentials. Change in production!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;








