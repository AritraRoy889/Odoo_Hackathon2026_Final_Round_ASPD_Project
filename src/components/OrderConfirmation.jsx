import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, ArrowLeft, Calendar, FileText, CheckCircle2, User } from 'lucide-react';

export default function OrderConfirmation() {
  const { 
    orders, 
    selectedOrderId, 
    setCurrentView,
    shippingAddress,
    weatherLogistics,
    triggerNotification
  } = useApp();

  const activeOrder = orders.find(o => o.orderId === selectedOrderId) || orders[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    triggerNotification('Generating Official Invoice PDF via APITemplate.io...', 'info');
    setTimeout(() => {
      window.print();
    }, 800);
  };

  if (!activeOrder) {
    return (
      <div className="text-center py-12 animate-fade-in pb-12">
        <p className="text-gray-400">No active order session found.</p>
        <button
          onClick={() => setCurrentView('storefront')}
          className="mt-4 rounded bg-accent-mint px-4 py-2 text-xs font-bold text-darkBg"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-darkBg-border pb-4 no-print">
        <button
          onClick={() => setCurrentView('storefront')}
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse Products</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 rounded border border-darkBg-border bg-darkBg px-3 py-1.5 font-bold text-gray-300 hover:text-white transition-all text-xs"
          >
            <FileText className="h-3.5 w-3.5 text-accent-mint" />
            <span>Download Invoice PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 rounded bg-accent-mint px-4 py-1.5 font-bold text-darkBg hover:bg-accent-mintLight shadow-glow transition-all text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Contract</span>
          </button>
        </div>
      </div>

      {/* Main Success Card */}
      <div className="bg-darkBg-card border border-darkBg-border rounded-xl p-6 shadow-glow-subtle glass print-card print-text-black">
        
        {/* Title & QR Code Waybill Header */}
        <div className="flex justify-between items-center border-b border-darkBg-border/40 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white print-text-black">Thank you for your order</h2>
            <p className="text-xs text-accent-mint font-semibold mt-1">Order {activeOrder.orderId}</p>
          </div>

          {/* QR Server Live Printable Waybill QR & Code128 Asset Barcode */}
          <div className="flex items-center space-x-3">
            {/* BWIP-JS Code128 Asset Barcode */}
            <div className="hidden md:flex flex-col items-center bg-white px-2 py-1 rounded-lg border border-darkBg-border">
              <img
                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent('ASSET-' + activeOrder.orderId)}`}
                alt="Code128 Asset Barcode"
                className="h-8"
              />
              <span className="text-[8px] font-mono font-bold text-gray-800">ASSET-{activeOrder.orderId}</span>
            </div>

            {/* Waybill QR */}
            <div className="flex items-center space-x-3 bg-white p-1.5 rounded-lg border border-darkBg-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=NEORENT-WAYBILL-${activeOrder.orderId}`}
                alt="Waybill QR Code"
                className="h-12 w-12"
              />
              <div className="text-[9px] text-gray-800 font-mono font-bold leading-tight hidden sm:block">
                <p>WAYBILL QR</p>
                <p>{activeOrder.orderId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Processed Payment & Live Weather Logistics Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-600 rounded-lg p-3 text-center text-xs font-bold text-darkBg flex items-center justify-center space-x-2">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>Payment &amp; Security Deposit Pre-Authorized</span>
          </div>

          {/* Weather Logistics Flag */}
          <div className="bg-darkBg border border-darkBg-border rounded-lg p-3 text-center text-xs font-semibold text-gray-200 flex items-center justify-center space-x-2">
            <span>{weatherLogistics?.logistics_flag || '☀️ Clear & Optimal Delivery Weather'}</span>
          </div>
        </div>

        {/* Dual Panel Address vs Items Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel: Address Log */}
          <div className="md:col-span-1 rounded-lg bg-darkBg/50 border border-darkBg-border/60 p-4 space-y-4 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider border-b border-darkBg-border/40 pb-1.5 flex items-center print-text-black">
              <User className="mr-1.5 h-3.5 w-3.5 text-accent-mint print-text-black" />
              Delivery & Billing
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Customer Name</p>
                <p className="text-white font-bold print-text-black">{activeOrder.customerName}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Destination Address</p>
                <p className="text-gray-300 print-text-black leading-relaxed">
                  {shippingAddress.addressLine || activeOrder.customerName + ' Garage'},<br />
                  {shippingAddress.city || 'San Francisco, CA'}, {shippingAddress.zipCode || '94103'}<br />
                  {shippingAddress.country || 'United States'}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Contact Information</p>
                <p className="text-gray-300 print-text-black">{activeOrder.customerEmail}</p>
                <p className="text-gray-300 print-text-black">{activeOrder.customerPhone}</p>
              </div>

              {activeOrder.gstIn && (
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">GST IN Tax Registry</p>
                  <p className="text-accent-mint font-semibold uppercase print-text-black">{activeOrder.gstIn}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Product Details Summary */}
          <div className="md:col-span-2 rounded-lg bg-darkBg/50 border border-darkBg-border/60 p-4 space-y-4 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider border-b border-darkBg-border/40 pb-1.5 flex items-center print-text-black">
              <FileText className="mr-1.5 h-3.5 w-3.5 text-accent-mint print-text-black" />
              Item Summary
            </h3>

            {/* Product card lines loop */}
            <div className="divide-y divide-darkBg-border/30 space-y-3">
              {(activeOrder.items || activeOrder.orderLines || []).map((item, idx) => (
                <div key={item.cartItemId || item.id || idx} className="pt-3 first:pt-0 flex gap-4 items-center">
                  <div className="h-12 w-12 rounded overflow-hidden bg-darkBg border border-darkBg-border/40 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.product?.image || '/images/ultrawide_monitor.jpg'}
                      alt={item.product?.name || item.productName || 'Rental Product'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate print-text-black">{item.product?.name || item.productName || 'Rental Asset'}</p>
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity || 1} units</p>
                  </div>

                  <div className="text-right text-xs">
                    <p className="text-[10px] text-accent-mint print-text-black">${item.priceRate || item.unitPrice || item.price || 0}/unit</p>
                    <p className="font-extrabold text-white print-text-black">${Number(item.totalCost || item.price || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rental Date duration parameters */}
            <div className="bg-darkBg/60 p-3 border border-darkBg-border/30 rounded-lg space-y-1">
              <p className="font-bold text-gray-300 flex items-center print-text-black">
                <Calendar className="mr-1.5 h-3.5 w-3.5 text-accent-mint print-text-black" />
                Rental Period
              </p>
              {(activeOrder.items || activeOrder.orderLines || []).map((item, idx) => (
                <p key={idx} className="text-[10px] text-gray-400">
                  {(item.product?.name || item.productName || 'Product').split(' ')[0]} Period: {item.rentalPeriod?.start || 'N/A'} to {item.rentalPeriod?.end || 'N/A'} ({item.rentalDuration || 1} units)
                </p>
              ))}
            </div>

            {/* Cost Calculations */}
            <div className="border-t border-darkBg-border/40 pt-3 space-y-1.5 text-right">
              <div className="flex justify-between text-gray-400">
                <span>Delivery charges:</span>
                <span className="text-white print-text-black">
                  {activeOrder.deliveryCharge === 0 ? 'Free' : `$${Number(activeOrder.deliveryCharge || 0).toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between text-gray-400">
                <span>Sub Total:</span>
                <span className="text-white print-text-black">${Number(activeOrder.subtotal || 0).toFixed(2)}</span>
              </div>

              {activeOrder.discount > 0 && (
                <div className="flex justify-between text-accent-mint print-text-black">
                  <span>Coupon Discount:</span>
                  <span>-${Number(activeOrder.discount || 0).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-darkBg-border/40 pt-2 flex justify-between items-center text-sm font-extrabold">
                <span className="text-white print-text-black font-sans">Total Paid:</span>
                <span className="text-base font-extrabold text-accent-mint print-text-black">${Number(activeOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
