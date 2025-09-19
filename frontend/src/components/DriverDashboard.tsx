import React from 'react';



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

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  ownerId?: number;
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

interface DriverDashboardProps {
  onBackToLogin: () => void;
  driverId?: number;
  stores?: Store[];
  drivers?: Driver[];
  sharedOrders?: SharedOrder[];
  setSharedOrders?: React.Dispatch<React.SetStateAction<SharedOrder[]>>;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
  onBackToLogin, 
  driverId,
  stores = [],
  drivers = [],
  sharedOrders = [],
  setSharedOrders
}) => {
  // Get orders assigned to this driver from shared orders
  const orders = sharedOrders.filter(order => order.assignedDriverId === driverId);
  
  // Get unassigned orders that this driver can claim
  const unassignedOrders = sharedOrders.filter(order => !order.assignedDriverId);
  
  // Helper function to get store name
  const getStoreName = (storeOwnerId: number) => {
    const store = stores.find(s => s.ownerId === storeOwnerId);
    return store ? store.name : `Store Owner ${storeOwnerId}`;
  };
  
  // Get current driver info
  const currentDriver = drivers.find(d => d.id === driverId);

  const handleStatusChange = (orderId: number, newStatus: 'pending' | 'picked_up' | 'delivered') => {
    if (setSharedOrders) {
      setSharedOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  const handleClaimOrder = (orderId: number) => {
    if (setSharedOrders && driverId) {
      setSharedOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, assignedDriverId: driverId } : order
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/80 text-yellow-100';
      case 'picked_up': return 'bg-blue-600/80 text-blue-100';
      case 'delivered': return 'bg-green-600/80 text-green-100';
      default: return 'bg-gray-600/80 text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '📦';
      case 'picked_up': return '🚛';
      case 'delivered': return '✅';
      default: return '❓';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Pickup';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const pickedUpOrders = orders.filter(order => order.status === 'picked_up');
  const deliveredOrders = orders.filter(order => order.status === 'delivered');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white neon-text">Driver Dashboard</h1>
            {currentDriver && (
              <p className="text-white/70 text-lg mt-2">Welcome, {currentDriver.username}!</p>
            )}
          </div>
          <button
            onClick={onBackToLogin}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            ← Back to Login
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-white">{orders.length}</p>
            <p className="text-white/70 text-sm">All time</p>
          </div>
          <div className="bg-yellow-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30">
            <h3 className="text-yellow-100 text-lg font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-100">{pendingOrders.length}</p>
            <p className="text-yellow-200/70 text-sm">Need pickup</p>
          </div>
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30">
            <h3 className="text-blue-100 text-lg font-semibold mb-2">In Transit</h3>
            <p className="text-3xl font-bold text-blue-100">{pickedUpOrders.length}</p>
            <p className="text-blue-200/70 text-sm">On the way</p>
          </div>
          <div className="bg-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-400/30">
            <h3 className="text-green-100 text-lg font-semibold mb-2">Delivered</h3>
            <p className="text-3xl font-bold text-green-100">{deliveredOrders.length}</p>
            <p className="text-green-200/70 text-sm">Completed</p>
          </div>
        </div>

        {/* Available Orders Section */}
        {unassignedOrders.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 neon-border mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 neon-text-green">🚚 Available Orders ({unassignedOrders.length})</h2>
            <p className="text-white/70 mb-4">Claim these orders to add them to your delivery list</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedOrders.slice(0, 6).map((order, index) => (
                <div key={order.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-green-400/50 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-white font-semibold">Order #{order.id}</h3>
                    <span className="bg-yellow-600/80 text-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                      📦 Available
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-white/90"><span className="text-white/70">Store:</span> {getStoreName(order.storeOwnerId)}</p>
                    <p className="text-white/90"><span className="text-white/70">Customer:</span> {order.customerName}</p>
                    <p className="text-white/90"><span className="text-white/70">Location:</span> {order.customerLocation}</p>
                    <p className="text-white/90"><span className="text-white/70">Items:</span> {order.items}</p>
                  </div>
                  
                  <button
                    onClick={() => handleClaimOrder(order.id)}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
                  >
                    🚚 Claim Order
                  </button>
                </div>
              ))}
            </div>
            
            {unassignedOrders.length > 6 && (
              <p className="text-white/50 text-center mt-4">
                And {unassignedOrders.length - 6} more available orders...
              </p>
            )}
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 neon-border">
          <h2 className="text-2xl font-bold text-white mb-6 neon-text-cyan">My Assigned Orders ({orders.length})</h2>
          
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <div key={order.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Order {index + 1}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {formatStatus(order.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Customer Information</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-white/90"><span className="text-white/70">Name:</span> {order.customerName}</p>
                            <p className="text-white/90"><span className="text-white/70">Phone:</span> {order.customerPhone}</p>
                            <p className="text-white/90"><span className="text-white/70">Address:</span> {order.customerAddress}</p>
                            <p className="text-white/90"><span className="text-white/70">Location:</span> {order.customerLocation}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Order Information</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-white/90"><span className="text-white/70">Store:</span> {getStoreName(order.storeOwnerId)}</p>
                            <p className="text-white/90"><span className="text-white/70">Items:</span> {order.items}</p>
                            <p className="text-white/90"><span className="text-white/70">Ordered:</span> {order.timestamp.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      {order.specialInstructions && (
                        <div className="bg-white/5 rounded p-3 border border-white/10">
                          <h4 className="text-white font-medium mb-1">Special Instructions</h4>
                          <p className="text-white/80 text-sm">{order.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Controls */}
                    <div className="flex flex-col justify-center space-y-4">
                      <h4 className="text-white font-medium text-center">Update Status</h4>
                      
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as 'pending' | 'picked_up' | 'delivered')}
                        className="bg-white/90 text-gray-800 px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">📦 Pending Pickup</option>
                        <option value="picked_up">🚛 Picked Up</option>
                        <option value="delivered">✅ Delivered</option>
                      </select>
                      
                      <div className="text-center">
                        <div className={`py-2 px-4 rounded-lg text-sm ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {formatStatus(order.status)}
                        </div>
                      </div>
                      
                      {/* Contact Customer */}
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-center border border-white/20"
                      >
                        📞 Call Customer
                      </a>
                      
                      {/* Navigate to Address */}
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(order.customerLocation || order.customerAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-center border border-white/20"
                      >
                        🗺️ Navigate
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-12">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-2xl font-bold text-white mb-4">No Orders Assigned</h2>
              <p className="text-white/70">
                You don't have any delivery orders assigned yet. Check back later or contact your dispatcher.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
