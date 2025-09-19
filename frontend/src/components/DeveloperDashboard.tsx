import React, { useState } from 'react';

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

interface SharedOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation: string;
  items: string;
  specialInstructions?: string;
  status: string;
  assignedDriverId?: number;
  storeOwnerId: number;
  storeOwnerName: string;
  storeId?: number;
  storeName?: string;
  timestamp: Date;
}

interface DeveloperDashboardProps {
  onBackToLogin: () => void;
  storeOwners: StoreOwner[];
  setStoreOwners: React.Dispatch<React.SetStateAction<StoreOwner[]>>;
  drivers: any[];
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  sharedOrders: SharedOrder[];
  setSharedOrders: React.Dispatch<React.SetStateAction<SharedOrder[]>>;
  receivingAccount: string;
  setReceivingAccount: React.Dispatch<React.SetStateAction<string>>;
  globalRate: number;
  setGlobalRate: React.Dispatch<React.SetStateAction<number>>;
  paymentData: any[];
  setPaymentData: React.Dispatch<React.SetStateAction<any[]>>;
  setStoreOwnerBills: React.Dispatch<React.SetStateAction<any[]>>;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onBackToLogin,
  storeOwners,
  setStoreOwners,
  drivers,
  setDrivers,
  stores,
  setStores,
  sharedOrders,
  setSharedOrders,
  receivingAccount,
  setReceivingAccount,
  globalRate,
  setGlobalRate,
  paymentData,
  setPaymentData,
  setStoreOwnerBills
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'manage-stores' | 'manage-drivers' | 'analytics'>('main');
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState<Omit<Store, 'id' | 'createdAt'>>({
    name: '',
    address: '',
    phone: '',
    ownerId: undefined
  });
  
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [newDriver, setNewDriver] = useState<Omit<Driver, 'id' | 'createdAt'>>({
    username: '',
    password: '',
    email: '',
    phoneNumber: ''
  });
  
  // Analytics filtering state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [storePaymentStatuses, setStorePaymentStatuses] = useState<{[storeId: number]: 'pending' | 'completed'}>({});

  // Store Management
  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    const store: Store = {
      id: stores.length + 1,
      ...newStore,
      createdAt: new Date()
    };
    setStores([...stores, store]);
    setNewStore({ name: '', address: '', phone: '', ownerId: undefined });
  };

  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
      setStores(stores.map(store => 
        store.id === editingStore.id 
          ? { ...store, ...newStore }
          : store
      ));
      setEditingStore(null);
      setNewStore({ name: '', address: '', phone: '', ownerId: undefined });
    }
  };

  const handleDeleteStore = (id: number) => {
    setStores(stores.filter(store => store.id !== id));
  };

  // Driver Management
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const driver: Driver = {
      id: drivers.length + 1,
      ...newDriver,
      createdAt: new Date()
    };
    setDrivers([...drivers, driver]);
    setNewDriver({ username: '', password: '', email: '', phoneNumber: '' });
  };

  const handleUpdateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      setDrivers(drivers.map(driver => 
        driver.id === editingDriver.id 
          ? { ...driver, ...newDriver }
          : driver
      ));
      setEditingDriver(null);
      setNewDriver({ username: '', password: '', email: '', phoneNumber: '' });
    }
  };

  const handleDeleteDriver = (id: number) => {
    setDrivers(drivers.filter(driver => driver.id !== id));
  };

  // Payment status management
  const handlePaymentStatusChange = (storeId: number, status: 'pending' | 'completed') => {
    setStorePaymentStatuses(prev => ({
      ...prev,
      [storeId]: status
    }));
  };

  // Main Dashboard View
  if (currentView === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white neon-text">Developer Dashboard</h1>
              <p className="text-white/70 text-lg mt-2">Manage your delivery system</p>
            </div>
            <button
              onClick={onBackToLogin}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Login
            </button>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-white mb-2">Stores</h3>
              <p className="text-3xl font-bold text-blue-400">{stores.length}</p>
              <p className="text-white/70 text-sm">Active locations</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-2">Orders</h3>
              <p className="text-3xl font-bold text-green-400">{sharedOrders.length}</p>
              <p className="text-white/70 text-sm">Total orders</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-2">Drivers</h3>
              <p className="text-3xl font-bold text-purple-400">{drivers.length}</p>
              <p className="text-white/70 text-sm">Available drivers</p>
            </div>
          </div>

          {/* Management Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setCurrentView('manage-stores')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/20 transition-all duration-200 text-left group"
            >
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200">Manage Stores</h3>
              <p className="text-white/70">Create, edit, and manage store locations and information.</p>
            </button>

            <button
              onClick={() => setCurrentView('manage-drivers')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/20 transition-all duration-200 text-left group"
            >
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200">Manage Drivers</h3>
              <p className="text-white/70">Create, edit, and manage driver accounts and profiles.</p>
            </button>

            <button
              onClick={() => setCurrentView('analytics')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/20 transition-all duration-200 text-left group"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200">System Analytics</h3>
              <p className="text-white/70">View system performance, delivery statistics, and user activity.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Store Management View
  if (currentView === 'manage-stores') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Manage Stores</h1>
            <button
              onClick={() => setCurrentView('main')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Add Store Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </h2>
            <form onSubmit={editingStore ? handleUpdateStore : handleAddStore} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Store Name"
                value={newStore.name}
                onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                required
              />
              <input
                type="text"
                placeholder="Store Address"
                value={newStore.address}
                onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                required
              />
              <input
                type="tel"
                placeholder="Store Phone"
                value={newStore.phone}
                onChange={(e) => setNewStore({...newStore, phone: e.target.value})}
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                required
              />
              <select
                value={newStore.ownerId || ''}
                onChange={(e) => setNewStore({...newStore, ownerId: e.target.value ? parseInt(e.target.value) : undefined})}
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="">Select Store Owner (Optional)</option>
                {storeOwners.map(owner => (
                  <option key={owner.id} value={owner.id} className="bg-gray-800">
                    {owner.username}
                  </option>
                ))}
              </select>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {editingStore ? 'Update Store' : 'Add Store'}
                </button>
                {editingStore && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStore(null);
                      setNewStore({ name: '', address: '', phone: '', ownerId: undefined });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Stores List */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Stores ({stores.length})</h2>
            <div className="space-y-4">
              {stores.map(store => (
                <div key={store.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{store.name}</h3>
                      <p className="text-white/70 text-sm mt-1">📍 {store.address}</p>
                      <p className="text-white/70 text-sm">📞 {store.phone}</p>
                      {store.ownerId && (
                        <p className="text-blue-300 text-sm mt-1">
                          👤 Owner: {storeOwners.find(owner => owner.id === store.ownerId)?.username || 'Unknown'}
                        </p>
                      )}
                      <p className="text-white/50 text-xs mt-2">
                        Created: {store.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingStore(store);
                          setNewStore({
                            name: store.name,
                            address: store.address,
                            phone: store.phone,
                            ownerId: store.ownerId
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {stores.length === 0 && (
                <div className="text-center py-8 text-white/50">
                  <div className="text-4xl mb-4">🏪</div>
                  <p>No stores added yet. Create your first store above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Driver Management View
  if (currentView === 'manage-drivers') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Manage Drivers</h1>
            <button
              onClick={() => setCurrentView('main')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add/Edit Driver Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              
              <form onSubmit={editingDriver ? handleUpdateDriver : handleAddDriver} className="space-y-4">
                <input
                  type="text"
                  value={newDriver.username}
                  onChange={(e) => setNewDriver({...newDriver, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Username"
                  required
                />
                <input
                  type="password"
                  value={newDriver.password}
                  onChange={(e) => setNewDriver({...newDriver, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Password"
                  required
                />
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Email"
                  required
                />
                <input
                  type="tel"
                  value={newDriver.phoneNumber}
                  onChange={(e) => setNewDriver({...newDriver, phoneNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Phone Number"
                  required
                />
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    {editingDriver ? 'Update' : 'Add'} Driver
                  </button>
                  {editingDriver && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDriver(null);
                        setNewDriver({ username: '', password: '', email: '', phoneNumber: '' });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Drivers List */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Drivers ({drivers.length})</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {drivers.map(driver => (
                  <div key={driver.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{driver.username}</h3>
                        <p className="text-white/70 text-sm">{driver.email}</p>
                        <p className="text-white/70 text-sm">{driver.phoneNumber}</p>
                        <p className="text-white/50 text-xs mt-1">
                          Created: {driver.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingDriver(driver);
                            setNewDriver({
                              username: driver.username,
                              password: driver.password,
                              email: driver.email,
                              phoneNumber: driver.phoneNumber
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {drivers.length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    <div className="text-4xl mb-4">🚚</div>
                    <p className="text-sm">No drivers added yet</p>
                    <p className="text-sm mt-2">Add your first driver to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analytics View
  if (currentView === 'analytics') {
    // Filter orders by selected date
    const selectedDateObj = new Date(selectedDate);
    const filteredOrders = sharedOrders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate.toDateString() === selectedDateObj.toDateString();
    });
    
    // Calculate analytics data for selected date
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const inTransitOrders = filteredOrders.filter(order => order.status === 'picked_up').length;
    
    // Orders by store for selected date
    const ordersByStore = stores.map(store => ({
      name: store.name,
      count: filteredOrders.filter(order => order.storeId === store.id).length,
      storeId: store.id
    }));
    
    // Orders by status
    const ordersByStatus = [
      { status: 'Pending', count: pendingOrders, color: 'bg-yellow-500' },
      { status: 'In Transit', count: inTransitOrders, color: 'bg-blue-500' },
      { status: 'Delivered', count: completedOrders, color: 'bg-green-500' }
    ];
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = sharedOrders.filter(order => order.timestamp >= sevenDaysAgo);
    
    // Driver performance for selected date
    const driverPerformance = drivers.map(driver => {
      const driverOrders = filteredOrders.filter(order => order.assignedDriverId === driver.id);
      const completedDriverOrders = driverOrders.filter(order => order.status === 'delivered');
      return {
        name: driver.username,
        totalOrders: driverOrders.length,
        completedOrders: completedDriverOrders.length,
        completionRate: driverOrders.length > 0 ? Math.round((completedDriverOrders.length / driverOrders.length) * 100) : 0
      };
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">System Analytics</h1>
            <button
              onClick={() => setCurrentView('main')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Date Filter */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📅 Date Filter</h2>
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/90 border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-400"
              />
              <span className="text-white/70 text-sm">
                Showing data for: {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{totalOrders}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-400">{completedOrders}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">In Transit</p>
                  <p className="text-3xl font-bold text-blue-400">{inTransitOrders}</p>
                </div>
                <div className="text-4xl">🚚</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400">{pendingOrders}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Orders by Store with Payment Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">📊 Orders by Store & Payment Status</h2>
              <div className="space-y-4">
                {ordersByStore.map((store, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-white font-medium">{store.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70">{store.count} orders</span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${totalOrders > 0 ? (store.count / totalOrders) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Status Dropdown */}
                    <div className="flex items-center space-x-3">
                      <label className="text-white/70 text-sm font-medium">Payment Status:</label>
                      <select
                        value={storePaymentStatuses[store.storeId] || 'pending'}
                        onChange={(e) => handlePaymentStatusChange(store.storeId, e.target.value as 'pending' | 'completed')}
                        className="px-3 py-1 rounded-lg bg-white/90 border border-gray-300 text-gray-800 text-sm focus:outline-none focus:border-blue-400"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (storePaymentStatuses[store.storeId] || 'pending') === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {(storePaymentStatuses[store.storeId] || 'pending') === 'completed' ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {ordersByStore.length === 0 && (
                  <p className="text-white/50 text-center py-4">No orders data available for selected date</p>
                )}
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">📈 Orders by Status</h2>
              <div className="space-y-4">
                {ordersByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${status.color} rounded-full`}></div>
                      <span className="text-white font-medium">{status.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/70">{status.count} orders</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${status.color} h-2 rounded-full`} 
                          style={{ width: `${totalOrders > 0 ? (status.count / totalOrders) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">💰 Payment Summary for {new Date(selectedDate).toLocaleDateString()}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Store Payment Status</h3>
                {stores.map(store => {
                  const paymentStatus = storePaymentStatuses[store.id] || 'pending';
                  const orderCount = ordersByStore.find(s => s.storeId === store.id)?.count || 0;
                  return (
                    <div key={store.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                      <div>
                        <span className="text-white font-medium">{store.name}</span>
                        <p className="text-white/70 text-sm">{orderCount} orders</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        paymentStatus === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {paymentStatus === 'completed' ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Payment Statistics</h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Completed Payments:</span>
                      <span className="text-green-400 font-semibold">
                        {Object.values(storePaymentStatuses).filter(status => status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Pending Payments:</span>
                      <span className="text-yellow-400 font-semibold">
                        {Object.values(storePaymentStatuses).filter(status => status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Stores:</span>
                      <span className="text-white font-semibold">{stores.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Performance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">🚚 Driver Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {driverPerformance.map((driver, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-2">{driver.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Orders:</span>
                      <span className="text-white">{driver.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Completed:</span>
                      <span className="text-green-400">{driver.completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Success Rate:</span>
                      <span className="text-blue-400">{driver.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {driverPerformance.length === 0 && (
                <div className="col-span-full text-center py-8 text-white/50">
                  <div className="text-4xl mb-4">🚚</div>
                  <p>No driver performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Orders for Selected Date */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6">📅 Orders for {new Date(selectedDate).toLocaleDateString()}</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredOrders.slice(0, 10).map((order, index) => (
                <div key={order.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">Order #{order.id}</p>
                      <p className="text-white/70 text-sm">{order.customerName} - {order.items}</p>
                      <p className="text-white/50 text-xs">{order.storeName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'picked_up' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status === 'delivered' ? 'Delivered' :
                         order.status === 'picked_up' ? 'In Transit' : 'Pending'}
                      </span>
                      <p className="text-white/50 text-xs mt-1">
                        {order.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-white/50">
                  <div className="text-4xl mb-4">📅</div>
                  <p>No orders found for selected date</p>
                  <p className="text-sm mt-2">Try selecting a different date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DeveloperDashboard;