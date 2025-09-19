import React, { useState, useEffect } from 'react';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import DeveloperDashboard from './components/DeveloperDashboard';
import DriverDashboard from './components/DriverDashboard';

interface StoreOwner {
  id: number;
  username: string;
  password: string;
  email: string;
  assignedItemTypes: string[];
  createdAt: Date;
}

interface Driver {
  id: number;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
}

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  ownerId?: number;
  createdAt: Date;
}

interface StockItem {
  id: number;
  name: string;
  quantity: number;
  storeId: number;
}

interface SharedOrder {
  id: number;
  storeOwnerId: number;
  storeOwnerName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation: string;
  items: string;
  specialInstructions: string;
  timestamp: Date;
  status: 'pending' | 'picked_up' | 'delivered';
  assignedDriverId?: number;
}

type StoreOwnerBill = {
  storeOwnerId: number;
  orderCount: number;
  ratePerOrder: number;
  total: number;
  billDate: string; // ISO date for single day or start date for multiple
  duration: 'single' | 'multiple';
  endDate?: string; // ISO date for multiple day bills
  generatedAt: Date;
}

const App: React.FC = () => {
  const roles = ['developer', 'store_owner', 'driver'] as const;
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<string>('');
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  
  // Shared state for created accounts and orders
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stores, setStores] = useState<Store[]>([
    {
      id: 1,
      name: 'Airavya oils',
      address: '123 Oil Street, Mumbai',
      phone: '+91 98765 43210',
      ownerId: undefined,
      createdAt: new Date()
    },
    {
      id: 2,
      name: 'Irie salad',
      address: '456 Salad Lane, Delhi',
      phone: '+91 98765 43211',
      ownerId: undefined,
      createdAt: new Date()
    },
    {
      id: 3,
      name: 'Wild berry organics',
      address: '789 Berry Road, Bangalore',
      phone: '+91 98765 43212',
      ownerId: undefined,
      createdAt: new Date()
    }
  ]);
  const [sharedOrders, setSharedOrders] = useState<SharedOrder[]>([]);
  
  // Shared receiving account for payments
  const [receivingAccount, setReceivingAccount] = useState<{mobile: string, upi: string}>({mobile: '', upi: ''});
  
  // Shared payment data for syncing between developer and store owner
  const [globalRate, setGlobalRate] = useState(400.0);
  const [paymentData, setPaymentData] = useState<{[key: number]: {orderCount: number, ratePerOrder: number, total: number}}>({});
  const [storeOwnerBills, setStoreOwnerBills] = useState<Record<number, StoreOwnerBill[]>>({});
  
  // Stock management for Airavya oils (store ID 1)
  const [airavyaStock, setAiravyaStock] = useState<StockItem[]>([
    { id: 1, name: 'groundnut oil', quantity: 50, storeId: 1 },
    { id: 2, name: 'coconut oil', quantity: 30, storeId: 1 },
    { id: 3, name: 'white sesame oil', quantity: 25, storeId: 1 },
    { id: 4, name: 'black sesame oil', quantity: 20, storeId: 1 },
    { id: 5, name: 'sunflower oil', quantity: 40, storeId: 1 },
    { id: 6, name: 'safflower', quantity: 15, storeId: 1 }
  ]);

  const roleConfig = {
    developer: {
      title: 'Developer Login',
      description: 'System administration and development access',
      color: 'bg-black',
      gradientFrom: 'from-gray-900',
      gradientTo: 'to-black',
      textColor: 'text-gray-800',
      icon: '👨‍💻',
      credentials: {
        username: '1',
        password: '1'
      }
    },
    store_owner: {
      title: 'Store Owner Login',
      description: 'Store management and order processing',
      color: 'bg-gray-800',
      gradientFrom: 'from-gray-700',
      gradientTo: 'to-gray-900',
      textColor: 'text-gray-700',
      icon: '🏪',
      credentials: {
        username: '1',
        password: '1'
      }
    },
    driver: {
      title: 'Driver Login',
      description: 'Delivery management and route optimization',
      color: 'bg-gray-600',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-gray-800',
      textColor: 'text-gray-600',
      icon: '🚚',
      credentials: {
        username: '1',
        password: '1'
      }
    }
  };

  const currentRole = roleConfig[roles[currentRoleIndex]];

  const clearCredentialsAndLogout = () => {
    setUsername('');
    setPassword('');
    setIsLoggedIn(false);
    setLoggedInRole('');
    setLoggedInUserId(null);
  };

  const nextRole = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      clearCredentialsAndLogout(); // Clear everything when switching roles
      setIsTransitioning(false);
    }, 150);
  };

  const prevRole = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRoleIndex((prev) => (prev - 1 + roles.length) % roles.length);
      clearCredentialsAndLogout(); // Clear everything when switching roles
      setIsTransitioning(false);
    }, 150);
  };

  const attemptLogin = () => {
    // Prefer the currently selected role when credentials are shared
    const selectedRole = roles[currentRoleIndex];
    const selectedCreds = roleConfig[selectedRole].credentials;

    console.log('🔐 Login attempt:', {
      username,
      password,
      selectedRole,
      expectedUsername: selectedCreds.username,
      expectedPassword: selectedCreds.password,
      isMatch: username === selectedCreds.username && password === selectedCreds.password
    });

    // If entered credentials match the selected role's defaults → log into that role
    if (username === selectedCreds.username && password === selectedCreds.password) {
      console.log('✅ Login successful for:', selectedRole);
      setIsLoggedIn(true);
      setLoggedInRole(selectedRole);
      // Assign a default, truthy ID for role-based features that rely on an ID
      if (selectedRole === 'store_owner') setLoggedInUserId(1);
      else if (selectedRole === 'driver') setLoggedInUserId(1);
      else setLoggedInUserId(null);
      return;
    }

    // Check dynamically created accounts only for the selected role
    if (selectedRole === 'store_owner') {
      const storeOwner = storeOwners.find(owner => owner.username === username && owner.password === password);
      if (storeOwner) {
        setIsLoggedIn(true);
        setLoggedInRole('store_owner');
        setLoggedInUserId(storeOwner.id);
        return;
      }
    }

    if (selectedRole === 'driver') {
      const driver = drivers.find(d => d.username === username && d.password === password);
      if (driver) {
        setIsLoggedIn(true);
        setLoggedInRole('driver');
        setLoggedInUserId(driver.id);
        return;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptLogin();
  };

  // Clear credentials when component mounts (no auto-fill)
  useEffect(() => {
    // Always start with empty credentials
    setUsername('');
    setPassword('');
  }, []);

  // Clear credentials and logout when role changes
  useEffect(() => {
    clearCredentialsAndLogout();
  }, [currentRoleIndex]);

  // Auto-login when correct credentials are entered (no button required)
  useEffect(() => {
    if (!username || !password) return;
    if (isLoggedIn) return;
    attemptLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password, currentRoleIndex]);

  // Touch/Swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextRole();
    } else if (isRightSwipe) {
      prevRole();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevRole();
      } else if (event.key === 'ArrowRight') {
        nextRole();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show developer dashboard if logged in as developer
  if (isLoggedIn && loggedInRole === 'developer') {
    return (
                <DeveloperDashboard 
            onBackToLogin={clearCredentialsAndLogout}
            storeOwners={storeOwners}
            setStoreOwners={setStoreOwners}
            drivers={drivers}
            setDrivers={setDrivers}
            stores={stores}
            setStores={setStores}
            sharedOrders={sharedOrders}
            setSharedOrders={setSharedOrders}
            receivingAccount={receivingAccount}
            setReceivingAccount={setReceivingAccount}
            globalRate={globalRate}
            setGlobalRate={setGlobalRate}
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            setStoreOwnerBills={setStoreOwnerBills}
          />
    );
  }

  // Show store owner dashboard if logged in as store owner
  if (isLoggedIn && loggedInRole === 'store_owner') {
    return (
      <StoreOwnerDashboard 
        onBackToLogin={clearCredentialsAndLogout}
        storeOwnerId={loggedInUserId || undefined}
        stores={stores}
        drivers={drivers}
        sharedOrders={sharedOrders}
        setSharedOrders={setSharedOrders}
        receivingAccount={receivingAccount}
        globalRate={globalRate}
        paymentData={paymentData}
        storeOwnerBills={storeOwnerBills}
        airavyaStock={airavyaStock}
        setAiravyaStock={setAiravyaStock}
      />
    );
  }

  // Show driver dashboard if logged in as driver
  if (isLoggedIn && loggedInRole === 'driver') {
    return (
      <DriverDashboard 
        onBackToLogin={clearCredentialsAndLogout}
        driverId={loggedInUserId || undefined}
        stores={stores}
        drivers={drivers}
        sharedOrders={sharedOrders}
        setSharedOrders={setSharedOrders}
      />
    );
  }

  // Show simple dashboard for other roles
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Welcome, {loggedInRole.replace('_', ' ')}!
          </h1>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
            <p className="text-xl text-gray-800 mb-6">
              You've successfully logged in as a {loggedInRole.replace('_', ' ')}.
            </p>
            <p className="text-gray-600 mb-8">
              {loggedInRole === 'developer' 
                ? '🔧 Developer dashboard coming soon! You will have access to system administration, user management, and development tools.'
                : '🚚 Driver dashboard coming soon! You will have access to delivery routes, order updates, and navigation tools.'
              }
            </p>
            <button
              onClick={clearCredentialsAndLogout}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentRole.gradientFrom} ${currentRole.gradientTo} flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-500`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
            Delivery Management System
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Secure login for delivery management
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div 
          className={`py-8 px-6 transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'} cursor-pointer select-none`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          
          {/* Role Header with Navigation */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={prevRole}
                className="p-3 hover:scale-110 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white/80 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex-1 mx-4">
                <div className="text-6xl mb-4">{currentRole.icon}</div>
                <h3 className="text-2xl font-bold text-white">{currentRole.title}</h3>
                <p className="text-sm text-white/70 mt-2">{currentRole.description}</p>
              </div>
              
              <button
                type="button"
                onClick={nextRole}
                className="p-3 hover:scale-110 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white/80 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Role Indicators */}
            <div className="flex justify-center space-x-3">
              {roles.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentRoleIndex 
                      ? `bg-white scale-125 shadow-lg` 
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white text-lg transition-all duration-200"
                placeholder="Username"
                required
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white text-lg transition-all duration-200"
                placeholder="Password"
                required
              />
            </div>
            {/* No sign-in button needed; auto-login triggers on valid credentials */}
          </form>
          
          {/* Swipe Hint */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/50">
              ← Swipe or use arrow keys to switch roles →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;



