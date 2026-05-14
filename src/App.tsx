import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, CheckCircle2, Clock, Leaf, Bell, Star, 
  Wallet, ShoppingBag, MapPin, ArrowRight, Minus, Plus, Info, Trash2
} from 'lucide-react';
import logoPic from './assets/images/regenerated_image_1778690199163.png';
import rotiCanaiImg from './assets/images/regenerated_image_1778739198145.jpg';
import maggiGorengImg from './assets/images/regenerated_image_1778739199815.jpg';
import roastedChickenRiceImg from './assets/images/regenerated_image_1778739332589.jpg';
import steamedChickenRiceImg from './assets/images/regenerated_image_1778739334317.jpg';
import sweetSourChickenImg from './assets/images/regenerated_image_1778739792095.jpg';
import vegetarianMixedRiceImg from './assets/images/regenerated_image_1778739793899.jpg';

// --- DATA ---
const VENDORS = [
  {
    id: 'v1',
    name: 'Mamak',
    location: 'Starbees MMU Melaka',
    rating: 4.8,
    image: 'https://placehold.co/400x300/F9CD9C/EF8B19?text=Mamak',
    items: [
      { id: 'm1', name: 'Roti Canai', price: 2.00, image: rotiCanaiImg, desc: 'Flaky flatbread served with dhal and curry.' },
      { id: 'm2', name: 'Maggi Goreng', price: 6.00, image: maggiGorengImg, desc: 'Spicy stir-fried instant noodles.' }
    ]
  },
  {
    id: 'v2',
    name: 'Uncle Tan Chicken Rice',
    location: 'Starbees MMU Melaka',
    rating: 4.9,
    image: 'https://placehold.co/400x300/F9CD9C/EF8B19?text=Chicken+Rice',
    items: [
      { id: 'u1', name: 'Roasted Chicken Rice', price: 7.00, image: roastedChickenRiceImg, desc: 'Flavorful roasted chicken served with seasoned rice.' },
      { id: 'u2', name: 'Steamed Chicken Rice', price: 7.00, image: steamedChickenRiceImg, desc: 'Tender steamed chicken served with seasoned rice.' }
    ]
  },
  {
    id: 'v3',
    name: 'Chinese Mixed Rice',
    location: 'Starbees MMU Melaka',
    rating: 4.6,
    image: 'https://placehold.co/400x300/F9CD9C/EF8B19?text=Mixed+Rice',
    items: [
      { id: 'c1', name: 'Sweet & Sour Chicken Rice', price: 8.00, image: sweetSourChickenImg, desc: 'Crispy chicken chunks in sweet and sour sauce with rice.' },
      { id: 'c2', name: 'Vegetarian Mixed Rice', price: 6.00, image: vegetarianMixedRiceImg, desc: 'Selection of fresh vegetarian dishes with rice.' }
    ]
  }
];

const generateTimeOptions = () => {
    const options = [];
    let start = 9 * 60; // 9:00 AM
    let end = 18 * 60 + 30; // 6:30 PM
    for (let time = start; time <= end; time += 15) {
        let hr = Math.floor(time / 60);
        let min = time % 60;
        let ampm = hr >= 12 ? 'PM' : 'AM';
        let displayHr = hr > 12 ? hr - 12 : hr;
        let displayMin = min === 0 ? '00' : String(min);
        options.push(`${displayHr}:${displayMin} ${ampm}`);
    }
    return options;
};

const TIME_OPTIONS = generateTimeOptions();

type CartItem = { id: string, name: string, price: number, quantity: number, image: string };

export default function App() {
  const [viewMode, setViewMode] = useState<'student' | 'vendor'>('student');
  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('qb_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('qb_orders', JSON.stringify(orders));
  }, [orders]);

  const [currentScreen, setCurrentScreen] = useState('login');
  
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [rewardPoints, setRewardPoints] = useState(10);
  const [topUpAmount, setTopUpAmount] = useState('');
  
  const [selectedVendor, setSelectedVendor] = useState(VENDORS[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [pickupDate, setPickupDate] = useState('Today');
  const [pickupTime, setPickupTime] = useState(TIME_OPTIONS[0]);
  const [goGreen, setGoGreen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pointsApplied, setPointsApplied] = useState(false);
  const [vendorNote, setVendorNote] = useState('');
  
  // result screen states
  const [orderNumber, setOrderNumber] = useState('');
  const [toastData, setToastData] = useState<{title: string, message: string} | null>(null);
  const [earnedPointsContext, setEarnedPointsContext] = useState(0);
  const [localReadyNotified, setLocalReadyNotified] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'all', orderId?: string } | null>(null);

  const currentOrder = orders.find(o => o.id === orderNumber);
  const currentStatus = currentOrder?.status || 'placed';

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const basePrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const pointsDiscount = pointsApplied ? 0.50 : 0;
  const finalPrice = Math.max(0, basePrice - pointsDiscount);
  const potentialPoints = Math.floor(basePrice) + (goGreen ? 5 : 0);

  const showToast = (title: string, message: string) => {
      setToastData({ title, message });
      setTimeout(() => setToastData(null), 4000);
  };

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('home');
  };

  const handleTopUp = () => {
    const amt = parseFloat(topUpAmount);
    if (amt && amt > 0) {
        setWalletBalance(prev => prev + amt);
        setTopUpAmount('');
        showToast('Wallet Updated', `RM ${amt.toFixed(2)} successfully added!`);
        navigate('home');
        
        // Ensure display resets accurately if DOM was mutated directly
        const display = document.getElementById('expected-balance-display');
        if (display) display.innerText = `Expected Balance after top-up: RM ${(walletBalance + amt).toFixed(2)}`;
    }
  };

  const calculateExpectedBalance = (e: React.FormEvent<HTMLInputElement>) => {
      const inputVal = parseFloat(e.currentTarget.value);
      const expected = (!isNaN(inputVal) && inputVal > 0) ? walletBalance + inputVal : walletBalance;
      const displayElement = document.getElementById('expected-balance-display');
      if (displayElement) {
          displayElement.innerText = `Expected Balance after top-up: RM ${expected.toFixed(2)}`;
      }
  };

  const updateCartQuantity = (itemInfo: any, delta: number) => {
    setCart(prev => {
        const existing = prev.find(i => i.id === itemInfo.id);
        if (existing) {
            const newQty = existing.quantity + delta;
            if (newQty <= 0) return prev.filter(i => i.id !== itemInfo.id);
            return prev.map(i => i.id === itemInfo.id ? { ...i, quantity: newQty } : i);
        } else if (delta > 0) {
            return [...prev, { id: itemInfo.id, name: itemInfo.name, price: itemInfo.price, quantity: delta, image: itemInfo.image }];
        }
        return prev;
    });
  };

  const getItemQuantity = (id: string) => {
      const item = cart.find(i => i.id === id);
      return item ? item.quantity : 0;
  };

  const openVendor = (vendor: any) => {
      if (selectedVendor.id !== vendor.id) {
          setCart([]);
      }
      setSelectedVendor(vendor);
      navigate('menu');
  };

  const handleApplyPoints = () => {
    if (pointsApplied) {
      setPointsApplied(false);
    } else if (rewardPoints >= 10) {
      setPointsApplied(true);
    }
  };

  const handlePay = () => {
    if (walletBalance >= finalPrice) {
      setWalletBalance(prev => prev - finalPrice);
      
      let newPoints = rewardPoints;
      if (pointsApplied) newPoints -= 10;
      
      newPoints += potentialPoints;
      setEarnedPointsContext(potentialPoints);
      
      setRewardPoints(newPoints);
      
      const newOrderNum = `#QB-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
          id: newOrderNum,
          vendorName: selectedVendor.name,
          vendorId: selectedVendor.id,
          items: cart,
          note: vendorNote,
          pickupTime: pickupTime,
          pickupDate: pickupDate,
          datetime: new Date().toISOString(),
          status: 'preparing',
          basePrice,
          pointsApplied,
          pointsDiscount,
          finalPrice,
          earnedPointsContext: potentialPoints,
          goGreen
      };
      setOrders(prev => [newOrder, ...prev]);
      setOrderNumber(newOrderNum);
      
      setToastData(null);
      navigate('result');
    } else {
      alert("Insufficient QuickWallet Balance!");
    }
  };

  const handleReset = () => {
    setCart([]);
    setGoGreen(false);
    setPointsApplied(false);
    setVendorNote('');
    setEarnedPointsContext(0);
    navigate('home');
  };

  useEffect(() => {
    if (viewMode === 'student' && currentOrder?.status === 'ready' && localReadyNotified !== currentOrder.id) {
       showToast('Order Ready!', `Your order ${currentOrder.id} at ${currentOrder.vendorName} is ready for pickup.`);
       setLocalReadyNotified(currentOrder.id);
    }
  }, [viewMode, currentOrder?.status, currentOrder?.id, currentOrder?.vendorName, localReadyNotified]);

  return (
    <div className="min-h-screen bg-qb-peach flex justify-center items-center font-sans tracking-tight p-0 sm:p-4">
      <div className="w-full sm:max-w-[360px] h-[100dvh] sm:h-[680px] bg-white sm:rounded-[40px] shadow-[0_25px_50px_-12px_rgba(154,83,2,0.3)] overflow-hidden relative flex flex-col text-qb-text sm:border-8 border-qb-text">
        
        {/* Toggle View */}
        {(currentScreen === 'home' || viewMode === 'vendor') && currentScreen !== 'login' && (
            <button 
                onClick={() => setViewMode(v => v === 'student' ? 'vendor' : 'student')}
                className="absolute top-4 right-4 z-[100] bg-qb-text text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white uppercase tracking-wider cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
                View: {viewMode === 'student' ? 'Customer' : 'Vendor'}
            </button>
        )}

        {/* --- VENDOR DASHBOARD --- */}
        {viewMode === 'vendor' && currentScreen !== 'login' && (
          <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-6 absolute inset-0 z-40" id="screen-vendor">
             <div className="bg-qb-white px-6 pt-16 pb-6 shadow-sm rounded-b-[2rem] border-b border-gray-100 z-10 relative">
                 <h2 className="font-poppins font-bold text-2xl">Vendor Dashboard</h2>
                 <p className="text-sm text-gray-500 font-medium mt-1">Incoming Orders</p>
             </div>
             <div className="p-6 space-y-4 flex-1">
                 {orders.filter(o => o.status === 'preparing').length === 0 ? (
                     <div className="text-center text-gray-400 mt-10 font-medium">No incoming orders</div>
                 ) : (
                     orders.filter(o => o.status === 'preparing').map(order => (
                         <div key={order.id} className="bg-white rounded-[20px] shadow-sm border-[1.5px] border-[#F1F1F1] p-5">
                            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="font-poppins font-bold text-lg text-qb-orange">{order.id}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{order.pickupDate} at {order.pickupTime}</p>
                                </div>
                                <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Preparing</span>
                            </div>
                            <div className="space-y-2 mb-4">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm font-medium">
                                        <span>{item.quantity}x {item.name}</span>
                                    </div>
                                ))}
                            </div>
                            {order.note && (
                                <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                                    <span className="text-xs font-bold text-gray-700 block mb-1">Note:</span>
                                    <span className="text-sm text-gray-600">{order.note}</span>
                                </div>
                            )}
                            <button 
                                onClick={() => {
                                    setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: 'ready'} : o));
                                }}
                                className="w-full bg-qb-orange hover:bg-[#d97d16] text-white font-poppins font-bold text-lg py-3 rounded-xl shadow-md transition-colors"
                            >
                                Mark as Ready
                            </button>
                         </div>
                     ))
                 )}
                 
                 {orders.filter(o => o.status === 'ready').length > 0 && (
                     <>
                        <h3 className="font-poppins font-bold text-lg mt-8 mb-4 opacity-70">Completed Orders</h3>
                        {orders.filter(o => o.status === 'ready').map(order => (
                            <div key={order.id} className="bg-white rounded-[20px] shadow-sm border-[1.5px] border-[#F1F1F1] p-5 opacity-70">
                               <div className="flex justify-between items-start">
                                   <div>
                                       <h4 className="font-poppins font-bold text-qb-brown">{order.id}</h4>
                                       <p className="text-xs text-gray-500 font-medium mb-1">{order.pickupDate} at {order.pickupTime}</p>
                                   </div>
                                   <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Ready</span>
                               </div>
                            </div>
                        ))}
                     </>
                 )}
             </div>
          </div>
        )}

        {/* Toast Notification */}
        <AnimatePresence>
          {toastData && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-[50px] left-5 right-5 z-50 bg-white rounded-2xl shadow-[0_10px_15px_rgba(0,0,0,0.1)] border-l-4 border-l-qb-orange p-4 flex gap-4 items-start"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-qb-orange shrink-0">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs uppercase text-orange-600 mb-1">{toastData.title}</h4>
                <p className="text-sm font-medium leading-tight">
                  {toastData.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SCREEN 1: LOGIN --- */}
        {currentScreen === 'login' && (
          <div className="flex-1 flex flex-col bg-qb-peach p-8" id="screen-login">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="text-center mb-12">
                <img 
                  src={logoPic} 
                  alt="QuickBite Logo" 
                  className="w-24 h-24 rounded-2xl mx-auto mb-6 object-cover shadow-lg" 
                />
                <h1 className="font-poppins text-4xl font-bold text-qb-brown tracking-tight mb-2">QuickBite</h1>
                <p className="text-qb-brown/80 font-medium">Ready When You Are.</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4 bg-white/60 p-6 rounded-3xl backdrop-blur-sm border border-white/50">
                <div>
                  <label className="block text-xs font-semibold text-qb-brown uppercase tracking-wider mb-2 ml-1">Student ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 252UB12345"
                    className="w-full bg-white px-4 py-3.5 rounded-xl border-none ring-1 ring-qb-brown/10 focus:ring-2 focus:ring-qb-orange outline-none transition-all placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-qb-brown uppercase tracking-wider mb-2 ml-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white px-4 py-3.5 rounded-xl border-none ring-1 ring-qb-brown/10 focus:ring-2 focus:ring-qb-orange outline-none transition-all placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-qb-orange hover:bg-[#d97d16] text-white font-poppins font-semibold text-lg py-4 rounded-xl shadow-lg shadow-orange-200 transition-colors flex items-center justify-center gap-2">
                    Login
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- SCREEN 2: HOME --- */}
        {currentScreen === 'home' && (
          <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-6" id="screen-home">
            <div className="bg-qb-white px-6 pt-10 pb-8 shadow-sm rounded-b-[2rem] border-b border-gray-100 z-10 relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Good Morning 👋</p>
                  <h2 className="font-poppins font-bold text-2xl">Hungry? Skip the queue.</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                      onClick={() => navigate('history')}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                      <Clock size={20} />
                  </button>
                  <div className="w-12 h-12 bg-qb-peach rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
                    <img src="https://placehold.co/100x100/F9CD9C/EF8B19?text=User" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-gradient-to-br from-qb-orange to-[#ff9e31] p-4 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col items-start justify-between">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
                    <Wallet size={80} />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider relative z-10">QuickWallet</p>
                    <div className="font-poppins font-bold text-2xl relative z-10 mb-2 whitespace-nowrap">RM {walletBalance.toFixed(2)}</div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('topup')} 
                    className="relative z-10 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-semibold py-2 px-4 rounded-lg backdrop-blur-sm w-full"
                  >
                    + Top Up
                  </button>
                </div>
                <div className="flex-1 bg-qb-brown p-4 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col items-start justify-between">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 ">
                    <Star size={80} />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider relative z-10">Points</p>
                    <div className="font-poppins font-bold text-2xl relative z-10 flex items-baseline gap-1 mb-2">
                        {rewardPoints} <span className="text-sm font-sans font-medium text-white/80">Pts</span>
                    </div>
                  </div>
                  <button className="text-qb-peach text-xs font-semibold py-2 relative z-10 flex items-center gap-1 group">
                    View Rewards <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end mb-1">
                <h3 className="font-poppins font-bold text-lg">Featured Vendors</h3>
                <button onClick={() => showToast('All Vendors', 'All vendors are already displayed here.')} className="text-qb-orange text-sm font-medium hover:underline">See All</button>
              </div>
              
              {VENDORS.map(vendor => (
                <div 
                    key={vendor.id}
                    onClick={() => openVendor(vendor)}
                    className="bg-white rounded-[20px] shadow-sm border-[1.5px] border-[#F1F1F1] overflow-hidden cursor-pointer hover:shadow-md transition-shadow group shrink-0"
                >
                    <div className="h-32 relative overflow-hidden bg-qb-peach/30">
                        <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-qb-text">
                        <Star size={12} className="text-amber-400 fill-amber-400" /> {vendor.rating}
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                        <div>
                            <h4 className="font-poppins font-semibold text-lg leading-tight mb-1">{vendor.name}</h4>
                            <div className="flex items-center text-gray-500 text-xs gap-3">
                            <span className="flex items-center gap-1"><MapPin size={12}/> {vendor.location}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SCREEN 3: MENU --- */}
        {currentScreen === 'menu' && (
          <div className="flex-1 flex flex-col bg-gray-50 relative h-full" id="screen-menu">
            <div className="h-56 relative bg-qb-peach shrink-0">
              <img src={selectedVendor.image} alt="Stall Image" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              <button onClick={() => navigate('home')} className="absolute top-10 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronLeft size={24} />
              </button>
              
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <h2 className="font-poppins font-bold text-3xl mb-1">{selectedVendor.name}</h2>
                <p className="text-white/80 text-sm flex items-center gap-2">
                  <MapPin size={14}/> {selectedVendor.location}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-4">
              <h3 className="font-poppins font-bold text-lg mb-2">Menu</h3>
              
              {selectedVendor.items.map(item => {
                  const qty = getItemQuantity(item.id);
                  return (
                    <div key={item.id} className="bg-white rounded-[20px] p-4 shadow-sm border-[1.5px] border-[#F1F1F1] flex gap-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                        <div className="flex-1 flex flex-col">
                            <h4 className="font-poppins font-semibold text-sm">{item.name}</h4>
                            <p className="text-gray-500 text-xs mt-1 mb-2 leading-relaxed line-clamp-2">{item.desc}</p>
                            <div className="flex justify-between items-center mt-auto">
                                <span className="font-poppins font-bold text-qb-orange">RM {item.price.toFixed(2)}</span>
                                {qty === 0 ? (
                                    <button 
                                        onClick={() => updateCartQuantity(item, 1)}
                                        className="bg-qb-peach/50 hover:bg-qb-peach text-qb-brown font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-full border border-gray-200">
                                        <button 
                                            onClick={() => updateCartQuantity(item, -1)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-qb-brown"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-bold text-xs w-2 text-center">{qty}</span>
                                        <button 
                                            onClick={() => updateCartQuantity(item, 1)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-qb-brown"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  )
              })}
            </div>

            <AnimatePresence>
              {totalItemsCount > 0 && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <div className="bg-qb-orange text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{totalItemsCount}</div>
                      <span>{totalItemsCount === 1 ? 'Item' : 'Items'} Selected</span>
                    </div>
                    <span className="font-poppins font-semibold">RM {basePrice.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => navigate('checkout')}
                    className="w-full bg-qb-orange hover:bg-[#d97d16] text-white font-poppins font-semibold text-lg py-4 rounded-xl shadow-lg shadow-orange-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Checkout <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* --- SCREEN 4: CHECKOUT --- */}
        {currentScreen === 'checkout' && (
          <div className="flex-1 flex flex-col bg-gray-50 relative h-full" id="screen-checkout">
            <div className="bg-white px-6 pt-10 pb-4 shadow-sm z-10 flex items-center justify-between border-b border-gray-100">
              <button onClick={() => navigate('menu')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-poppins font-semibold text-lg">Checkout</h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 pb-48 space-y-6">
              
              {/* Pickup Time */}
              <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Day</label>
                        <div className="relative">
                            <select 
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-qb-orange focus:border-qb-orange block p-4 outline-none transition-colors font-medium appearance-none"
                            >
                                <option value="Today">Today</option>
                                <option value="Tomorrow">Tomorrow</option>
                            </select>
                            <div className="absolute right-4 top-4 pointer-events-none opacity-40">
                                <ChevronLeft size={20} className="-rotate-90" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-[2] space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Pickup Time</label>
                        <div className="relative">
                            <select 
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-qb-orange focus:border-qb-orange block p-4 outline-none transition-colors font-medium appearance-none"
                            >
                                {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-4 pointer-events-none opacity-40">
                                <ChevronLeft size={20} className="-rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Note to Vendor */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Note to vendor (optional)</label>
                <textarea 
                    value={vendorNote}
                    onChange={e => setVendorNote(e.target.value)}
                    placeholder="e.g., Less spicy, no onions"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-qb-orange focus:border-qb-orange p-3 outline-none transition-colors resize-none font-medium placeholder-gray-400"
                    rows={2}
                ></textarea>
              </div>

              {/* Go Green */}
              <div className="bg-green-50 rounded-[20px] p-4 border border-green-100 flex items-center justify-between overflow-visible">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                    <Leaf size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                        <p className="text-sm font-bold">Go Green</p>
                        <div className="relative inline-flex z-20">
                            <button 
                                onClick={() => setShowTooltip(!showTooltip)}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                className="text-green-700/50 hover:text-green-700 flex outline-none"
                            >
                                <Info size={14} />
                            </button>
                            <AnimatePresence>
                            {showTooltip && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs p-2.5 rounded-lg shadow-xl pointer-events-none"
                                >
                                    Go Green means no plastic items other than the main packaging box (e.g., no plastic bags, no cutlery).
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <p className="text-xs text-green-700">+5 Bonus Points Eligible</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={goGreen}
                    onChange={(e) => setGoGreen(e.target.checked)}
                  />
                  <div className="w-[44px] h-[24px] bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-[20px]"></div>
                </label>
              </div>

              {/* Points Redemption */}
              <div className="bg-qb-peach/20 rounded-2xl p-5 border border-qb-peach/50">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="text-qb-orange fill-qb-orange" size={20} />
                    <h3 className="font-poppins font-semibold">Redeem Points</h3>
                  </div>
                  <span className="text-xs font-bold text-qb-brown bg-qb-peach/50 px-2 py-1 rounded">{rewardPoints} Pts Available</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 text-sm">
                  <div>
                    <span className="font-medium">Use 10 Pts</span> for RM 0.50 off?
                  </div>
                  <button 
                    onClick={handleApplyPoints}
                    disabled={rewardPoints < 10}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      pointsApplied 
                        ? 'bg-qb-brown text-white' 
                        : (rewardPoints >= 10 ? 'bg-qb-peach text-qb-brown hover:bg-qb-peach/80' : 'bg-gray-100 text-gray-400')
                    }`}
                  >
                    {pointsApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-poppins font-semibold mb-3">Payment Method</h3>
                <div className="flex items-center justify-between p-3 border-2 border-qb-orange rounded-xl bg-orange-50/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-qb-orange/20 p-2 rounded-lg text-qb-orange">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">QuickWallet</div>
                      <div className="text-xs text-gray-500">Balance: RM {walletBalance.toFixed(2)}</div>
                    </div>
                  </div>
                  <CheckCircle2 className="text-qb-orange" size={20} />
                </div>
              </div>

            </div>

            {/* Floating Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem]">
              <div className="flex flex-col gap-2 mb-3 text-sm font-medium">
                <div className="flex justify-between items-end text-gray-600">
                  <div className="flex flex-col">
                      <span>Subtotal</span>
                      <span className="text-[10px] text-gray-400 font-normal leading-tight">(includes surcharges and taxes)</span>
                  </div>
                  <span>RM {basePrice.toFixed(2)}</span>
                </div>
                {pointsApplied && (
                  <div className="flex justify-between text-qb-orange">
                    <span>Points Discount (10 Pts)</span>
                    <span>- RM 0.50</span>
                  </div>
                )}
              </div>
              <div className="bg-orange-50/80 rounded-lg p-2.5 mb-3 border border-orange-100 text-center">
                  <span className="text-xs font-bold text-orange-600">🎁 You will earn {potentialPoints} Points from this order.</span>
              </div>
              <button 
                onClick={handlePay}
                className="w-full bg-qb-orange hover:bg-[#d97d16] text-white font-poppins font-semibold text-lg py-4 rounded-xl shadow-lg shadow-orange-200 transition-colors flex items-center justify-center gap-2"
              >
                Pay RM {finalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* --- SCREEN 5: RESULT --- */}
        {currentScreen === 'result' && (
          <div className="flex-1 flex flex-col bg-white overflow-y-auto" id="screen-result">
            <div className="pt-16 pb-8 px-6 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="text-green-500 w-10 h-10" />
              </motion.div>
              <h2 className="font-poppins font-bold text-2xl mb-1">Order Confirmed!</h2>
              <p className="text-gray-500 font-medium">Order {orderNumber}</p>
            </div>

            <div className="px-6 pb-6">
              {/* Tracker */}
              <div className="bg-gray-50 rounded-3xl p-6 mb-6 border border-gray-100">
                <div className="relative flex justify-between">
                  <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0 rounded-full"></div>
                  
                  <div className="absolute top-4 left-6 h-1 bg-qb-orange -z-0 rounded-full transition-all duration-1000" style={{
                    width: currentStatus === 'preparing' ? '50%' : currentStatus === 'ready' ? '100%' : '0%'
                  }}></div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStatus === 'placed' || currentStatus === 'preparing' || currentStatus === 'ready' ? 'bg-qb-orange text-white ring-4 ring-orange-50' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Placed</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${currentStatus === 'preparing' || currentStatus === 'ready' ? 'bg-qb-orange text-white ring-4 ring-orange-50' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>2</div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${currentStatus === 'preparing' || currentStatus === 'ready' ? 'text-qb-orange' : 'text-gray-400'}`}>Preparing</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${currentStatus === 'ready' ? 'bg-green-500 text-white ring-4 ring-green-50' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>3</div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${currentStatus === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>Ready</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Scheduled Pickup</p>
                <div className="text-4xl font-poppins font-bold text-qb-brown">
                  {currentOrder?.pickupTime || pickupTime}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">{currentOrder?.pickupDate || pickupDate}</div>
              </div>

              {/* Receipt */}
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-5 mb-6 relative">
                <div className="absolute -left-2 top-1/2 -mt-3 w-4 h-6 bg-white border-r border-dashed border-gray-300 rounded-r-full"></div>
                <div className="absolute -right-2 top-1/2 -mt-3 w-4 h-6 bg-white border-l border-dashed border-gray-300 rounded-l-full"></div>
                
                <h3 className="font-poppins font-semibold text-center mb-4 pb-4 border-b border-gray-100">Receipt</h3>
                
                <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-100">
                  {(currentOrder?.items || cart).map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start font-medium">
                        <span>{item.quantity}x {item.name}</span>
                        <span>RM {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                  ))}
                  
                  <div className="bg-gray-50 p-2 text-xs text-gray-600 rounded">
                      <span className="font-semibold text-gray-700">Note: </span>
                      {(currentOrder ? currentOrder.note : vendorNote).trim() !== '' ? (currentOrder ? currentOrder.note : vendorNote) : 'None'}
                  </div>

                  {(currentOrder?.goGreen ?? goGreen) && (
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                      <Leaf size={12} /> Go Green Applied
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-500">
                    <div className="flex flex-col">
                        <span>Subtotal</span>
                        <span className="text-[10px] text-gray-400">(includes surcharges and taxes)</span>
                    </div>
                    <span>RM {(currentOrder?.basePrice || basePrice).toFixed(2)}</span>
                  </div>
                  {(currentOrder?.pointsApplied ?? pointsApplied) && (
                    <div className="flex justify-between text-qb-orange">
                      <span>Points Used (10 Pts)</span>
                      <span>- RM 0.50</span>
                    </div>
                  )}
                  <div className="flex justify-between font-poppins font-bold text-lg pt-2 mt-2 border-t border-gray-100">
                    <span>Total Paid</span>
                    <span>RM {(currentOrder?.finalPrice || finalPrice).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                  <p className="text-qb-orange font-semibold text-sm">
                    🎉 You earned {currentOrder?.earnedPointsContext || earnedPointsContext} Points!
                  </p>
                </div>
              </div>

              <button 
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-poppins font-semibold text-lg py-4 rounded-xl transition-colors mb-8"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* --- SCREEN 6: HISTORY --- */}
        {currentScreen === 'history' && (
          <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto" id="screen-history">
            <div className="bg-white px-6 pt-10 pb-4 shadow-sm z-10 flex items-center justify-between border-b border-gray-100 sticky top-0">
              <button 
                onClick={() => navigate('home')} 
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
               >
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-poppins font-semibold text-lg text-center">Order History</h2>
              <div className="w-10 text-right">
                {orders.length > 0 && (
                  <button 
                    onClick={() => {
                      setDeleteConfirm({ type: 'all' });
                    }}
                    className="text-xs text-red-500 font-semibold hover:underline whitespace-nowrap -ml-2"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {orders.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10 font-medium">No past orders found. Let's grab a bite!</div>
              ) : (
                  orders.map(order => (
                      <div 
                          key={order.id} 
                          onClick={() => {
                              setOrderNumber(order.id);
                              navigate('result');
                          }}
                          className="bg-white rounded-[20px] shadow-sm border-[1.5px] border-[#F1F1F1] p-5 cursor-pointer hover:border-qb-orange hover:shadow-md transition-all relative group"
                      >
                         <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                             <div>
                                 <h4 className="font-poppins font-bold text-lg text-qb-brown">{order.id}</h4>
                                 <p className="text-xs text-gray-500 font-medium">{new Date(order.datetime).toLocaleDateString()} • {order.pickupTime}</p>
                             </div>
                             <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                 order.status === 'ready' 
                                 ? 'bg-green-50 text-green-600' 
                                 : order.status === 'preparing' 
                                 ? 'bg-orange-50 text-orange-600'
                                 : 'bg-gray-100 text-gray-600'
                             }`}>
                                {order.status}
                             </span>
                         </div>
                         <div className="flex justify-between items-end mt-2 pr-10">
                             <div className="font-semibold text-qb-brown text-sm">{order.vendorName}</div>
                             <div className="font-poppins font-bold text-qb-orange">RM {(order.finalPrice || 0).toFixed(2)}</div>
                         </div>
                         {order.status.toLowerCase().includes('ready') && (
                           <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({ type: 'single', orderId: order.id });
                              }}
                              className="absolute bottom-4 right-4 text-red-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                              aria-label="Delete order"
                           >
                              <Trash2 size={18} />
                           </button>
                         )}
                      </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* --- SCREEN 7: TOP-UP --- */}
        {currentScreen === 'topup' && (
          <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto" id="screen-topup">
            <div className="bg-white px-6 pt-10 pb-4 shadow-sm z-10 flex items-center justify-between border-b border-gray-100 sticky top-0">
              <button 
                onClick={() => navigate('home')} 
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
               >
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-poppins font-semibold text-lg text-center">Top Up Wallet</h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 px-6 py-8 flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-qb-orange">
                  <Wallet size={40} />
                </div>
                <p className="text-gray-500 font-medium mb-1">Current Balance</p>
                <h3 className="font-poppins font-bold text-3xl mb-10 text-qb-brown">RM {walletBalance.toFixed(2)}</h3>

                <div className="w-full space-y-2 mb-auto">
                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Top-up Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-poppins font-bold text-gray-400">RM</span>
                        <input 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            onInput={calculateExpectedBalance}
                            placeholder="Enter amount"
                            className="w-full bg-white border border-gray-200 text-gray-900 text-xl font-bold rounded-2xl focus:ring-2 focus:ring-qb-orange focus:border-qb-orange block pl-12 pr-4 py-4 outline-none transition-colors"
                        />
                    </div>
                    <p id="expected-balance-display" className="text-sm text-gray-500 mt-2 text-center font-medium">
                        Expected Balance after top-up: RM {walletBalance.toFixed(2)}
                    </p>
                </div>

                <div className="w-full mt-8">
                    <button 
                        onClick={handleTopUp}
                        disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                        className="w-full bg-qb-orange hover:bg-[#d97d16] disabled:bg-gray-300 text-white font-poppins font-semibold text-lg py-4 rounded-xl shadow-md transition-colors"
                    >
                        Confirm Top Up
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-[320px] p-6 shadow-xl"
              >
                <h3 className="font-poppins font-semibold text-lg text-qb-brown mb-2 text-center">Confirm Deletion</h3>
                <p className="text-gray-500 text-sm mb-6 text-center">
                  {deleteConfirm.type === 'all' 
                    ? "Are you sure you want to clear all completed orders? Active orders will not be removed." 
                    : "Are you sure you want to delete this specific order?"}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (deleteConfirm.type === 'all') {
                        setOrders(prev => prev.filter(o => !o.status.toLowerCase().includes('ready')));
                      } else if (deleteConfirm.type === 'single') {
                        setOrders(prev => prev.filter(o => o.id !== deleteConfirm.orderId));
                      }
                      setDeleteConfirm(null);
                    }}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm shadow-red-200"
                  >
                    Delete {deleteConfirm.type === 'all' ? 'All' : ''}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
