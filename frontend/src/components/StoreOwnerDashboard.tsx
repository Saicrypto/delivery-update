import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation: string;
  items: string;
  specialInstructions: string;
  assignedDriverId?: number;
  timestamp?: Date;
  storeId?: number;
  storeName?: string;
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
  storeId?: number;
  storeName?: string;
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

interface StockItem {
  id: number;
  name: string;
  quantity: number;
  storeId: number;
}

interface StoreOwnerDashboardProps {
  onBackToLogin?: () => void;
  storeOwnerId?: number;
  stores?: Store[];
  drivers?: Driver[];
  sharedOrders?: SharedOrder[];
  setSharedOrders?: React.Dispatch<React.SetStateAction<SharedOrder[]>>;
  receivingAccount?: any;
  globalRate?: number;
  paymentData?: any;
  storeOwnerBills?: any;
  airavyaStock?: StockItem[];
  setAiravyaStock?: React.Dispatch<React.SetStateAction<StockItem[]>>;
}

const StoreOwnerDashboard: React.FC<StoreOwnerDashboardProps> = ({ 
  onBackToLogin, 
  storeOwnerId,
  stores = [],
  drivers = [],
  sharedOrders = [],
  setSharedOrders,
  airavyaStock = [],
  setAiravyaStock
}) => {
  const [step, setStep] = useState<'store-selection' | 'cart' | 'adding' | 'dispatching' | 'tracking' | 'orders-list' | 'live-tracking' | 'data-import'>('store-selection');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order>({
    id: 0,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerLocation: '',
    items: '',
    specialInstructions: '',
    assignedDriverId: undefined
  });
  const [showMenu, setShowMenu] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [hasDispatched, setHasDispatched] = useState(false);
  const [savedAddingScrollTop, setSavedAddingScrollTop] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [driverPosition, setDriverPosition] = useState<'leaning' | 'standing'>('leaning');
  const [driverShowsThumbsUp, setDriverShowsThumbsUp] = useState(false);
  const [importData, setImportData] = useState('');
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'order' | 'delivery'>('customer');
  
  // Stock management state for Airavya oils
  const [showStockManagement, setShowStockManagement] = useState(false);
  const [selectedOil, setSelectedOil] = useState<string>('');
  const [oilQuantity, setOilQuantity] = useState<number>(1);

  // Derived: shared orders belonging to this selected store only (no store owner filtering)
  const storeFilteredOrders = selectedStore?.id
    ? (sharedOrders || []).filter(o => o.storeId === selectedStore.id)
    : [];
  const [flyingPackages, setFlyingPackages] = useState<Array<{
    id: number;
    customerName: string;
    startLeft: number;
    startTop: number;
    targetLeft: number;
    targetTop: number;
  }>>([]);

  // Refs to compute animation path from form to delivery box
  const cartTargetRef = useRef<HTMLDivElement | null>(null);
  const formLaunchRef = useRef<HTMLDivElement | null>(null);
  
  // Orders list editing state
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Order>({
    id: 0,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerLocation: '',
    items: '',
    specialInstructions: '',
    assignedDriverId: undefined
  });

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = (e: any) => {
      setScrollY(e.target.scrollTop);
    };
    
    const scrollContainer = document.querySelector('.parallax-scroll');
    scrollContainer?.addEventListener('scroll', handleScroll);
    
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [step]);

  // Periodic standing animation for driver
  useEffect(() => {
    if (step === 'cart' || step === 'adding') {
      const interval = setInterval(() => {
        setDriverPosition('standing');
        setTimeout(() => {
          setDriverPosition('leaning');
        }, 2000); // Stand for 2 seconds, then back to leaning
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [step]);

  // Keep cart doors open while adding orders
  useEffect(() => {
    if (step === 'adding') {
      setCartOpen(true);
    }
  }, [step]);

  // Prevent showing tracking state before dispatch
  useEffect(() => {
    if (step === 'tracking' && !hasDispatched) {
      setStep('adding');
      setCartOpen(true);
    }
  }, [step, hasDispatched]);

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      setStep('store-selection');
      setCartOpen(false);
      setHasDispatched(false);
      setOrders([]);
      setSelectedStore(null);
      setCurrentOrder({
        id: 0,
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerLocation: '',
        items: '',
        specialInstructions: '',
        assignedDriverId: undefined
      });
    }
  };

  const handleBackNavigation = () => {
    switch (step) {
      case 'store-selection':
        // From store selection, go back to login
        if (onBackToLogin) {
          onBackToLogin();
        }
        break;
      case 'cart':
        // From cart, go back to store selection
        setStep('store-selection');
        setSelectedStore(null);
        break;
      case 'adding':
        // From adding orders, go back to cart
        setStep('cart');
        setCartOpen(true);
        break;
      case 'dispatching':
        // From dispatching, go back to adding
        setStep('adding');
        setCartOpen(true);
        break;
      case 'tracking':
        // From tracking, go back to dispatching
        setStep('dispatching');
        break;
      case 'orders-list':
        // From orders list, go back to cart
        setStep('cart');
        setCartOpen(true);
        break;
      case 'live-tracking':
        // From live tracking, go back to tracking
        setStep('tracking');
        break;
      case 'data-import':
        // From data import, go back to adding
        setStep('adding');
        setCartOpen(true);
        break;
      default:
        // Default fallback to store selection
        setStep('store-selection');
        setSelectedStore(null);
    }
  };

  // Stock management functions for Airavya oils
  const handleStockUpdate = (itemId: number, newQuantity: number) => {
    if (setAiravyaStock) {
      setAiravyaStock(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleStockDeduction = (oilName: string, quantity: number) => {
    if (setAiravyaStock) {
      setAiravyaStock(prev => prev.map(item => 
        item.name === oilName ? { ...item, quantity: Math.max(0, item.quantity - quantity) } : item
      ));
    }
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveLocation = currentOrder.customerLocation || currentOrder.customerAddress;
    const newOrder = {
      ...currentOrder,
      customerLocation: effectiveLocation,
      id: orders.length + 1,
      timestamp: new Date(),
      storeId: selectedStore?.id,
      storeName: selectedStore?.name
    };
    setOrders([...orders, newOrder]);
    
    // Deduct stock for Airavya oils if oil is selected
    if (selectedStore?.name === 'Airavya oils' && selectedOil && oilQuantity > 0) {
      handleStockDeduction(selectedOil, oilQuantity);
    }
    
    // Also add to shared orders for global sync (store-based only)
    if (setSharedOrders && selectedStore) {
      const sharedOrder: SharedOrder = {
        id: Math.max(0, ...sharedOrders.map(o => o.id)) + 1,
        storeOwnerId: 1, // Single store owner ID
        storeOwnerName: 'Store Owner',
        customerName: currentOrder.customerName,
        customerPhone: currentOrder.customerPhone,
        customerAddress: currentOrder.customerAddress,
        customerLocation: effectiveLocation,
        items: currentOrder.items,
        specialInstructions: currentOrder.specialInstructions,
        timestamp: new Date(),
        status: 'pending',
        assignedDriverId: currentOrder.assignedDriverId,
        storeId: selectedStore.id,
        storeName: selectedStore.name
      };
      setSharedOrders([...sharedOrders, sharedOrder]);
    }
    
         // Create flying animation from form launch to cart interior
     const launchRect = formLaunchRef.current?.getBoundingClientRect();
     const targetRect = cartTargetRef.current?.getBoundingClientRect();
     if (launchRect && targetRect) {
       const packageId = Date.now();
       setFlyingPackages(prev => [
         ...prev,
         {
           id: packageId,
           customerName: currentOrder.customerName || 'Package',
           startLeft: launchRect.left + launchRect.width / 2 - 20,
           startTop: launchRect.top + launchRect.height / 2 - 20,
           targetLeft: targetRect.left + targetRect.width / 2 - 20,
           targetTop: targetRect.top + targetRect.height / 2 - 20,
         }
       ]);

       // Enhanced mobile animation following with debugging
       const isMobile = window.innerWidth <= 768;
       console.log('🚀 Flying animation triggered:', {
         isMobile,
         customerName: currentOrder.customerName,
         launchRect: launchRect ? 'found' : 'not found',
         targetRect: targetRect ? 'found' : 'not found'
       });
       
       if (isMobile) {
         // Force scroll to delivery box immediately
         setTimeout(() => {
           const deliveryBoxElement = cartTargetRef.current?.closest('.relative');
           console.log('📦 Delivery box element:', deliveryBoxElement ? 'found' : 'not found');
           if (deliveryBoxElement) {
             deliveryBoxElement.scrollIntoView({ 
               behavior: 'smooth', 
               block: 'center',
               inline: 'center'
             });
             console.log('✅ Scrolled to delivery box');
           }
         }, 100); // Reduced delay for faster response
         
         // Scroll back to form after animation
         setTimeout(() => {
           const formElement = document.getElementById('package-form');
           console.log('📝 Form element:', formElement ? 'found' : 'not found');
           if (formElement) {
             formElement.scrollIntoView({ 
               behavior: 'smooth', 
               block: 'start',
               inline: 'center'
             });
             console.log('✅ Scrolled back to form');
           }
         }, 800); // Reduced delay
       }

       // Remove flying package after animation completes
       setTimeout(() => {
         setFlyingPackages(prev => prev.filter(p => p.id !== packageId));
       }, 1800);
    }
    
    setCurrentOrder({
      id: 0,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerLocation: '',
      items: '',
      specialInstructions: ''
    });
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? currentOrder : order
      ));
      setEditingOrder(null);
      setCurrentOrder({
        id: 0,
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerLocation: '',
        items: '',
        specialInstructions: '',
        assignedDriverId: undefined
      });
      setStep('orders-list');
    }
  };

  const handleReadyToDispatch = () => {
    setStep('dispatching');
          setHasDispatched(true);
      // Close doors immediately on dispatch
      setCartOpen(false);
      // Optional brief delay before showing tracking summary
    setTimeout(() => {
        setStep('tracking');
      }, 1200);
  };

  // Intelligent data import parsing function (format-agnostic)
  const parseCustomerData = (data: string) => {
    const lines = data.split(/\r?\n/);
    const customers: Array<{
      name: string;
      phone: string;
      location: string;
      address: string;
    }> = [];

    const phoneRegex = /(\+?\d[\d\s\-().]{8,}?\d)/g; // country codes and separators

    const stripLabel = (text: string) => {
      return text
        .replace(/^(name|customer name|customer|cust|full name)[:\-\s]+/i, '')
        .replace(/^(phone|mobile|mob|contact|ph)[:\-\s]+/i, '')
        .replace(/^(address|addr|location|loc|place|city)[:\-\s]+/i, '')
        .trim();
    };

    const normalizePhone = (raw: string) => {
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 13) {
        // If includes country code, prefer last 10-11 digits commonly used locally
        if (digits.length > 11) {
          return digits.slice(digits.length - 10);
        }
        return digits;
      }
      // Try last 10 if longer
      if (digits.length > 13) return digits.slice(digits.length - 10);
      return '';
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim()) continue;
      const cleanLine = line.trim();

      // Find all phone matches in this line (avoid matchAll for compatibility)
      const matches: RegExpMatchArray[] = [];
      const linePhoneRe = new RegExp(phoneRegex.source, 'g');
      let mm: RegExpMatchArray | null;
      while ((mm = linePhoneRe.exec(cleanLine)) !== null) {
        matches.push(mm);
      }
      if (matches.length === 0) continue;

      // Process each phone occurrence in the line
      for (const m of matches) {
        const rawPhone = m[1];
        const phone = normalizePhone(rawPhone);
        if (!phone) continue;

        const indexInLine = cleanLine.indexOf(rawPhone);
        const beforePhone = stripLabel(cleanLine.substring(0, indexInLine)).replace(/[\-|,;|]+$/g, '').trim();
        const afterPhone = stripLabel(cleanLine.substring(indexInLine + rawPhone.length)).replace(/^[\-|,;|]+/g, '').trim();

        let nameCandidate = beforePhone;
        let locationCandidate = afterPhone;

        // If name missing, look at previous non-empty line for name
        if (!nameCandidate) {
          for (let p = i - 1; p >= 0; p--) {
            const prev = lines[p]?.trim();
            if (!prev) continue;
            const prevNoPhone = prev.replace(phoneRegex, '').trim();
            if (!prevNoPhone) continue;
            nameCandidate = stripLabel(prevNoPhone).replace(/[\-|,;|]+$/g, '').trim();
            if (nameCandidate) break;
          }
        }

        // If location missing, look at next non-empty line for location
        if (!locationCandidate) {
          for (let n = i + 1; n < Math.min(lines.length, i + 4); n++) {
            const nxt = lines[n]?.trim();
            if (!nxt) continue;
            const nxtNoPhone = nxt.replace(phoneRegex, '').trim();
            if (!nxtNoPhone) continue;
            locationCandidate = stripLabel(nxtNoPhone).replace(/^[\-|,;|]+/g, '').trim();
            if (locationCandidate) break;
          }
        }

        // Fallback split if still missing
        if (!nameCandidate || !locationCandidate) {
          const withoutPhone = stripLabel(cleanLine.replace(rawPhone, ' ').replace(/\s+/g, ' ').trim());
          const parts = withoutPhone.split(/[\-|,;|]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            if (!nameCandidate) nameCandidate = parts[0];
            if (!locationCandidate) locationCandidate = parts.slice(1).join(' ');
          } else if (parts.length === 1) {
            if (!nameCandidate) nameCandidate = parts[0];
          }
        }

        const name = (nameCandidate || '').replace(/[^\w\s.'-]/g, '').trim();
        const location = (locationCandidate || '').replace(/[^\w\s.,'()-]/g, '').trim();

        if (phone) {
          customers.push({
            name: name || 'Unknown',
            phone,
            location: location || 'Unknown',
            address: location || 'Unknown'
          });
        }
      }
    }

    // If still empty, attempt a loose scan across whole text for phones and use surrounding words
    if (customers.length === 0) {
      const allText = lines.join(' ');
      const allMatches: RegExpMatchArray[] = [];
      const allRe = new RegExp(phoneRegex.source, 'g');
      let m2: RegExpMatchArray | null;
      while ((m2 = allRe.exec(allText)) !== null) {
        allMatches.push(m2);
      }
      for (const m of allMatches) {
        const rawPhone = m[1];
        const phone = normalizePhone(rawPhone);
        if (!phone) continue;
        const idx = (m as any).index ?? 0;
        const start = Math.max(0, idx - 60);
        const end = Math.min(allText.length, idx + rawPhone.length + 60);
        const window = allText.substring(start, end);
        const words = window.replace(rawPhone, ' ').split(/\s+/).filter(Boolean);
        const name = stripLabel(words.slice(0, Math.min(4, words.length)).join(' '));
        const location = stripLabel(words.slice(Math.max(0, words.length - 6)).join(' '));
        if (name) {
          customers.push({ name, phone, location: location || 'Unknown', address: location || 'Unknown' });
        }
      }
    }

    return customers;
  };

  const handleDataImport = async () => {
    if (!importData.trim()) {
      alert('Please paste some customer data first');
      return;
    }

    setIsProcessingImport(true);
    
    try {
      // Local parser only
      let customers = parseCustomerData(importData);
      
      if (customers.length === 0) {
        alert('No valid customer data found. Please include at least a phone number per customer. Names and locations will be detected automatically if present.');
        setIsProcessingImport(false);
        return;
      }

      // Create orders from imported data
      const newOrders: Order[] = customers.map((customer, index) => ({
        id: orders.length + index + 1,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerLocation: customer.location,
        items: 'Imported order', // Default items
        specialInstructions: 'Imported from data',
        storeId: selectedStore?.id,
        storeName: selectedStore?.name
      }));

      setOrders([...orders, ...newOrders]);
      
      // Also add to shared orders (store-based only)
      if (setSharedOrders && selectedStore) {
        const sharedOrdersToAdd: SharedOrder[] = customers.map((customer, index) => ({
          id: Math.max(0, ...sharedOrders.map(o => o.id)) + index + 1,
          storeOwnerId: 1, // Single store owner ID
          storeOwnerName: 'Store Owner',
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          customerLocation: customer.location,
          items: 'Imported order',
          specialInstructions: 'Imported from data',
          timestamp: new Date(),
          status: 'pending',
          assignedDriverId: undefined, // Imported orders start unassigned
          storeId: selectedStore.id,
          storeName: selectedStore.name
        }));
        setSharedOrders([...sharedOrders, ...sharedOrdersToAdd]);
      }

      // Clear import data and show success message
      setImportData('');
      // Show inline success (avoid route reloads that can trigger auth refresh)
      console.log(`Successfully imported ${customers.length} customer(s)!`);

      // Prefill first parsed customer into form for quick edits/additions
      if (customers[0]) {
        setCurrentOrder({
          id: 0,
          customerName: customers[0].name,
          customerPhone: customers[0].phone,
          customerAddress: customers[0].address,
          customerLocation: customers[0].location,
          items: '',
          specialInstructions: ''
        });
      }
      
      // Switch to adding step to show the imported orders without reloading or leaving dashboard
      setStep('adding');
      setCartOpen(true);
      
    } catch (error) {
      alert('Error processing data. Please try again.');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleRemoveDeliveredOrder = (orderToRemove: SharedOrder) => {
    // Only allow removal if order is delivered and from current store owner
    if (orderToRemove.status === 'delivered' && orderToRemove.storeOwnerId === storeOwnerId) {
      // Remove from shared orders (this will sync to driver dashboard)
      if (setSharedOrders) {
        setSharedOrders(sharedOrders.filter(order => order.id !== orderToRemove.id));
      }
      
      // Also remove from local orders list if it exists
      setOrders(orders.filter(order => 
        !(order.customerName === orderToRemove.customerName &&
          order.customerPhone === orderToRemove.customerPhone)
      ));
    }
  };

  // Orders List Page with inline editing
  if (step === 'orders-list') {

    const handleStartEdit = (order: Order) => {
      setEditingOrderId(order.id);
      setEditForm(order);
    };

    const handleSaveEdit = (orderId: number) => {
      const originalOrder = orders.find(order => order.id === orderId);
      setOrders(orders.map(order => order.id === orderId ? editForm : order));
      
      // Also update shared orders with complete synchronization
      if (setSharedOrders && storeOwnerId && originalOrder) {
        setSharedOrders(sharedOrders.map(order => {
          // Find the shared order by matching original details
          if (order.storeOwnerId === storeOwnerId && 
              order.customerName === originalOrder.customerName &&
              order.customerPhone === originalOrder.customerPhone) {
            return {
              ...order,
              customerName: editForm.customerName,
              customerPhone: editForm.customerPhone,
              customerAddress: editForm.customerAddress,
              customerLocation: editForm.customerLocation,
              items: editForm.items,
              specialInstructions: editForm.specialInstructions
            };
          }
          return order;
        }));
      }
      
      setEditingOrderId(null);
    };

    const handleCancelEdit = () => {
      setEditingOrderId(null);
    };

    const handleDeleteOrder = (orderId: number) => {
      const orderToDelete = orders.find(order => order.id === orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      
      // Also remove from shared orders
      if (setSharedOrders && storeOwnerId && orderToDelete) {
        setSharedOrders(sharedOrders.filter(order => 
          !(order.storeOwnerId === storeOwnerId && order.customerName === orderToDelete.customerName)
        ));
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">All Orders ({orders.length})</h1>
            <button
              onClick={() => {
                // Always restore to adding unless the batch has been dispatched
                if (!hasDispatched) {
                  setStep('adding');
                  setCartOpen(true);
                  setTimeout(() => {
                    const sc = document.querySelector('.parallax-scroll') as HTMLElement | null;
                    if (sc) sc.scrollTop = savedAddingScrollTop;
                  }, 0);
                } else {
                  setStep('tracking');
                }
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back
            </button>
          </div>

          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={order.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                {editingOrderId === order.id ? (
                  // Editing mode
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-lg mb-4">Edit Order #{index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editForm.customerName}
                        onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                        className="px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                        placeholder="Customer Name"
                      />
                      <input
                        type="tel"
                        value={editForm.customerPhone}
                        onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                        className="px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                        placeholder="Phone"
                      />
                    </div>
                    <input
                      value={editForm.customerAddress}
                      onChange={(e) => setEditForm({...editForm, customerAddress: e.target.value})}
                      className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                      placeholder="Address"
                    />
                    <div className="flex space-x-2">
                      <input
                        value={editForm.customerLocation}
                        onChange={(e) => setEditForm({...editForm, customerLocation: e.target.value})}
                        className="flex-1 px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                        placeholder="Location"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const location = editForm.customerLocation || editForm.customerAddress;
                          if (location) {
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank');
                          } else {
                            alert('Please enter a location first');
                          }
                        }}
                        className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-3 py-2 rounded text-sm transition-all duration-200 whitespace-nowrap"
                      >
                        🗺️ Map
                      </button>
                    </div>
                    <input
                      value={editForm.items}
                      onChange={(e) => setEditForm({...editForm, items: e.target.value})}
                      className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                      placeholder="Items"
                    />
                    <input
                      value={editForm.specialInstructions}
                      onChange={(e) => setEditForm({...editForm, specialInstructions: e.target.value})}
                      className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                      placeholder="Special Instructions"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSaveEdit(order.id)}
                        className="bg-green-600/80 hover:bg-green-500/80 text-white px-4 py-2 rounded font-medium transition-all duration-200"
                      >
                        💾 Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600/80 hover:bg-gray-500/80 text-white px-4 py-2 rounded font-medium transition-all duration-200"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-white text-lg font-medium mb-2">
                        <span className="text-white font-bold">#{index + 1}</span> {order.customerName} • {order.customerPhone}
                      </div>
                      <div className="text-white/80 text-sm mb-3">
                        {order.items} → {order.customerAddress}
                        {order.specialInstructions && (
                          <span className="text-white/70"> • {order.specialInstructions}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleStartEdit(order)}
                        className="bg-gray-600/80 hover:bg-gray-500/80 text-white px-3 py-1 rounded text-sm transition-all duration-200 border border-gray-400/50"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-1 rounded text-sm transition-all duration-200 border border-gray-600/50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center text-white/70 py-12">
                <p className="text-xl">No orders yet</p>
                <p className="text-sm mt-2">Add some orders to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Store Selection View
  if (step === 'store-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Select Store</h1>
            <button
              onClick={onBackToLogin}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              ← Back to Login
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 text-center">🏪 Choose Your Store</h2>
            <p className="text-white/70 text-center mb-8">Select the store you want to manage orders for</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setStep('cart');
                  }}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 transition-all duration-200 text-left group hover:scale-105 hover:shadow-lg"
                >
                  <div className="text-4xl mb-4 text-center">🏪</div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300">{store.name}</h3>
                  <p className="text-white/70 text-sm mb-2">📍 {store.address}</p>
                  <p className="text-white/70 text-sm mb-2">📞 {store.phone}</p>
                  <div className="text-center mt-4">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Select Store
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {stores.length === 0 && (
              <div className="text-center py-12 text-white/50">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold mb-2">No Stores Available</h3>
                <p className="mb-4">No stores have been added yet. Please contact the developer to add stores.</p>
                <button
                  onClick={onBackToLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-2 md:p-6 relative overflow-hidden">
      {/* Flying Package Animations */}
             <AnimatePresence>
         {flyingPackages.map((pkg) => {
           const isMobile = window.innerWidth <= 768;
           return (
             <motion.div
               key={pkg.id}
               initial={{ left: pkg.startLeft, top: pkg.startTop, scale: 1, opacity: 1, rotate: 0 }}
               animate={{ 
                 left: pkg.targetLeft, 
                 top: pkg.targetTop, 
                 scale: isMobile ? 0.8 : 0.6, 
                 opacity: 0.95, 
                 rotate: 360 
               }}
               exit={{ opacity: 0, scale: 0.2 }}
               transition={{ 
                 duration: isMobile ? 1.8 : 1.4, 
                 ease: 'easeInOut', 
                 type: 'spring', 
                 stiffness: isMobile ? 80 : 120 
               }}
               className="fixed pointer-events-none"
               style={{ 
                 width: isMobile ? 50 : 40, 
                 height: isMobile ? 50 : 40,
                 zIndex: 9999 
               }}
             >
               <div className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.9)] flex items-center justify-center text-xl border-2 border-white`}>
                 📦
               </div>
               <div className="mt-1 text-center text-[10px] text-white font-bold drop-shadow-lg">{pkg.customerName}</div>
             </motion.div>
           );
         })}
       </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button and Hamburger Menu - Mobile Compact */}
        <div className="flex justify-between items-center mb-2 md:mb-8">
          <h1 className="text-lg md:text-3xl font-bold text-white">
            {step === 'tracking' ? 'Track Orders' : 
             step === 'data-import' ? 'Import Customer Data' : 'Store Dashboard'}
          </h1>
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Hamburger Menu - Mobile Compact */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-white/20 hover:bg-white/30 text-white p-1 md:p-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <div className="w-5 h-5 md:w-6 md:h-6 flex flex-col justify-center space-y-0.5 md:space-y-1">
                  <div className="w-5 md:w-6 h-0.5 bg-white"></div>
                  <div className="w-5 md:w-6 h-0.5 bg-white"></div>
                  <div className="w-5 md:w-6 h-0.5 bg-white"></div>
                </div>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={() => {
                    // Save scroll before leaving adding screen
                    if (step === 'adding') {
                      const sc = document.querySelector('.parallax-scroll') as HTMLElement | null;
                      setSavedAddingScrollTop(sc ? sc.scrollTop : 0);
                    }
                      setStep('orders-list');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition-all duration-200 border-b border-gray-200"
                  >
                    📋 See Listed Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => {
                      // Save scroll before leaving adding screen
                      if (step === 'adding') {
                        const sc = document.querySelector('.parallax-scroll') as HTMLElement | null;
                        setSavedAddingScrollTop(sc ? sc.scrollTop : 0);
                      }
                      setStep('live-tracking');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition-all duration-200 border-b border-gray-200"
                  >
                    📍 Track Orders
                  </button>
                  {selectedStore?.name === 'Airavya oils' ? (
                    <button
                      onClick={() => {
                        setShowStockManagement(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-b-lg transition-all duration-200"
                    >
                      📦 Stock Management
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setStep('data-import');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-b-lg transition-all duration-200"
                    >
                      📋 Import Customer Data
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {step === 'data-import' && (
            <button
                onClick={handleBackNavigation}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 mr-2"
              >
                ← Back to Orders
              </button>
            )}
            <button
              onClick={handleBackNavigation}
              className="bg-white/20 hover:bg-white/30 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm md:text-base"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Tracking Page - Mobile Compact */}
        {step === 'tracking' && hasDispatched && (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-2xl max-w-2xl mx-auto border border-white/20">
              <h2 className="text-xl md:text-3xl font-bold text-white mb-4 md:mb-6">🚚 Dispatched!</h2>
              <div className="space-y-4 text-white/90">
                <p className="text-lg">✅ {(sharedOrders || [])
                  .filter(order => {
                    // Filter by selected store ID only
                    return selectedStore?.id ? order.storeId === selectedStore.id : false;
                  }).length} orders are on the way to customers</p>
                <p className="text-sm text-white/70">Driver left with all packages at {new Date().toLocaleTimeString()}</p>
                
                <div className="bg-white/5 rounded-lg p-4 mt-6 border border-white/10">
                  <h3 className="font-bold text-white mb-3">📦 Dispatched Orders:</h3>
                  {(sharedOrders || [])
                    .filter(order => {
                      // Filter by selected store ID only
                      return selectedStore?.id ? order.storeId === selectedStore.id : false;
                    })
                    .map((order, index) => (
                    <div key={order.id} className="text-sm text-white/80 mb-2">
                      #{index + 1} {order.customerName} - {order.items}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-4 justify-center mt-6">
                  <button
                    onClick={() => setStep('live-tracking')}
                    className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-blue-400/50 shadow-lg"
                  >
                    📍 Track Your Orders
                  </button>
                  
                  <button
                    onClick={() => {
                      setStep('cart');
                      setOrders([]);
                      setHasDispatched(false);
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg"
                  >
                    🆕 Start New Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Tracking Page */}
        {step === 'live-tracking' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Live Order Tracking</h1>
              <button
                onClick={() => { if (hasDispatched) { setStep('tracking'); } else { setStep('adding'); setCartOpen(true); } }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                ← Back to Dispatch
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Your Order Status</h2>
              
              {/* Live tracking data from shared orders */}
              <div className="space-y-4">
                {selectedStore && sharedOrders.filter(order => order.storeId === selectedStore.id).map((order, index) => {
                  const currentStatus = order.status;
                  
                  const getStatusDetails = (status: string) => {
                    switch (status) {
                      case 'pending':
                        return { color: 'bg-yellow-600/20 border-yellow-400/30', text: 'text-yellow-100', icon: '📦', message: 'Waiting for driver pickup' };
                      case 'picked_up':
                        return { color: 'bg-blue-600/20 border-blue-400/30', text: 'text-blue-100', icon: '🚛', message: 'Driver is on the way to customer' };
                      case 'delivered':
                        return { color: 'bg-green-600/20 border-green-400/30', text: 'text-green-100', icon: '✅', message: 'Successfully delivered to customer' };
                      default:
                        return { color: 'bg-gray-600/20 border-gray-400/30', text: 'text-gray-100', icon: '❓', message: 'Status unknown' };
                    }
                  };
                  
                  const statusDetails = getStatusDetails(currentStatus);
                  
                  return (
                    <div key={order.id} className={`rounded-lg p-6 border ${statusDetails.color}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium text-lg">Order #{index + 1}</h3>
                        <div className={`flex items-center space-x-2 ${statusDetails.text}`}>
                          <span className="text-xl">{statusDetails.icon}</span>
                          <span className="font-medium">
                            {currentStatus === 'pending' && 'Pending Pickup'}
                            {currentStatus === 'picked_up' && 'In Transit'}
                            {currentStatus === 'delivered' && 'Delivered'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-white/90"><span className="text-white/70">Customer:</span> {order.customerName}</p>
                          <p className="text-white/90"><span className="text-white/70">Phone:</span> {order.customerPhone}</p>
                          <p className="text-white/90"><span className="text-white/70">Address:</span> {order.customerAddress}</p>
                        </div>
                        <div>
                          <p className="text-white/90"><span className="text-white/70">Items:</span> {order.items}</p>
                          <p className="text-white/90"><span className="text-white/70">Ordered:</span> {order.timestamp.toLocaleTimeString()}</p>
                          {order.specialInstructions && (
                            <p className="text-white/90"><span className="text-white/70">Instructions:</span> {order.specialInstructions}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className={`text-sm ${statusDetails.text} italic`}>
                        {statusDetails.message}
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                          <span>Order Placed</span>
                          <span>Picked Up</span>
                          <span>Delivered</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              currentStatus === 'pending' ? 'w-1/3 bg-yellow-500' :
                              currentStatus === 'picked_up' ? 'w-2/3 bg-blue-500' :
                              'w-full bg-green-500'
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Remove order option for delivered orders */}
                      {currentStatus === 'delivered' && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <button
                            onClick={() => handleRemoveDeliveredOrder(order)}
                            className="bg-red-600/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-red-400/40 w-full"
                          >
                            🗑️ Remove Completed Order
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {(!storeOwnerId || sharedOrders.filter(order => order.storeOwnerId === storeOwnerId).length === 0) && (
                <div className="text-center text-white/70 py-12">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-lg">No orders to track</p>
                  <p className="text-sm mt-2">Create and dispatch some orders to see live tracking</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  Status updates automatically as drivers update order progress
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Animation Area - Mobile Compact */}
        {(step === 'cart' || step === 'adding' || step === 'dispatching') && (
          <div className="flex justify-center items-center mb-2 md:mb-8">
            {/* Mobile-Friendly Delivery Box */}
            <div className="relative">
              <div className={`relative transition-all duration-700`}>
                {/* Box Body - Smaller for Mobile */}
                <div
                  className="w-48 h-28 md:w-56 md:h-36 bg-gray-300 rounded-md border-4 border-gray-500 relative overflow-hidden shadow-2xl cursor-pointer"
                  style={{ perspective: '1000px' }}
                  onClick={() => {
                    const nextOpen = !cartOpen;
                    setCartOpen(nextOpen);
                    if (nextOpen) {
                      // Move to adding after opening
                      setTimeout(() => setStep('adding'), 150);
                    }
                  }}
                  title="Tap to open/close"
                >
                  {/* Side label */}
                  <div className="absolute top-1 right-2 text-xs font-bold tracking-widest text-gray-700">DeliBox</div>
                  {/* Inner */}
                  <div className="absolute inset-2 bg-gray-200 rounded"></div>
                  {/* Landing target */}
                  <div ref={cartTargetRef} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-6 md:w-12 md:h-8" />

                  {/* Left Door */}
                  <div
                    className="absolute top-0 left-0 w-1/2 h-full bg-gray-400 border-r-2 border-gray-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left',
                      transition: 'transform 700ms ease',
                      transform: cartOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-between px-2 select-none">
                      <span className="text-gray-700 font-extrabold text-lg">C</span>
                      <span className="text-gray-700 font-extrabold text-lg">O</span>
                      <span className="text-gray-700 font-extrabold text-lg">S</span>
                  </div>
                  </div>
                  {/* Right Door */}
                  <div
                    className="absolute top-0 right-0 w-1/2 h-full bg-gray-400 border-l-2 border-gray-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'right',
                      transition: 'transform 700ms ease',
                      transform: cartOpen ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-between px-2 select-none">
                      <span className="text-gray-700 font-extrabold text-lg">M</span>
                      <span className="text-gray-700 font-extrabold text-lg">Y</span>
                      <span className="text-gray-700 font-extrabold text-lg">K</span>
                </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Import Section */}
        {step === 'data-import' && (
          <div className="max-w-4xl mx-auto px-2 md:px-4">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/20"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  📋 Import Customer Data
                </h2>
                <p className="text-white/80 text-sm md:text-base">
                  Paste customer data in any format. Names, phones, and locations are auto-detected.
                </p>
              </div>

              <div className="space-y-4">
                {/* Data Input Area */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Paste Customer Data:
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your customer data here. We'll auto-detect names, phone numbers (with or without country codes), and locations. Any format is fine."
                    className="w-full h-48 md:h-64 px-4 py-3 bg-gray-800/70 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none"
                    disabled={isProcessingImport}
                  />
                </div>

                {/* Detection Details (no format requirements shown) */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <h3 className="text-white font-medium mb-3">🤖 Smart Auto-Detection</h3>
                  <div className="text-white/80 text-sm">
                    Names, phone numbers (with or without country codes), and locations are detected automatically from your pasted text. No specific format needed.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3 justify-center">
                  <motion.button
                    onClick={handleDataImport}
                    disabled={isProcessingImport || !importData.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center"
                  >
                    {isProcessingImport ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      '✅ Done - Import Data'
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      setStep('adding');
                      setCartOpen(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200"
                  >
                    📦 Back to Add Orders
                  </motion.button>
                </div>

                {/* Import Status */}
                {importData.trim() && (
                  <div className="text-center">
                    <div className="text-white/60 text-sm">
                      {importData.split('\n').filter(line => line.trim()).length} lines detected
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

                {/* Package-Style Order Form */}
        {step === 'adding' && (
                     <div className="max-w-2xl mx-auto px-2 md:px-4">
             {/* Store Owner Package Label - Ultra Compact for Mobile */}
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="relative rounded-xl p-2 md:p-4 mb-2 md:mb-4 bg-gray-900/60 border border-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,0.35)] backdrop-blur"
             >
               <div className="text-center">
                 <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                   📦 Package #{orders.length + 1}
                 </h2>
                 <div className="text-cyan-300 font-medium text-sm">
                   Store: {selectedStore ? selectedStore.name : (storeOwnerId ? `#${storeOwnerId}` : 'Default')} 
                      </div>
                      </div>
               {/* Launch marker for flying animation */}
               <div ref={formLaunchRef} className="absolute -bottom-2 right-6 w-8 h-8" />
             </motion.div>

                         {/* Package Details Form - Mobile Optimized */}
             <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3 }}
               className="relative rounded-xl p-4 bg-gray-900/70 border border-white/10"
               id="package-form"
             >
               {/* Mobile-Friendly Tab Navigation */}
               <div className="mb-4">
                 <div className="flex bg-gray-800/50 rounded-lg p-1">
                   <button
                     onClick={() => setActiveTab('customer')}
                     className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                       activeTab === 'customer'
                         ? 'bg-cyan-500 text-white shadow-lg'
                         : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                     }`}
                   >
                     👤 Customer
                   </button>
                   <button
                     onClick={() => setActiveTab('order')}
                     className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                       activeTab === 'order'
                         ? 'bg-green-500 text-white shadow-lg'
                         : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                     }`}
                   >
                     📦 Order
                   </button>
                   <button
                     onClick={() => setActiveTab('delivery')}
                     className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                       activeTab === 'delivery'
                         ? 'bg-fuchsia-500 text-white shadow-lg'
                         : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                     }`}
                   >
                     🚚 Delivery
                   </button>
                 </div>
               </div>

               <form onSubmit={editingOrder ? handleUpdateOrder : handleAddOrder} className="space-y-3">
                 {/* Tab Content */}
                 <AnimatePresence mode="wait">
                   {activeTab === 'customer' && (
                     <motion.div
                       key="customer"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       transition={{ duration: 0.3 }}
                       className="space-y-3"
                     >
                       <div className="text-center mb-3">
                         <h3 className="text-lg font-semibold text-cyan-300">👤 Customer Information</h3>
                         <p className="text-sm text-gray-400">Enter customer details</p>
                       </div>
                       
                    <input
                      type="text"
                      value={currentOrder.customerName}
                      onChange={(e) => setCurrentOrder({...currentOrder, customerName: e.target.value})}
                         className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-base transition-all duration-200"
                   placeholder="Customer name"
                      required
                    />
                       
                    <input
                      type="tel"
                      value={currentOrder.customerPhone}
                      onChange={(e) => setCurrentOrder({...currentOrder, customerPhone: e.target.value})}
                         className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-base transition-all duration-200"
                   placeholder="Phone number"
                      required
                    />
                     </motion.div>
                   )}

                   {activeTab === 'order' && (
                     <motion.div
                       key="order"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       transition={{ duration: 0.3 }}
                       className="space-y-3"
                     >
                       <div className="text-center mb-3">
                         <h3 className="text-lg font-semibold text-green-300">📦 Order Details</h3>
                         <p className="text-sm text-gray-400">What items to deliver</p>
                       </div>
                       
                       {selectedStore?.name === 'Airavya oils' ? (
                         <div className="space-y-3">
                           <select
                             value={selectedOil}
                             onChange={(e) => {
                               setSelectedOil(e.target.value);
                               setCurrentOrder({...currentOrder, items: e.target.value});
                             }}
                             className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-base transition-all duration-200"
                             required
                           >
                             <option value="">Select Oil</option>
                             {airavyaStock.map(oil => (
                               <option key={oil.id} value={oil.name} className="bg-gray-800">
                                 {oil.name} (Stock: {oil.quantity})
                               </option>
                             ))}
                           </select>
                           
                                      <input
                             type="number"
                             min="1"
                             max={airavyaStock.find(oil => oil.name === selectedOil)?.quantity || 1}
                             value={oilQuantity}
                             onChange={(e) => setOilQuantity(parseInt(e.target.value) || 1)}
                             className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-base transition-all duration-200"
                             placeholder="Quantity"
                      required
                    />
                         </div>
                       ) : (
                    <input
                      value={currentOrder.items}
                      onChange={(e) => setCurrentOrder({...currentOrder, items: e.target.value})}
                           className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-base transition-all duration-200"
                           placeholder="Items to deliver (e.g., Pizza, Burger, Drinks)"
                      required
                    />
                       )}
                       
                       <textarea
                    value={currentOrder.specialInstructions}
                    onChange={(e) => setCurrentOrder({...currentOrder, specialInstructions: e.target.value})}
                         className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base resize-none transition-all duration-200"
                         placeholder="Special instructions (e.g., Extra spicy, No onions)"
                         rows={2}
                       />
                     </motion.div>
                   )}

                   {activeTab === 'delivery' && (
                     <motion.div
                       key="delivery"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       transition={{ duration: 0.3 }}
                       className="space-y-3"
                     >
                       <div className="text-center mb-3">
                         <h3 className="text-lg font-semibold text-fuchsia-300">🚚 Delivery Information</h3>
                         <p className="text-sm text-gray-400">Where to deliver</p>
                       </div>
                       
                                      <input
                      value={currentOrder.customerAddress}
                      onChange={(e) => setCurrentOrder({...currentOrder, customerAddress: e.target.value})}
                         className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 text-base transition-all duration-200"
                         placeholder="Full delivery address"
                      required
                    />
                       
                      <input
                        value={currentOrder.customerLocation}
                        onChange={(e) => setCurrentOrder({...currentOrder, customerLocation: e.target.value})}
                         className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 text-base transition-all duration-200"
                         placeholder="Area/Landmark (e.g., Near City Mall)"
                      required
                    />
                       
                       {/* Driver Assignment */}
                       <div className="mt-4">
                         <label className="block text-fuchsia-300 font-medium mb-2">🚚 Assign Delivery To</label>
                         <select
                           value={currentOrder.assignedDriverId || ''}
                           onChange={(e) => setCurrentOrder({...currentOrder, assignedDriverId: e.target.value ? parseInt(e.target.value) : undefined})}
                           className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-white/10 text-white focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 text-base transition-all duration-200"
                         >
                           <option value="">Select Driver (Optional)</option>
                           {drivers.map(driver => (
                             <option key={driver.id} value={driver.id} className="bg-gray-800">
                               {driver.username} - {driver.phoneNumber}
                             </option>
                           ))}
                         </select>
                         {currentOrder.assignedDriverId && (
                           <p className="text-fuchsia-300 text-sm mt-2">
                             ✓ Assigned to: {drivers.find(d => d.id === currentOrder.assignedDriverId)?.username}
                           </p>
                         )}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {/* Submit Button */}
                 <div className="pt-2">
                   <motion.button
                      type="submit"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                   >
                     {editingOrder ? '💾 Save Changes' : '📦 Add Package'}
                   </motion.button>
                 </div>
               </form>
             </motion.div>

                         {/* Orders Summary - Ultra Compact for Mobile */}
             {orders.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
                 className="mt-2 md:mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/20"
               >
                 <h3 className="text-white font-bold text-sm md:text-base mb-2 md:mb-3 text-center">
                   📋 Queue - {selectedStore?.name} ({orders.filter(order => order.storeId === selectedStore?.id).length})
                 </h3>
                 <div className="space-y-1 md:space-y-2 max-h-24 md:max-h-32 overflow-y-auto">
                   {orders.filter(order => order.storeId === selectedStore?.id).map((order, index) => (
                     <motion.div 
                       key={order.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.3, delay: index * 0.1 }}
                       className="bg-white/20 rounded-lg p-1 md:p-2 border border-white/30"
                     >
                       <div className="text-white font-medium text-xs md:text-sm">
                         #{index + 1} {order.customerName}
              </div>
                       <div className="text-white/80 text-xs">
                         {order.items.substring(0, 20)}...
                       </div>
                     </motion.div>
                   ))}
                 </div>
               </motion.div>
             )}

                              {/* Ready to Dispatch Button */}
                {orders.filter(order => order.storeId === selectedStore?.id).length > 0 && !editingOrder && (
                             <div className="text-center mt-4 md:mt-8">
                 <motion.button
                      onClick={handleReadyToDispatch}
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-2xl transition-all duration-300 border-2 border-blue-400 animate-pulse"
                    >
                   🚚 Dispatch ({orders.length})
                 </motion.button>
                  </div>
                )}
          </div>
        )}

        {/* Dispatching State */}
        {step === 'dispatching' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              📦 Packing {orders.length} Orders...
            </h2>
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}

        {/* Stock Management Modal for Airavya oils */}
        {showStockManagement && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">📦 Stock Management - Airavya oils</h2>
                <button
                  onClick={() => setShowStockManagement(false)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {airavyaStock.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold capitalize">{item.name}</h3>
                        <p className="text-white/70 text-sm">Current Stock: {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleStockUpdate(item.id, Math.max(0, item.quantity - 1))}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg bg-gray-800/70 border border-white/10 text-white text-center text-sm focus:outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => handleStockUpdate(item.id, item.quantity + 1)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">➕ Add New Oil</h3>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Oil name"
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Quantity"
                      className="w-20 px-3 py-2 rounded-lg bg-gray-800/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStockManagement(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;