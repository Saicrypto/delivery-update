import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const roleConfig = {
    developer: {
      title: 'Developer Dashboard',
      description: 'System administration and development tools',
      color: 'bg-blue-600',
      features: [
        'User Management',
        'System Configuration',
        'Database Administration',
        'API Documentation',
        'Log Monitoring',
        'Security Settings'
      ]
    },
    store_owner: {
      title: 'Store Owner Dashboard',
      description: 'Store management and order processing',
      color: 'bg-green-600',
      features: [
        'Order Management',
        'Inventory Control',
        'Customer Management',
        'Sales Analytics',
        'Delivery Scheduling',
        'Store Settings'
      ]
    },
    driver: {
      title: 'Driver Dashboard',
      description: 'Delivery management and route optimization',
      color: 'bg-orange-600',
      features: [
        'Delivery Routes',
        'Order Status Updates',
        'Navigation Tools',
        'Delivery History',
        'Earnings Tracking',
        'Schedule Management'
      ]
    }
  };

  const currentRole = roleConfig[user.role];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${currentRole.color} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentRole.title}
              </h1>
              <p className="text-blue-100">
                Welcome back, {user.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Role: {user.role.replace('_', ' ')}
              </span>
              <button
                onClick={logout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${currentRole.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        User Information
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {user.username}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {user.email}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${currentRole.color} rounded-full flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Role
                      </dt>
                      <dd className="text-sm text-gray-900 capitalize">
                        {user.role.replace('_', ' ')}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {currentRole.description}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Status
                      </dt>
                      <dd className="text-sm text-gray-900">
                        Active
                      </dd>
                      <dd className="text-sm text-gray-500">
                        Last login: {new Date().toLocaleDateString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Available Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRole.features.map((feature, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                  <h3 className="text-sm font-medium text-gray-900">
                    {feature}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to access {feature.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Development in Progress
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a demo dashboard. Full delivery management features are being developed.
                    The backend API is fully functional with secure authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;








