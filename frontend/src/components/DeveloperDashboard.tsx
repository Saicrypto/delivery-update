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

interface ItemType {
  id: number;
  name: string;
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

interface DeveloperDashboardProps {
  onBackToLogin: () => void;
  storeOwners: StoreOwner[];
  setStoreOwners: React.Dispatch<React.SetStateAction<StoreOwner[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  sharedOrders: SharedOrder[];
  setSharedOrders: React.Dispatch<React.SetStateAction<SharedOrder[]>>;
  receivingAccount?: any;
  setReceivingAccount?: any;
  globalRate?: number;
  setGlobalRate?: any;
  paymentData?: any;
  setPaymentData?: any;
  setStoreOwnerBills?: any;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ 
  onBackToLogin, 
  storeOwners, 
  setStoreOwners, 
  drivers, 
  setDrivers,
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
  const [currentView, setCurrentView] = useState<'main' | 'manage-stores' | 'manage-drivers' | 'assign-deliveries'>('main');
  const [selectedStoreOwner, setSelectedStoreOwner] = useState<StoreOwner | null>(null);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([
    { id: 1, name: 'Pizza' },
    { id: 2, name: 'Burger' },
    { id: 3, name: 'Electronics' }
  ]);
  
  const [newStoreOwner, setNewStoreOwner] = useState({
    username: '',
    password: '',
    email: ''
  });
  
  const [newDriver, setNewDriver] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: ''
  });
  
  const [newItemType, setNewItemType] = useState({
    name: ''
  });
  
  const [editingStoreOwner, setEditingStoreOwner] = useState<StoreOwner | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [assigningItemsTo, setAssigningItemsTo] = useState<number | null>(null);

  // Store Owner Management
  const handleAddStoreOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const storeOwner: StoreOwner = {
      id: storeOwners.length + 1,
      ...newStoreOwner,
      assignedItemTypes: [],
      createdAt: new Date()
    };
    setStoreOwners([...storeOwners, storeOwner]);
    setNewStoreOwner({ username: '', password: '', email: '' });
  };

  const handleEditStoreOwner = (storeOwner: StoreOwner) => {
    setEditingStoreOwner(storeOwner);
    setNewStoreOwner({
      username: storeOwner.username,
      password: storeOwner.password,
      email: storeOwner.email
    });
  };

  const handleUpdateStoreOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStoreOwner) {
      setStoreOwners(storeOwners.map(owner => 
        owner.id === editingStoreOwner.id 
          ? { ...owner, ...newStoreOwner }
          : owner
      ));
      setEditingStoreOwner(null);
      setNewStoreOwner({ username: '', password: '', email: '' });
    }
  };

  const handleDeleteStoreOwner = (id: number) => {
    setStoreOwners(storeOwners.filter(owner => owner.id !== id));
  };

  const handleAssignItemType = (storeOwnerId: number, itemTypeName: string) => {
    setStoreOwners(storeOwners.map(owner => 
      owner.id === storeOwnerId 
        ? { 
            ...owner, 
            assignedItemTypes: owner.assignedItemTypes.includes(itemTypeName)
              ? owner.assignedItemTypes.filter(item => item !== itemTypeName)
              : [...owner.assignedItemTypes, itemTypeName]
          }
        : owner
    ));
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

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setNewDriver({
      username: driver.username,
      password: driver.password,
      email: driver.email,

      phoneNumber: driver.phoneNumber
    });
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

  // Item Type Management
  const handleAddItemType = (e: React.FormEvent) => {
    e.preventDefault();
    const itemType: ItemType = {
      id: itemTypes.length + 1,
      ...newItemType
    };
    setItemTypes([...itemTypes, itemType]);
    setNewItemType({ name: '' });
  };

  const handleDeleteItemType = (id: number) => {
    const itemTypeToDelete = itemTypes.find(item => item.id === id);
    if (itemTypeToDelete) {
      // Remove from all store owners
      setStoreOwners(storeOwners.map(owner => ({
        ...owner,
        assignedItemTypes: owner.assignedItemTypes.filter(item => item !== itemTypeToDelete.name)
      })));
      // Remove from item types
      setItemTypes(itemTypes.filter(item => item.id !== id));
    }
  };

  // Main Dashboard View
  if (currentView === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Developer Dashboard</h1>
            <button
              onClick={onBackToLogin}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Login
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-lg font-semibold mb-2">Store Owners</h3>
              <p className="text-3xl font-bold text-white">{storeOwners.length}</p>
              <p className="text-white/70 text-sm">Active accounts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-lg font-semibold mb-2">Drivers</h3>
              <p className="text-3xl font-bold text-white">{drivers.length}</p>
              <p className="text-white/70 text-sm">Available drivers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-lg font-semibold mb-2">Item Types</h3>
              <p className="text-3xl font-bold text-white">{itemTypes.length}</p>
              <p className="text-white/70 text-sm">Configured items</p>
            </div>
          </div>

          {/* Management Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setCurrentView('manage-stores')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/20 transition-all duration-200 text-left group"
            >
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200">Manage Store Owners</h3>
              <p className="text-white/70">Create, edit, and manage store owner accounts. Assign item types to stores.</p>
            </button>

            <button
              onClick={() => setCurrentView('manage-drivers')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/20 transition-all duration-200 text-left group"
            >
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200">Manage Drivers</h3>
              <p className="text-white/70">Create, edit, and manage driver accounts. View driver information and status.</p>
            </button>

            <button
              onClick={() => setCurrentView('assign-deliveries')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/20 transition-all duration-200 text-left group"
            >
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200">Assign Deliveries</h3>
              <p className="text-white/70">Assign delivery routes and orders to available drivers.</p>
            </button>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">System Analytics</h3>
              <p className="text-white/70">View system performance, delivery statistics, and user activity.</p>
              <p className="text-white/50 text-sm mt-2">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Store Owners Management View
  if (currentView === 'manage-stores') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Manage Store Owners</h1>
            <button
              onClick={() => setCurrentView('main')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add/Edit Store Owner Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingStoreOwner ? 'Edit Store Owner' : 'Add New Store Owner'}
              </h2>
              
              <form onSubmit={editingStoreOwner ? handleUpdateStoreOwner : handleAddStoreOwner} className="space-y-4">
                <input
                  type="text"
                  value={newStoreOwner.username}
                  onChange={(e) => setNewStoreOwner({...newStoreOwner, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Username"
                  required
                />
                <input
                  type="password"
                  value={newStoreOwner.password}
                  onChange={(e) => setNewStoreOwner({...newStoreOwner, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Password"
                  required
                />
                <input
                  type="email"
                  value={newStoreOwner.email}
                  onChange={(e) => setNewStoreOwner({...newStoreOwner, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
                  placeholder="Email"
                  required
                />
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/30"
                  >
                    {editingStoreOwner ? 'Update Store Owner' : 'Add Store Owner'}
                  </button>
                  
                  {editingStoreOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStoreOwner(null);
                        setNewStoreOwner({ username: '', password: '', email: '' });
                      }}
                      className="bg-gray-600/80 hover:bg-gray-500/80 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Item Types Management */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Manage Item Types</h3>
                
                <form onSubmit={handleAddItemType} className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={newItemType.name}
                    onChange={(e) => setNewItemType({...newItemType, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500 text-sm"
                    placeholder="Item name (e.g., Pizza, Burger, Electronics)"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-white/15 hover:bg-white/25 text-white py-2 px-4 rounded font-medium transition-all duration-200 text-sm"
                  >
                    Add Item Type
                  </button>
                </form>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {itemTypes.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                      <span className="text-white text-sm">{item.name}</span>
                      <button
                        onClick={() => handleDeleteItemType(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Store Owners List */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Store Owners ({storeOwners.length})</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {storeOwners.map((owner) => (
                  <div key={owner.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-medium">{owner.username}</h3>
                        <p className="text-white/70 text-sm">{owner.email}</p>
                        <p className="text-white/50 text-xs">Created: {owner.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStoreOwner(owner)}
                          className="bg-gray-600/80 hover:bg-gray-500/80 text-white px-2 py-1 rounded text-xs"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStoreOwner(owner.id)}
                          className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-2 py-1 rounded text-xs"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => setAssigningItemsTo(assigningItemsTo === owner.id ? null : owner.id)}
                          className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-2 py-1 rounded text-xs"
                        >
                          📦 Assign Items
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-white/60 mb-2">
                      <strong>Password:</strong> {owner.password}
                    </div>
                    
                    {owner.assignedItemTypes.length > 0 && (
                      <div className="mb-2">
                        <p className="text-white/70 text-xs mb-1">Assigned Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {owner.assignedItemTypes.map((item, index) => (
                            <span key={index} className="bg-blue-600/20 text-blue-200 px-2 py-1 rounded text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {assigningItemsTo === owner.id && (
                      <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                        <p className="text-white text-xs mb-2">Select item types to assign:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {itemTypes.map((item) => (
                            <label key={item.id} className="flex items-center space-x-2 text-xs">
                              <input
                                type="checkbox"
                                checked={owner.assignedItemTypes.includes(item.name)}
                                onChange={() => handleAssignItemType(owner.id, item.name)}
                                className="w-3 h-3"
                              />
                              <span className="text-white/80">{item.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {storeOwners.length === 0 && (
                  <div className="text-center text-white/70 py-8">
                    <p>No store owners yet</p>
                    <p className="text-sm mt-2">Add your first store owner to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Drivers Management View
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
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/30"
                  >
                    {editingDriver ? 'Update Driver' : 'Add Driver'}
                  </button>
                  
                  {editingDriver && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDriver(null);
                        setNewDriver({ username: '', password: '', email: '', phoneNumber: '' });
                      }}
                      className="bg-gray-600/80 hover:bg-gray-500/80 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
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
                {drivers.map((driver) => (
                  <div key={driver.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-medium">{driver.username}</h3>
                        <p className="text-white/70 text-sm">{driver.email}</p>
                        <p className="text-white/70 text-sm">{driver.phoneNumber}</p>

                        <p className="text-white/50 text-xs">Created: {driver.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="bg-gray-600/80 hover:bg-gray-500/80 text-white px-2 py-1 rounded text-xs"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-2 py-1 rounded text-xs"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-white/60">
                      <strong>Password:</strong> {driver.password}
                    </div>
                  </div>
                ))}
                
                {drivers.length === 0 && (
                  <div className="text-center text-white/70 py-8">
                    <p>No drivers yet</p>
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

  // Assign Deliveries View
  if (currentView === 'assign-deliveries') {
    const handleAssignDriver = (orderId: number, driverId: number) => {
      setSharedOrders(sharedOrders.map(order => 
        order.id === orderId ? { ...order, assignedDriverId: driverId } : order
      ));
    };

    if (selectedStoreOwner) {
      const storeOrders = sharedOrders.filter(order => order.storeOwnerId === selectedStoreOwner.id);
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">
                Orders from {selectedStoreOwner.username}
              </h1>
              <button
                onClick={() => setSelectedStoreOwner(null)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                ← Back to Store Owners
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">All Orders ({storeOrders.length})</h2>
                <div className="text-white/70 text-sm">
                  Store: {selectedStoreOwner.email} | Assigned Items: {selectedStoreOwner.assignedItemTypes.join(', ') || 'None'}
                </div>
              </div>
              
              {storeOrders.length > 0 ? (
                <div className="space-y-4">
                  {storeOrders.map((order) => (
                    <div key={order.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-white font-medium text-lg mb-2">Order #{order.id}</h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-white/90"><span className="text-white/70">Customer:</span> {order.customerName}</p>
                            <p className="text-white/90"><span className="text-white/70">Phone:</span> {order.customerPhone}</p>
                            <p className="text-white/90"><span className="text-white/70">Address:</span> {order.customerAddress}</p>
                            <p className="text-white/90"><span className="text-white/70">Items:</span> {order.items}</p>
                            {order.specialInstructions && (
                              <p className="text-white/90"><span className="text-white/70">Special Instructions:</span> {order.specialInstructions}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div className="text-right">
                            <p className="text-white/60 text-xs">Ordered at</p>
                            <p className="text-white/80 text-sm">{order.timestamp.toLocaleString()}</p>
                          </div>
                          <div className="flex space-x-2 mt-4 md:mt-0">
                            <select 
                              className="bg-white/90 text-gray-800 px-3 py-1 rounded text-sm"
                              value={order.assignedDriverId || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignDriver(order.id, parseInt(e.target.value));
                                }
                              }}
                            >
                              <option value="">Select Driver</option>
                              {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.username} - {driver.phoneNumber}
                                </option>
                              ))}
                            </select>
                            {order.assignedDriverId && (
                              <span className="text-green-400 text-xs flex items-center">
                                ✅ Assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/70 py-12">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-lg">No orders from this store owner yet</p>
                  <p className="text-sm mt-2">Orders will appear here when {selectedStoreOwner.username} creates them</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Assign Deliveries</h1>
            <button
              onClick={() => setCurrentView('main')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6">Select Store Owner to View Orders</h2>
            
            {storeOwners.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeOwners.map((owner) => {
                  const orderCount = sharedOrders.filter(order => order.storeOwnerId === owner.id).length;
                  return (
                    <button
                      key={owner.id}
                      onClick={() => setSelectedStoreOwner(owner)}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-6 border border-white/10 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium text-lg group-hover:text-gray-200">{owner.username}</h3>
                        <div className="text-2xl">🏪</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-white/70">Email: {owner.email}</p>
                        <p className="text-white/70">Orders: <span className="font-medium text-white">{orderCount}</span></p>
                        <p className="text-white/60">Items: {owner.assignedItemTypes.join(', ') || 'None assigned'}</p>
                        <p className="text-white/50 text-xs">Created: {owner.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div className="mt-4 text-center">
                        <span className="text-blue-400 text-sm group-hover:text-blue-300">Click to view orders →</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-white/70 py-12">
                <div className="text-6xl mb-6">🏪</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Store Owners Created</h2>
                <p className="text-white/70 mb-6">
                  You need to create store owner accounts first before you can assign deliveries.
                </p>
                <button
                  onClick={() => setCurrentView('manage-stores')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  Create Store Owners
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DeveloperDashboard;
