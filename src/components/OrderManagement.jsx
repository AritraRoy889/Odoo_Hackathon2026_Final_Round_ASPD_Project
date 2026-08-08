import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Check, Compass, RefreshCw, ShoppingCart, User } from 'lucide-react';

export default function OrderManagement() {
  const { 
    orders, 
    selectedOrderId, 
    setCurrentView, 
    transitionOrderStatus 
  } = useApp();

  // Find selected order
  const order = orders.find(o => o.orderId === selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-gray-400 font-medium">No order reference selected.</p>
        <button
          onClick={() => setCurrentView('admin')}
          className="mt-4 rounded bg-accent-mint px-4 py-2 text-xs font-bold text-darkBg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Pipeline order states
  const ORDER_STEPS = ['Quotation', 'Quotation Sent', 'Sale Order', 'Active', 'Returned'];
  const activeStepIndex = ORDER_STEPS.indexOf(order.status);

  const getStepStatusClass = (stepName, index) => {
    if (order.status === stepName) {
      return 'border-accent-mint bg-accent-mint/10 text-accent-mint font-bold shadow-glow-subtle';
    }
    if (index < activeStepIndex) {
      return 'border-emerald-500 bg-emerald-500 text-darkBg';
    }
    return 'border-darkBg-border text-gray-500 bg-darkBg';
  };

  const renderTransitionButton = () => {
    switch (order.status) {
      case 'Quotation':
        return (
          <button
            onClick={() => transitionOrderStatus(order.orderId, 'Quotation Sent')}
            className="flex items-center space-x-2 rounded-lg bg-accent-mint px-5 py-3 font-bold text-darkBg hover:bg-accent-mintLight shadow-glow transition-all text-sm w-full md:w-auto"
          >
            <Compass className="h-4 w-4" />
            <span>Transition to: "Quotation Sent"</span>
          </button>
        );
      case 'Quotation Sent':
        return (
          <button
            onClick={() => transitionOrderStatus(order.orderId, 'Sale Order')}
            className="flex items-center space-x-2 rounded-lg bg-accent-mint px-5 py-3 font-bold text-darkBg hover:bg-accent-mintLight shadow-glow transition-all text-sm w-full md:w-auto"
          >
            <Check className="h-4 w-4" />
            <span>Transition to: "Approve Sale Order"</span>
          </button>
        );
      case 'Sale Order':
        return (
          <button
            onClick={() => transitionOrderStatus(order.orderId, 'Active')}
            className="flex items-center space-x-2 rounded-lg bg-accent-mint px-5 py-3 font-bold text-darkBg hover:bg-accent-mintLight shadow-glow transition-all text-sm w-full md:w-auto"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Transition to: "Activate Lease"</span>
          </button>
        );
      case 'Active':
        return (
          <button
            onClick={() => transitionOrderStatus(order.orderId, 'Returned')}
            className="flex items-center space-x-2 rounded-lg bg-accent-mint px-5 py-3 font-bold text-darkBg hover:bg-accent-mintLight shadow-glow transition-all text-sm w-full md:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Transition to: "Mark as Returned"</span>
          </button>
        );
      case 'Returned':
        return (
          <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg w-fit">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Order Cycle Terminated (Returned)</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Back navigation */}
      <button
        onClick={() => setCurrentView('admin')}
        className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Admin Dashboard</span>
      </button>

      {/* Main Order Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-darkBg-border pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-accent-mint bg-accent-mint/10 px-2 py-0.5 rounded">
            Order Inspector
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Order Details: {order.orderId}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Lease logs configured on {order.date}</p>
        </div>

        {renderTransitionButton()}
      </div>

      {/* Visual State Machine Steps Tracker */}
      <div className="bg-darkBg-card border border-darkBg-border rounded-xl p-6 glass">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-6">
          Sales State Machine Progression
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {ORDER_STEPS.map((step, idx) => (
            <div key={step} className="flex flex-col items-center text-center space-y-2">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs transition-all ${getStepStatusClass(step, idx)}`}>
                {idx < activeStepIndex ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                order.status === step ? 'text-accent-mint' : idx < activeStepIndex ? 'text-emerald-400' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details & Summary Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Customer profile */}
        <div className="md:col-span-1 rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-4 h-fit">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-darkBg-border pb-2 flex items-center">
            <User className="mr-1.5 h-3.5 w-3.5 text-accent-mint" />
            Client Specifications
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-gray-400">Name:</p>
              <p className="text-white font-semibold">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-400">Email:</p>
              <p className="text-white font-semibold">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-gray-400">Contact Number:</p>
              <p className="text-white font-semibold">{order.customerPhone}</p>
            </div>
            {order.gstIn && (
              <div>
                <p className="text-gray-400">GST IN Tax Registry:</p>
                <p className="text-accent-mint font-semibold uppercase">{order.gstIn}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Delivery Fulfillment:</p>
              <p className="text-white font-semibold capitalize">{order.deliveryOption}</p>
            </div>
          </div>
        </div>

        {/* items review */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card overflow-hidden glass">
            <div className="p-4 border-b border-darkBg-border/50">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lease Configurations Table</h3>
            </div>
            
            <div className="divide-y divide-darkBg-border/30">
              {(order.items || order.orderLines || []).map((item, idx) => (
                <div key={item.cartItemId || idx} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  
                  {/* Thumbnail */}
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-darkBg border border-darkBg-border/50 flex-shrink-0">
                    <img
                      src={item.product?.image || item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=60'}
                      alt={item.product?.name || item.productName || 'Product'}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* title and variants */}
                  <div className="flex-1 text-xs space-y-1">
                    <h4 className="font-bold text-white">{item.product?.name || item.productName || 'Product'}</h4>
                    {item.variantDetails && Object.keys(item.variantDetails).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.variantDetails).map(([k, v]) => (
                          <span key={k} className="text-[9px] bg-darkBg border border-darkBg-border/50 text-gray-400 px-1.5 py-0.5 rounded capitalize">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-500 pt-0.5">
                      Units: {item.rentalDuration || 1} ({item.rentalPeriod?.start || 'N/A'} to {item.rentalPeriod?.end || 'N/A'})
                    </p>
                  </div>

                  {/* Quantity and cost */}
                  <div className="text-right flex-shrink-0 text-xs">
                    <p className="text-gray-400">Qty: {item.quantity || 1}</p>
                    <p className="font-extrabold text-accent-mint">${Number(item.totalCost || item.price || 0).toFixed(2)}</p>
                  </div>

                </div>
              ))}
            </div>

            {/* Subtotal invoice breakdown */}
            <div className="p-4 bg-darkBg/30 border-t border-darkBg-border/50 text-xs flex flex-col items-end space-y-2">
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Lease Subtotal:</span>
                  <span className="text-white font-semibold">${Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Logistic delivery:</span>
                  <span className="text-white font-semibold">${Number(order.deliveryCharge || 0).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-accent-mint font-semibold">
                    <span>Discount deductions:</span>
                    <span>-${Number(order.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-darkBg-border/50 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-white font-sans uppercase">Total Valued:</span>
                  <span className="text-base font-extrabold text-accent-mint">${Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
