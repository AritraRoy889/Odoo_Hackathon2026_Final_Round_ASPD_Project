import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { List, Kanban, Plus, Search, ArrowLeft, Calendar, Trash2, Download, ClipboardList, Package, BarChart2, Radio, BookOpen, Settings, ShoppingBag } from 'lucide-react';
import RiskBadge from './RiskBadge';
import CountdownTimer from './CountdownTimer';
import RentalJourneyTimeline from './RentalJourneyTimeline';
import VoiceCommandPanel from './VoiceCommandPanel';
import { celebrateOrderConfirmed, celebrateInvoicePaid } from '../utils/celebrate';
import jsPDF from 'jspdf';

export default function AdminDashboard() {
  const {
    setCurrentView,
    user,
    setUser,
    products,
    setProducts,
    attributes,
    pricelists,
    templates,
    scheduleEvents,
    orders,
    invoices,
    setInvoices,
    sendQuotation,
    confirmSale,
    pickupOrder,
    moveOrderKanban,
    postInvoice,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    createPricelistRule,
    updateTemplate,
    pickupLateFeeChecked,
    setPickupLateFeeChecked,
    lateFeePerHour,
    setLateFeePerHour,
    productWarrantyChecked,
    setProductWarrantyChecked,
    priceListChecked,
    setPriceListChecked,
    syncProductToBackend,
    iotTelemetryList,
    auditLogs,
    logAuditAction,
    importExternalProducts,
    triggerNotification
  } = useApp();

  // Top level menu tabs: Order, Schedule, Product, Report, Configuration (Excalidraw Image 11)
  const [activeTab, setActiveTab] = useState('Order'); 
  // Sub-menu states
  const [orderSubmenu, setOrderSubmenu] = useState('Rental Orders'); // Rental Orders, Invoices, Customers
  const [productSubmenu, setProductSubmenu] = useState('Products'); // Products, Price list, Attributes, Rental Period
  const [configSubmenu, setConfigSubmenu] = useState('Setting'); // Setting, User, Quotation Templates, Header/Footer

  // Search input inside admin
  const [adminSearch, setAdminSearch] = useState('');

  // ------------------ DOCK LOGIC FOR THE DETAILS PAGES ------------------
  const [inspectOrderRef, setInspectOrderRef] = useState(null); // active S000XX selected inside admin
  const [inspectInvoiceRef, setInspectInvoiceRef] = useState(null); // active INV/2026/00XX selected

  // ------------------ TAB 1: ORDER LOGS ------------------
  const [ordersViewMode, setOrdersViewMode] = useState('list'); // list, kanban
  const [activeFilterPill, setActiveFilterPill] = useState('All'); // All, Today, Pickup, Return, Late
  const [last7DaysCheck, setLast7DaysCheck] = useState(false);

  // ------------------ TAB 4: REPORTS & OTHER STATES ------------------
  const [chartType, setChartType] = useState('bar'); // bar, pie, line
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [criteriaAnalysis, setCriteriaAnalysis] = useState('Total Sales');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ------------------ TAB 2: RENTAL SCHEDULER (Excalidraw Image 4 & 5) ------------------
  const [selectedSchMonth, setSelectedSchMonth] = useState('Jan 2026'); // simulated dropdown option
  const [selectedSchDay, setSelectedSchDay] = useState('2026-01-05'); // default selected date

  // ------------------ TAB 3: PRODUCT DETAILS (Excalidraw Image 6 & 7) ------------------
  const [activeProductEdit, setActiveProductEdit] = useState(null); // product object or null
  const [productFormTab, setProductFormTab] = useState('General Information'); // General Information, Attributes & Variants, Sales
  // Product Form states
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState('GOODS'); // GOODS, SERVICE
  const [pQty, setPQty] = useState(100.00);
  const [pSalesPrice, setPSalesPrice] = useState(0.00);
  const [pCostPrice, setPCostPrice] = useState(0.00);
  const [pDeposit, setPDeposit] = useState(0.00);
  const [pPeriodicity, setPPeriodicity] = useState('DAY'); // HOURS, DAY, NIGHT, WEEKLY
  const [pPublish, setPPublish] = useState(false);
  const [pCategory, setPCategory] = useState('Electronics');

  // Attributes editor states (Image 1)
  const [selectedAttrId, setSelectedAttrId] = useState('attr-1');
  const [attrSearch, setAttrSearch] = useState('');
  const [attrNameInput, setAttrNameInput] = useState('Brand');
  const [attrDisplayInput, setAttrDisplayInput] = useState('RADIO');
  const [attrValues, setAttrValues] = useState([
    { id: 'v-1', value: 'AetherWave', default_extra_price: 0.00 },
    { id: 'v-2', value: 'LuxeForm', default_extra_price: 0.00 },
    { id: 'v-3', value: 'Optix', default_extra_price: 0.00 },
    { id: 'v-4', value: 'ComfortMax', default_extra_price: 0.00 }
  ]);

  // Pricelist rules form states (Image 2)
  const [ruleProductInput, setRuleProductInput] = useState('All Products');
  const [ruleTypeInput, setRuleTypeInput] = useState('DISCOUNT'); // DISCOUNT, FIXED
  const [ruleFixedVal, setRuleFixedVal] = useState(0.00);
  const [ruleDiscountVal, setRuleDiscountVal] = useState(10.00);
  const [ruleMinQty, setRuleMinQty] = useState(0.00);
  const [ruleSelectable, setRuleSelectable] = useState(true);
  const [ruleValidityText, setRuleValidityText] = useState('');
  
  // ------------------ TAB 5: CONFIGURATION DETAILS ------------------
  // User profile settings states (Image 11)
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [userCompany, setUserCompany] = useState(user?.companyName || '');
  const [userGst, setUserGst] = useState(user?.gstIn || '');
  const [userAddress, setUserAddress] = useState(user?.address || '');
  const [userRole, setUserRole] = useState(user?.role || 'VENDOR');
  const [userTab, setUserTab] = useState('Work Information'); // Work Information, Security

  // Quotation Templates states (Image 8)
  const [selectedTempId, setSelectedTempId] = useState('qt-1');
  const [tempNameInput, setTempNameInput] = useState('Home Rental Furniture');
  const [tempValidityInput, setTempValidityInput] = useState(30);
  const [tempTermsInput, setTempTermsInput] = useState(50); // Payment terms %

  // ------------------ HELPERS ------------------
  const getStatusColor = (status) => {
    switch (status) {
      case 'QUOTATION': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'QUOTATION_SENT': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'; // Quotation Sent (purple)
      case 'SALE_ORDER': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'; // Sale order Confirmed (green)
      case 'Invoiced': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; // Invoiced (light blue)
      default: return 'bg-gray-700/20 text-gray-400 border-gray-700/30';
    }
  };

  const handleEditProductClick = (product) => {
    setActiveProductEdit(product);
    setPName(product.name);
    setPCategory(product.category);
    setPType(product.product_type);
    setPQty(product.stock_quantity);
    setPSalesPrice(product.sales_price);
    setPCostPrice(product.cost_price || 0);
    setPDeposit(product.security_deposit || 0);
    setPPeriodicity(product.periodicity);
    setPPublish(product.is_published);
    setProductFormTab('General Information');
  };

  const handleCreateProductNew = () => {
    setActiveProductEdit({ id: 'new' });
    setPName('');
    setPCategory('Electronics');
    setPType('GOODS');
    setPQty(100.00);
    setPSalesPrice(0.00);
    setPCostPrice(0.00);
    setPDeposit(0.00);
    setPPeriodicity('DAY');
    setPPublish(false);
    setProductFormTab('General Information');
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!pName) return;

    if (activeProductEdit.id === 'new') {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: pName,
        brand: 'SysMax',
        colors: ['black'],
        price: { hour: pSalesPrice / 400, day: pSalesPrice / 100, month: pSalesPrice / 10 },
        category: pCategory,
        image: '/images/ultrawide_monitor.jpg',
        product_type: pType,
        stock_quantity: pQty,
        sales_price: pSalesPrice,
        cost_price: pCostPrice,
        security_deposit: pDeposit,
        periodicity: pPeriodicity,
        is_published: pPublish,
        hasVariants: false
      };
      setProducts([...products, newProduct]);
      syncProductToBackend(newProduct);
      triggerNotification('Product created successfully!', 'success');
    } else {
      const updatedProduct = {
        ...activeProductEdit,
        name: pName,
        category: pCategory,
        product_type: pType,
        stock_quantity: pQty,
        sales_price: pSalesPrice,
        cost_price: pCostPrice,
        security_deposit: pDeposit,
        periodicity: pPeriodicity,
        is_published: pPublish
      };
      setProducts(prev =>
        prev.map(p => p.id === activeProductEdit.id ? updatedProduct : p)
      );
      syncProductToBackend(updatedProduct);
      triggerNotification('Product changes saved!', 'success');
    }
    setActiveProductEdit(null);
  };

  const handleSaveUserProfile = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name: userName,
      email: userEmail,
      phone: userPhone,
      companyName: userCompany,
      gstIn: userGst.toUpperCase(),
      address: userAddress,
      role: userRole
    });
    triggerNotification('User Settings profile saved successfully!', 'success');
  };

  // Switch menus reset
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInspectOrderRef(null);
    setInspectInvoiceRef(null);
  };

  return (
    <div className="space-y-6 animate-fade-in no-print pb-12">
      
      {/* 1. WIREFRAME MAIN MENU HEADER NAVIGATION (Image 11) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-darkBg-card border border-darkBg-border p-3 rounded-lg shadow-glow-subtle glass">
        
        {/* Navigation Tabs — Premium Icon Style */}
        <div className="flex flex-wrap gap-1 md:gap-1.5">
          {[
            { id: 'Order',       label: 'Orders',   icon: ClipboardList },
            { id: 'Schedule',    label: 'Schedule', icon: Calendar },
            { id: 'Product',     label: 'Products', icon: Package },
            { id: 'Report',      label: 'Reports',  icon: BarChart2 },
            { id: 'IoT Tracking',label: 'IoT',      icon: Radio },
            { id: 'Audit Trail', label: 'Audit',    icon: BookOpen },
            { id: 'Settings',    label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 border ${
                activeTab === id
                  ? 'bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg border-accent-teal shadow-glow-subtle'
                  : 'bg-darkBg border-darkBg-border text-gray-400 hover:text-white hover:border-[#2A3555]'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* User Identity info badge with dropdown (Excalidraw Image 5) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-darkBg border border-darkBg-border text-xs font-bold text-white hover:border-gray-500 transition-colors"
          >
            <div className="h-5 w-5 rounded-full bg-accent-mint/20 border border-accent-mint/40 flex items-center justify-center text-accent-mint text-[10px] font-extrabold uppercase">
              {userName.replace(/\([^)]*\)/g, '').trim().split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span className="truncate max-w-[100px]">{userName}</span>
            <span className="text-[8px] text-gray-500">▼</span>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-1.5 w-32 rounded-md bg-darkBg border border-darkBg-border shadow-lg z-50 overflow-hidden text-[10px] uppercase font-bold text-gray-300">
              <button
                type="button"
                onClick={() => {
                  handleTabChange('Settings');
                  setConfigSubmenu('User');
                  setShowProfileMenu(false);
                  triggerNotification('Navigating to user settings profile...', 'info');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-darkBg-hover hover:text-white border-b border-darkBg-border/40"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  setCurrentView('storefront');
                  triggerNotification('Logged out successfully.', 'info');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-darkBg-hover hover:text-white text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 2. SUB NAVIGATION OPTIONS BASED ON ACTIVE TAB */}
      
      {/* Tab: Order Submenu */}
      {activeTab === 'Order' && (
        <div className="flex border-b border-darkBg-border gap-4 pb-2 animate-fade-in">
          {['Rental Orders', 'Invoices', 'Customers'].map((sub) => (
            <button
              key={sub}
              onClick={() => { setOrderSubmenu(sub); setInspectOrderRef(null); setInspectInvoiceRef(null); }}
              className={`pb-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                orderSubmenu === sub ? 'border-accent-mint text-accent-mint' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Tab: Product Submenu */}
      {activeTab === 'Product' && (
        <div className="flex border-b border-darkBg-border gap-4 pb-2 animate-fade-in">
          {['Products', 'Price list', 'Attributes', 'Rental Period'].map((sub) => (
            <button
              key={sub}
              onClick={() => { setProductSubmenu(sub); setActiveProductEdit(null); }}
              className={`pb-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                productSubmenu === sub ? 'border-accent-mint text-accent-mint' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Tab: Configuration Submenu */}
      {activeTab === 'Settings' && (
        <div className="flex border-b border-darkBg-border gap-4 pb-2 animate-fade-in">
          {['Setting', 'User', 'Quotation Templates', 'Header/Footer'].map((sub) => (
            <button
              key={sub}
              onClick={() => setConfigSubmenu(sub)}
              className={`pb-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                configSubmenu === sub ? 'border-accent-mint text-accent-mint' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 3. DYNAMIC CONTENT RENDERING PAGE STREAMS */}
      
      {/* ======================================================== */}
      {/* ==================== TAB 1: ORDER ==================== */}
      {/* ======================================================== */}
      {activeTab === 'Order' && (
        <div className="space-y-6">
          
          {/* 3.1 SUBVIEW: RENTAL ORDERS LIST/KANBAN (Image 12 & 13) */}
          {orderSubmenu === 'Rental Orders' && !inspectOrderRef && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Header search, New and view switchers */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
                
                <div className="flex items-center space-x-3 w-full md:max-w-md">
                  <span className="text-sm font-bold text-white">Rental Order</span>
                  
                  <button
                    onClick={() => triggerNotification('Add order clicked. Stage it on Storefront!', 'info')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent-mint text-darkBg text-xs font-extrabold shadow-glow-subtle hover:brightness-105"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New</span>
                  </button>

                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full rounded bg-darkBg border border-darkBg-border py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-accent-mint"
                    />
                  </div>
                </div>

                {/* Switch view buttons */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                  <div className="flex border border-darkBg-border bg-darkBg rounded p-0.5">
                    <button
                      onClick={() => setOrdersViewMode('list')}
                      className={`p-1.5 rounded text-gray-400 hover:text-white transition-colors ${ordersViewMode === 'list' ? 'bg-accent-mint/20 text-accent-mint' : ''}`}
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setOrdersViewMode('kanban')}
                      className={`p-1.5 rounded text-gray-400 hover:text-white transition-colors ${ordersViewMode === 'kanban' ? 'bg-accent-mint/20 text-accent-mint' : ''}`}
                      title="Kanban view"
                    >
                      <Kanban className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Stats and filter pills (Excalidraw Image 5) */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-darkBg-card/35 border border-darkBg-border/50 p-4 rounded-xl text-xs glass">
                
                {/* Logistics status Pills with counts */}
                <div className="flex flex-wrap items-center gap-3.5">
                  <button
                    onClick={() => setActiveFilterPill('All')}
                    className={`px-3 py-1.5 rounded-full border transition-all text-[11px] font-bold ${
                      activeFilterPill === 'All'
                        ? 'border-accent-mint bg-accent-mint/10 text-accent-mint'
                        : 'border-darkBg-border bg-darkBg text-gray-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setActiveFilterPill('Today')}
                    className={`px-2.5 py-1.5 rounded-full border transition-all text-[11px] font-bold flex items-center space-x-1.5 ${
                      activeFilterPill === 'Today' ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-glow-subtle' : 'border-darkBg-border bg-darkBg text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="h-4.5 w-4.5 rounded-full bg-orange-500 text-darkBg flex items-center justify-center font-extrabold text-[9px]">2</span>
                    <span>Today</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterPill('Pickup')}
                    className={`px-2.5 py-1.5 rounded-full border transition-all text-[11px] font-bold flex items-center space-x-1.5 ${
                      activeFilterPill === 'Pickup' ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-glow-subtle' : 'border-darkBg-border bg-darkBg text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="h-4.5 w-4.5 rounded-full bg-purple-500 text-white flex items-center justify-center font-extrabold text-[9px]">3</span>
                    <span>Pickup</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterPill('Return')}
                    className={`px-2.5 py-1.5 rounded-full border transition-all text-[11px] font-bold flex items-center space-x-1.5 ${
                      activeFilterPill === 'Return' ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-glow-subtle' : 'border-darkBg-border bg-darkBg text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="h-4.5 w-4.5 rounded-full bg-purple-500 text-white flex items-center justify-center font-extrabold text-[9px]">3</span>
                    <span>Return</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterPill('Late')}
                    className={`px-2.5 py-1.5 rounded-full border transition-all text-[11px] font-bold flex items-center space-x-1.5 ${
                      activeFilterPill === 'Late' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-glow-subtle' : 'border-darkBg-border bg-darkBg text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="h-4.5 w-4.5 rounded-full bg-red-500 text-white flex items-center justify-center font-extrabold text-[9px]">1</span>
                    <span>Late</span>
                  </button>
                </div>

                {/* KPI metrics area with last 7 days check (Excalidraw Image 5) */}
                <div className="flex flex-wrap items-center gap-4.5 text-[11px] font-bold text-gray-400 bg-darkBg/35 p-1 px-3 border border-darkBg-border/50 rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={last7DaysCheck}
                      onChange={(e) => setLast7DaysCheck(e.target.checked)}
                      className="rounded border-darkBg-border bg-darkBg text-accent-mint h-3.5 w-3.5 focus:ring-0 cursor-pointer"
                    />
                    <span>Last 7 Days</span>
                  </label>
                  
                  <span className="text-darkBg-border">|</span>
                  
                  <p>Sales: <span className="text-white font-extrabold">{last7DaysCheck ? '$1945' : '$44,415'}</span></p>
                  <p>Late Fees: <span className="text-red-400 font-extrabold">{last7DaysCheck ? '$235' : '$330'}</span></p>
                  <p>Deposit: <span className="text-accent-mint font-extrabold">{last7DaysCheck ? '$710' : '$810'}</span></p>
                </div>

              </div>

              {/* Status Legends display block */}
              <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 bg-darkBg-card/20 p-2.5 rounded-lg border border-darkBg-border/20">
                <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-purple-500 mr-1.5"></span> Quotation Sent</div>
                <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span> Sale order Confirmed</div>
                <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span> Invoiced</div>
                <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-gray-500 mr-1.5"></span> Nothing to Invoiced</div>
              </div>

              {/* 3.1A STRUCTURAL LIST VIEW (Image 12) */}
              {ordersViewMode === 'list' && (
                <div className="rounded-xl border border-darkBg-border bg-darkBg-card overflow-hidden glass">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                          <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
                          <th className="p-3 font-bold uppercase">Order Reference</th>
                          <th className="p-3 font-bold uppercase">Customer</th>
                          <th className="p-3 font-bold uppercase text-center">Status</th>
                          <th className="p-3 font-bold uppercase">Return Date</th>
                          <th className="p-3 font-bold uppercase text-center">⏱ Timer</th>
                          <th className="p-3 font-bold uppercase text-center">🛡 Risk</th>
                          <th className="p-3 font-bold uppercase text-right">Total</th>
                          <th className="p-3 font-bold uppercase text-center">Invoice</th>
                          <th className="p-3 font-bold uppercase text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBg-border/30">
                        {orders
                          .filter(o => activeFilterPill === 'All' ? true : o.kanbanCategory.toLowerCase() === activeFilterPill.toLowerCase())
                          .filter(o => o.customerName.toLowerCase().includes(adminSearch.toLowerCase()) || o.orderId.toLowerCase().includes(adminSearch.toLowerCase()))
                          .map((order, idx) => (
                            <tr 
                              key={order.orderId || order.id || `ord-${idx}`}
                              className="text-gray-300 hover:bg-darkBg-hover/30 transition-colors cursor-pointer group"
                              onClick={() => setInspectOrderRef(order)}
                            >
                              <td className="p-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                              <td className="p-3 font-bold text-white group-hover:text-accent-mint transition-colors">{order.orderId}</td>
                              <td className="p-3 font-bold text-white">{order.customerName}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold border ${getStatusColor(order.status)}`}>
                                  {order.status === 'SALE_ORDER' ? 'Confirmed' : order.status}
                                </span>
                              </td>
                              <td className="p-3 text-gray-400">{order.returnDate}</td>
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <CountdownTimer returnDate={order.returnDate} compact lateFeePerHour={lateFeePerHour} />
                              </td>
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <RiskBadge order={order} allOrders={orders} compact />
                              </td>
                              <td className="p-3 text-right font-extrabold text-white price-mono">${Number(order.total || 0).toFixed(2)}</td>
                              <td className="p-3 text-center text-[10px] font-bold uppercase" onClick={(e) => e.stopPropagation()}>
                                {order.invoiceStatus === 'Quotation Sent' && (
                                  <span className="px-2.5 py-1 rounded bg-purple-900/30 text-purple-300 border border-purple-500/25 inline-block">
                                    Quotation Sent
                                  </span>
                                )}
                                {order.invoiceStatus === 'Invoiced' && (
                                  <span className="px-2.5 py-1 rounded bg-blue-900/30 text-blue-300 border border-blue-500/25 inline-block">
                                    Invoiced
                                  </span>
                                )}
                                {order.invoiceStatus === 'Confirmed' && (
                                  <span className="px-2.5 py-1 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-500/25 inline-block">
                                    Sale order Confirmed
                                  </span>
                                )}
                                {(order.invoiceStatus === 'Nothing to Invoice' || order.invoiceStatus === 'Nothing to Invoiced') && (
                                  <span className="px-2.5 py-1 rounded bg-gray-800/80 text-gray-500 border border-gray-700 inline-block">
                                    Nothing to Invoiced
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setInspectOrderRef(order)}
                                  className="p-1 px-2.5 rounded bg-darkBg border border-darkBg-border hover:border-accent-mint text-[10px] font-bold text-gray-300 hover:text-white"
                                >
                                  Open
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3.1B KANBAN VIEW (Image 5) */}
              {ordersViewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {['Today', 'Pickup', 'Return', 'Late'].map((col) => {
                    const colOrders = orders
                      .filter(o => o.kanbanCategory.toLowerCase() === col.toLowerCase())
                      .filter(o => o.customerName.toLowerCase().includes(adminSearch.toLowerCase()));
                    
                    // Column border mapping matching Image 5
                    let colHeaderBorder = 'border-l-4 border-l-orange-500';
                    if (col === 'Pickup') colHeaderBorder = 'border-l-4 border-l-purple-500';
                    if (col === 'Return') colHeaderBorder = 'border-l-4 border-l-emerald-500';
                    if (col === 'Late') colHeaderBorder = 'border-l-4 border-l-red-500';

                    return (
                      <div key={col} className="flex flex-col rounded-xl border border-darkBg-border bg-darkBg-card/25 min-h-[400px] glass">
                        <div className={`p-3 border-b border-darkBg-border/60 font-bold text-white uppercase text-[10px] bg-darkBg/40 tracking-wider ${colHeaderBorder}`}>
                          {col} ({colOrders.length})
                        </div>
                        
                        <div className="p-2.5 flex-1 space-y-3 overflow-y-auto">
                          {colOrders.map((order, idx) => {
                            // Extract display product category/type (e.g. Laptop -> Games, Projector -> TV)
                            const firstItemName = order.items?.[0]?.product?.name || order.items?.[0]?.name || order.orderLines?.[0]?.productName || '';
                            let categoryText = 'Car';
                            if (firstItemName.includes('Projector') || firstItemName.includes('Monitor') || firstItemName.includes('TV')) {
                              categoryText = 'TV';
                            } else if (firstItemName.includes('Printer')) {
                              categoryText = 'Printer';
                            } else if (firstItemName.includes('Laptop') || firstItemName.includes('Games') || firstItemName.includes('Chair')) {
                              categoryText = 'Games';
                            }

                            // Dynamic status pill matching Image 5
                            let statusPill = (
                              <span className="text-[8.5px] px-2 py-0.5 rounded font-extrabold uppercase bg-blue-900/20 text-blue-400 border border-blue-500/20">
                                Quotation
                              </span>
                            );

                            if (order.status === 'SALE_ORDER') {
                              if (col === 'Late') {
                                statusPill = (
                                  <span className="text-[8.5px] px-2 py-0.5 rounded font-extrabold uppercase bg-red-950/20 text-red-400 border border-red-500/20">
                                    Late Return
                                  </span>
                                );
                              } else {
                                statusPill = (
                                  <span className="text-[8.5px] px-2 py-0.5 rounded font-extrabold uppercase bg-emerald-950/20 text-emerald-400 border border-emerald-500/20">
                                    Reserved
                                  </span>
                                );
                              }
                            } else if (order.status === 'CANCELLED') {
                              statusPill = (
                                <span className="text-[8.5px] px-2 py-0.5 rounded font-extrabold uppercase bg-gray-900 text-gray-500 border border-gray-800">
                                  Cancelled
                                </span>
                              );
                            }

                            return (
                              <div 
                                key={order.orderId || order.id || `kb-${col}-${idx}`}
                                onClick={() => setInspectOrderRef(order)}
                                className="p-3.5 bg-darkBg border border-darkBg-border rounded-lg hover:border-accent-mint/30 transition-all cursor-pointer space-y-2.5 group"
                              >
                                {/* Top Row */}
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-extrabold text-white group-hover:text-accent-mint transition-colors">{order.customerName}</span>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{categoryText}</span>
                                </div>
                                
                                {/* Middle Row */}
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-500 font-bold">{order.orderId}</span>
                                  <span className="font-extrabold text-white">${order.total}</span>
                                </div>
                                
                                {/* Bottom Row */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2.5 border-t border-darkBg-border/20 gap-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] text-gray-500">Rental Duration:</span>
                                    {statusPill}
                                  </div>
                                  
                                  <select
                                    value={order.kanbanCategory}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => moveOrderKanban(order.orderId, e.target.value)}
                                    className="bg-darkBg-card border border-darkBg-border rounded text-[9px] text-gray-400 p-0.5 focus:border-accent-mint"
                                  >
                                    <option value="Today">Today</option>
                                    <option value="Pickup">Pickup</option>
                                    <option value="Return">Return</option>
                                    <option value="Late">Late</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* 3.2 DETAILED VIEW FOR SPECIFIC RENTAL ORDER (Excalidraw Image 10) */}
          {orderSubmenu === 'Rental Orders' && inspectOrderRef && (
            <div className="space-y-6 animate-slide-up">
              
              {/* Back action */}
              <button
                onClick={() => setInspectOrderRef(null)}
                className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Rental Orders logs</span>
              </button>

              {/* Header actions block */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
                
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-extrabold text-white">Rental order</h3>
                  <span className="text-xs text-accent-mint font-bold uppercase">S000{inspectOrderRef.orderId.substring(1)}</span>
                </div>

                {/* Sub-bar Actions (Excalidraw Image 1 & 2) */}
                <div className="flex flex-wrap gap-2.5">
                  {inspectOrderRef.status !== 'SALE_ORDER' ? (
                    <>
                      {/* Quotation Buttons: Send, Confirm, Print */}
                      <button
                        type="button"
                        onClick={() => {
                          sendQuotation(inspectOrderRef.orderId);
                          setInspectOrderRef({ ...inspectOrderRef, status: 'QUOTATION_SENT' });
                        }}
                        className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase shadow-glow-subtle transition-colors"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          confirmSale(inspectOrderRef.orderId);
                          setInspectOrderRef({ ...inspectOrderRef, status: 'SALE_ORDER' });
                          celebrateOrderConfirmed();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg text-xs font-extrabold uppercase shadow-glow transition-all hover:shadow-glow-lg"
                      >
                        ✅ Confirm Sale
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerNotification(`Preparing statements to print S000${inspectOrderRef.orderId.substring(4)}...`, 'info')}
                        className="px-4 py-2 rounded border border-darkBg-border bg-darkBg text-gray-300 hover:border-accent-mint text-xs font-extrabold uppercase transition-colors"
                      >
                        Print
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Confirmed Order Buttons: Create Invoice, Pickup, Print, Cancel */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerNotification(`Creating invoices for S000${inspectOrderRef.orderId.substring(4)}`, 'success');
                          setOrderSubmenu('Invoices');
                          const invObj = invoices.find(i => i.orderId === inspectOrderRef.orderId);
                          if (invObj) {
                            setInspectInvoiceRef(invObj);
                          } else {
                            setInspectInvoiceRef(invoices[0]);
                          }
                          setInspectOrderRef(null);
                        }}
                        className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase shadow-glow-subtle transition-colors"
                      >
                        Create Invoice
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          pickupOrder(inspectOrderRef.orderId);
                          triggerNotification(`Order S000${inspectOrderRef.orderId.substring(4)} picked up`, 'success');
                        }}
                        className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase shadow-glow-subtle transition-colors"
                      >
                        Pickup
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerNotification(`Preparing statements to print confirmed order S000${inspectOrderRef.orderId.substring(4)}...`, 'info')}
                        className="px-4 py-2 rounded border border-darkBg-border bg-darkBg text-gray-300 hover:border-accent-mint text-xs font-extrabold uppercase transition-colors"
                      >
                        Print
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Change back to QUOTATION (immutable update)
                          const cancelled = { ...inspectOrderRef, status: 'QUOTATION' };
                          triggerNotification(`Order S000${inspectOrderRef.orderId.substring(4)} cancelled and reset to Quotation`, 'info');
                          setInspectOrderRef(cancelled);
                        }}
                        className="px-4 py-2 rounded border border-darkBg-border bg-darkBg text-gray-300 hover:border-accent-mint text-xs font-extrabold uppercase transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

              </div>

              {/* Rental Journey Full Timeline + Countdown */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <RentalJourneyTimeline order={inspectOrderRef} />
                <div className="space-y-3">
                  <CountdownTimer returnDate={inspectOrderRef.returnDate} lateFeePerHour={lateFeePerHour} />
                  <RiskBadge order={inspectOrderRef} allOrders={orders} compact />
                </div>
              </div>

              {/* Details Inputs layout & Order Lines matching Image 3 */}
              <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-6 text-xs text-gray-300">
                
                {/* Form fields: 2-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-darkBg-border/40">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Customer</label>
                      <input
                        type="text"
                        value={inspectOrderRef.customerName}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Invoice Address</label>
                      <input
                        type="text"
                        value={inspectOrderRef.customerName + ' Residence Street'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Delivery Address</label>
                      <input
                        type="text"
                        value={inspectOrderRef.customerName + ' Residence Street'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase block">Rental Period</label>
                      <div className="flex items-center space-x-2 bg-darkBg border border-darkBg-border rounded p-1.5 text-[11px] text-gray-400">
                        <span>{inspectOrderRef.items?.[0]?.rentalPeriod?.start || inspectOrderRef.rentalPeriodStart || '2026-01-01'}</span>
                        <span>&rarr;</span>
                        <span>{inspectOrderRef.items?.[0]?.rentalPeriod?.end || inspectOrderRef.rentalPeriodEnd || '2026-01-08'}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Price List</label>
                      <input
                        type="text"
                        value="My Price list (10% Discount rule active)"
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Lower Layout: Full-width Order Line Tab Grid */}
                <div className="space-y-4">
                  <div className="border-b border-darkBg-border pb-1">
                    <span className="text-xs font-bold text-accent-mint uppercase border-b-2 border-accent-mint pb-1.5 inline-block">
                      Order Line
                    </span>
                  </div>

                  <div className="rounded-lg border border-darkBg-border overflow-hidden bg-darkBg/30">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                          <th className="p-3">Product</th>
                          <th className="p-3">Quntity</th>
                          <th className="p-3">Unit</th>
                          <th className="p-3">Unit Price</th>
                          <th className="p-3">Taxes</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(inspectOrderRef.items || inspectOrderRef.orderLines || []).map((item, idx) => {
                          const prodName = item.product?.name || item.name || item.productName || 'Lease Item';
                          const qVal = item.quantity || 1;
                          const pRate = item.priceRate || item.unitPrice || (inspectOrderRef.total ? inspectOrderRef.total / qVal : 100);
                          const pTotal = item.totalCost || item.total || (pRate * qVal);
                          const pStart = item.rentalPeriod?.start || inspectOrderRef.rentalPeriodStart || '2026-01-01';
                          const pEnd = item.rentalPeriod?.end || inspectOrderRef.rentalPeriodEnd || '2026-01-08';
                          return (
                            <tr key={idx} className="text-gray-300 border-b border-darkBg-border/10 hover:bg-darkBg-hover/10 transition-colors">
                              <td className="p-3 font-semibold text-white">
                                {prodName} <span className="text-[10px] text-gray-500 font-normal">[{pStart} &rarr; {pEnd}]</span>
                              </td>
                              <td className="p-3">{qVal}</td>
                              <td className="p-3 text-gray-400">Units</td>
                              <td className="p-3">
                                ${Number(pRate).toFixed(2)}
                              </td>
                              <td className="p-3 text-gray-400">
                                10%
                              </td>
                              <td className="p-3 text-right font-bold text-white">
                                ${Number(pTotal).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom actions & totals */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                    {/* Actions links */}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => triggerNotification('Add product line clicked.', 'info')}
                        className="text-xs text-accent-mint font-bold hover:underline"
                      >
                        Add a Product
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerNotification('Add order note clicked.', 'info')}
                        className="text-xs text-accent-mint font-bold hover:underline"
                      >
                        Add a note
                      </button>
                    </div>

                    {/* Summary calculations */}
                    <div className="w-full sm:w-64 space-y-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex justify-between text-gray-400 text-[11px]">
                        <span>Untaxed Amount:</span>
                        <span className="text-white font-bold">${Number(inspectOrderRef.subtotal || inspectOrderRef.total || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-[11px]">
                        <span>Taxes (10%):</span>
                        <span className="text-white font-bold">${Number((inspectOrderRef.subtotal || inspectOrderRef.total || 0) * 0.10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white font-extrabold text-sm border-t border-darkBg-border/40 pt-2">
                        <span>Total:</span>
                        <span className="text-accent-mint">${Number((inspectOrderRef.total || inspectOrderRef.subtotal || 0) * 1.10).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* 3.3 SUBVIEW: INVOICES (Excalidraw Image 9) */}
          {orderSubmenu === 'Invoices' && !inspectInvoiceRef && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white border-b border-darkBg-border pb-2">Structured Invoice Statement Records</h3>
              
              <div className="rounded-xl border border-darkBg-border bg-darkBg-card overflow-hidden glass">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                      <th className="p-3 font-bold uppercase">Invoice ID</th>
                      <th className="p-3 font-bold uppercase">Order Reference</th>
                      <th className="p-3 font-bold uppercase">Customer</th>
                      <th className="p-3 font-bold uppercase">Issue Date</th>
                      <th className="p-3 font-bold uppercase text-center">Status</th>
                      <th className="p-3 font-bold uppercase text-right">Value Amount</th>
                      <th className="p-3 font-bold uppercase text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBg-border/30">
                    {invoices.map((inv, idx) => (
                      <tr 
                        key={inv.invoiceId || inv.id || `inv-${idx}`}
                        className="text-gray-300 hover:bg-darkBg-hover/30 transition-colors cursor-pointer"
                        onClick={() => setInspectInvoiceRef(inv)}
                      >
                        <td className="p-3 font-bold text-white">{inv.invoiceId}</td>
                        <td className="p-3 text-gray-400">{inv.orderId}</td>
                        <td className="p-3 font-bold text-white">{inv.customerName}</td>
                        <td className="p-3 text-gray-400">{inv.date}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold border ${
                            inv.status === 'POSTED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-extrabold text-white">${Number(inv.amount || inv.amountDue || 0).toFixed(2)}</td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectInvoiceRef(inv)}
                            className="p-1 px-2.5 rounded bg-darkBg border border-darkBg-border text-[10px] font-bold text-gray-300 hover:text-white"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3.4 DETAILED VIEW FOR SPECIFIC INVOICE (Excalidraw Image 9) */}
          {orderSubmenu === 'Invoices' && inspectInvoiceRef && (
            <div className="space-y-6 animate-slide-up">
              
              {/* Back action */}
              <button
                onClick={() => setInspectInvoiceRef(null)}
                className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Invoice statements</span>
              </button>

              {/* Header Action Bar (Excalidraw Image 2 & 3) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
                
                {/* Left side actions */}
                <div className="flex flex-wrap gap-2.5">
                  {inspectInvoiceRef.status === 'DRAFT' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          postInvoice(inspectInvoiceRef.invoiceId);
                          setInspectInvoiceRef({ ...inspectInvoiceRef, status: 'POSTED' });
                          triggerNotification('Invoice confirmed (Posted)', 'success');
                          celebrateInvoicePaid();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-violet to-accent-violetDark text-white text-xs font-extrabold uppercase shadow-glow-violet transition-all hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInvoices(invoices.filter(i => i.invoiceId !== inspectInvoiceRef.invoiceId));
                          triggerNotification('Invoice discarded', 'info');
                          setInspectInvoiceRef(null);
                        }}
                        className="px-4 py-2 rounded border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-900/30 text-xs font-extrabold uppercase transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          triggerNotification(`Invoice INV/2026/0001 sent to customer`, 'success');
                        }}
                        className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase shadow-glow-subtle transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => triggerNotification('Triggering print layout...', 'info')}
                        className="px-4 py-2 rounded border border-darkBg-border bg-darkBg text-gray-300 hover:border-accent-mint text-xs font-extrabold uppercase transition-colors"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => {
                          triggerNotification('Invoice marked as Paid', 'success');
                        }}
                        className="px-4 py-2 rounded bg-accent-mint hover:bg-accent-mintLight text-darkBg text-xs font-extrabold uppercase shadow-glow-subtle transition-colors"
                      >
                        Pay
                      </button>
                    </>
                  )}
                </div>

                {/* Right side status indicators */}
                <div className="flex border border-darkBg-border rounded-lg overflow-hidden bg-darkBg text-[10px] font-bold uppercase tracking-wider">
                  <span className={`px-4.5 py-2.5 transition-colors ${inspectInvoiceRef.status === 'DRAFT' ? 'bg-gray-700 text-white shadow-inner font-extrabold' : 'text-gray-500 bg-darkBg'}`}>
                    Draft
                  </span>
                  <span className={`px-4.5 py-2.5 transition-colors ${inspectInvoiceRef.status === 'POSTED' ? 'bg-emerald-600 text-white shadow-inner font-extrabold' : 'text-gray-500 bg-darkBg'}`}>
                    Posted
                  </span>
                </div>

              </div>

              {/* Invoice Detail inputs (Excalidraw Image 2) */}
              <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-6 text-xs text-gray-300">
                
                {/* Form fields: 2-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-darkBg-border/40">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Customer</label>
                      <input
                        type="text"
                        value={inspectInvoiceRef.customerName || 'Customer'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Invoice Address</label>
                      <input
                        type="text"
                        value={inspectInvoiceRef.invoice_address || 'Customer Billing Address'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Delivery Address</label>
                      <input
                        type="text"
                        value={inspectInvoiceRef.delivery_address || 'Customer Delivery Destination'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Invoice date</label>
                      <input
                        type="text"
                        value={inspectInvoiceRef.date || inspectInvoiceRef.issueDate || '2026-01-05'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Delivery Method</label>
                      <input
                        type="text"
                        value={inspectInvoiceRef.delivery_method || 'Standard Delivery'}
                        disabled
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom section: Invoice Lines grid */}
                <div className="space-y-3">
                  <div className="flex border-b border-darkBg-border gap-4 pb-1">
                    <button type="button" className="text-xs font-bold text-accent-mint pb-1.5 border-b-2 border-accent-mint">
                      Invoice Lines
                    </button>
                  </div>

                  <div className="rounded border border-darkBg-border overflow-hidden bg-darkBg/30 mt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                          <th className="p-3">Product</th>
                          <th className="p-3">Quntity</th>
                          <th className="p-3">Unit</th>
                          <th className="p-3">Unit Price</th>
                          <th className="p-3">Taxes</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const totalVal = inspectInvoiceRef.amount ?? inspectInvoiceRef.amountDue ?? 0;
                          const taxPct = inspectInvoiceRef.tax_percentage ?? 10.00;
                          const untaxedVal = inspectInvoiceRef.untaxed_amount ?? (totalVal / (1 + taxPct / 100));
                          const lines = inspectInvoiceRef.invoiceLines || [{ product: 'Rental Product Package', quantity: 1, unitPrice: untaxedVal, taxPercent: taxPct, amount: totalVal }];
                          
                          return lines.map((line, idx) => (
                            <tr key={idx} className="text-gray-300 border-b border-darkBg-border/10 hover:bg-darkBg-hover/10 transition-colors">
                              <td className="p-3 font-semibold text-white">
                                {line.product || 'Computers'} <span className="text-[10px] text-gray-500 font-normal">[Jan 1, 2026 &rarr; Jan 8, 2026]</span>
                              </td>
                              <td className="p-3">{line.quantity || 1}</td>
                              <td className="p-3 text-gray-400">Units</td>
                              <td className="p-3">
                                ${Number(line.unitPrice || untaxedVal).toFixed(2)}
                              </td>
                              <td className="p-3 text-gray-400">
                                {taxPct}%
                              </td>
                              <td className="p-3 text-right font-bold text-white">
                                ${Number(line.amount || untaxedVal).toFixed(2)}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer actions & calculations side-by-side */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-3">
                    {/* Add product / note links */}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => triggerNotification('Add product line clicked.', 'info')}
                        className="text-xs text-accent-mint font-bold hover:underline"
                      >
                        Add a Product
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerNotification('Add invoice note clicked.', 'info')}
                        className="text-xs text-accent-mint font-bold hover:underline"
                      >
                        Add a note
                      </button>
                    </div>

                    {/* Summary card */}
                    {(() => {
                      const totalVal = inspectInvoiceRef.amount ?? inspectInvoiceRef.amountDue ?? 0;
                      const taxPct = inspectInvoiceRef.tax_percentage ?? 10.00;
                      const untaxedVal = inspectInvoiceRef.untaxed_amount ?? (totalVal / (1 + taxPct / 100));
                      const taxVal = inspectInvoiceRef.taxes ?? (totalVal - untaxedVal);
                      
                      return (
                        <div className="w-full sm:w-64 space-y-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <div className="flex justify-between text-gray-400 text-[11px]">
                            <span>Untaxed Amount:</span>
                            <span className="text-white font-bold">${Number(untaxedVal).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px]">
                            <span>Taxes ({taxPct}%):</span>
                            <span className="text-white font-bold">${Number(taxVal).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-white font-extrabold text-sm border-t border-darkBg-border/40 pt-2">
                            <span>Total:</span>
                            <span className="text-accent-mint">${Number(totalVal).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 3.5 SUBVIEW: CUSTOMERS */}
          {orderSubmenu === 'Customers' && (
            <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass text-xs space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white border-b border-darkBg-border pb-2">Client database log</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {orders.map((o, idx) => (
                  <div key={idx} className="p-4 bg-darkBg border border-darkBg-border rounded-lg space-y-2">
                    <p className="font-bold text-white text-sm">{o.customerName}</p>
                    <p className="text-gray-400">Email: {o.customerEmail}</p>
                    <p className="text-gray-400">Phone: {o.customerPhone}</p>
                    <span className="inline-block text-[9px] bg-accent-mint/10 border border-accent-mint/20 text-accent-mint px-2 py-0.5 rounded uppercase font-bold">
                      Customer Profile
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== TAB 2: SCHEDULE =================== */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* ==================== TAB 2: SCHEDULE =================== */}
      {/* ======================================================== */}
      {activeTab === 'Schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
          
          {/* Left Column: Sidebar Legend card */}
          <div className="lg:col-span-1 rounded-xl border border-darkBg-border bg-darkBg-card p-4 glass space-y-3 text-xs h-fit self-start">
            <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2">Status indicators</h4>
            <div className="space-y-2 font-semibold">
              <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-orange-500 mr-2 flex-shrink-0"></span> Booked</div>
              <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-pink-500 mr-2 flex-shrink-0"></span> Pick up</div>
              <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-emerald-500 mr-2 flex-shrink-0"></span> Late Pick up</div>
              <div className="flex items-center"><span className="h-3 w-3 rounded-full bg-red-500 mr-2 flex-shrink-0"></span> Late Delivery</div>
            </div>
          </div>

          {/* Middle Columns: Main Month calendar Grid (Excalidraw Image 3 & 4) */}
          <div className="lg:col-span-3 rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-4">
            
            {/* Header controls with Date month dropdown */}
            <div className="flex justify-between items-center border-b border-darkBg-border pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-accent-mint" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rental Scheduler</h3>
              </div>
              
              {/* Date dropdown select month */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Active Month:</span>
                <select
                  value={selectedSchMonth}
                  onChange={(e) => setSelectedSchMonth(e.target.value)}
                  className="rounded border border-darkBg-border bg-darkBg px-3 py-1.5 text-xs text-white outline-none focus:border-accent-mint font-bold uppercase"
                >
                  <option value="Jan 2026">Jan 2026</option>
                  <option value="Feb 2026">Feb 2026</option>
                  <option value="Mar 2026">Mar 2026</option>
                </select>
              </div>
            </div>

            {/* Standard Calendar Grid representation (January 2026) */}
            <div className="space-y-2 text-center text-xs">
              
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-2 text-gray-500 font-bold uppercase">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-2.5">
                {/* Empty buffer for Jan 2026 (starts on Thursday = 4 offset days) */}
                <div className="bg-transparent h-16 rounded-lg"></div>
                <div className="bg-transparent h-16 rounded-lg"></div>
                <div className="bg-transparent h-16 rounded-lg"></div>
                <div className="bg-transparent h-16 rounded-lg"></div>

                {/* Day blocks 1 to 31 */}
                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `2026-01-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const dayEvents = scheduleEvents[dateStr] || [];
                  const isSelected = selectedSchDay === dateStr;
                  const isToday = dayNum === 28; // Red outline for 28 (Image 5 today marker)

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedSchDay(dateStr)}
                      className={`relative h-14 rounded-lg border bg-darkBg flex flex-col justify-between p-1.5 cursor-pointer hover:border-gray-500 transition-all ${
                        isSelected 
                          ? 'border-accent-mint shadow-glow-subtle' 
                          : isToday 
                            ? 'border-red-500 ring-1 ring-red-500/50' 
                            : 'border-darkBg-border'
                      }`}
                    >
                      {/* Number */}
                      <span className={`text-[10px] font-bold ${
                        isSelected ? 'text-accent-mint' : isToday ? 'text-red-500 font-extrabold' : 'text-gray-300'
                      }`}>
                        {dayNum}
                      </span>

                      {/* Today indicator */}
                      {isToday && (
                        <span className="absolute top-0.5 right-0.5 text-[5px] bg-red-600 text-white font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                          Today
                        </span>
                      )}

                      {/* Event colored dots log (Excalidraw Image 4 & 5) */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 items-center justify-center">
                          {dayEvents.slice(0, 4).map((evt, eIdx) => {
                            let dotColor = 'bg-orange-500'; // Booked
                            if (evt.type === 'Pickup') dotColor = 'bg-pink-500';
                            if (evt.type === 'Late Pickup') dotColor = 'bg-emerald-500'; // green dot
                            if (evt.type === 'Late Delivery') dotColor = 'bg-red-500';
                            return (
                              <span 
                                key={eIdx} 
                                className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
                                title={`${evt.orderRef} - ${evt.product}`}
                              ></span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Right Column: Selected day log listings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-4 glass space-y-4 text-xs min-h-[250px]">
              <div>
                <p className="text-[10px] text-accent-mint font-bold uppercase">Detailed Logs</p>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {new Date(selectedSchDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>

              <div className="space-y-3">
                {(scheduleEvents[selectedSchDay] || []).length > 0 ? (
                  (scheduleEvents[selectedSchDay] || []).map((evt) => (
                    <div 
                      key={evt.id}
                      className="p-2.5 bg-darkBg border border-darkBg-border rounded space-y-1.5 relative group"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-accent-mint uppercase">{evt.orderRef}</span>
                        <span className="text-gray-500">Qty: {evt.quantity}</span>
                      </div>
                      
                      <p className="font-semibold text-white truncate">{evt.product} ({evt.variant})</p>
                      
                      <div className="flex justify-between items-center pt-1 text-[9px]">
                        <span className="text-gray-400">Status: {evt.status}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          evt.type === 'Pickup' ? 'bg-pink-500/10 text-pink-400' :
                          evt.type === 'Booked' ? 'bg-orange-500/10 text-orange-400' :
                          evt.type === 'Late Pickup' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {evt.type}
                        </span>
                      </div>

                      {/* Edit icon button matching mockup */}
                      <button
                        type="button"
                        onClick={() => {
                          setOrderSubmenu('Rental Orders');
                          const targetOrder = orders.find(o => o.orderId === evt.orderRef);
                          if (targetOrder) {
                            setInspectOrderRef(targetOrder);
                          }
                          triggerNotification(`Navigating to order detail for ${evt.orderRef}`, 'info');
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Order"
                      >
                        📝
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-darkBg-border/50 rounded-lg text-center text-gray-500 text-xs">
                    No scheduler tickets on this date.
                  </div>
                )}
              </div>

              <p className="text-[9px] text-gray-400 leading-relaxed pt-2 border-t border-darkBg-border/25">
                (all the status mentioned in the brackets are showing the product availability)
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== TAB 3: PRODUCT ==================== */}
      {/* ======================================================== */}
      {activeTab === 'Product' && (
        <div className="space-y-6">
          
          {/* 3.1 VIEW: PRODUCTS CATALOG MANAGEMENT (Image 6 & 7) */}
          {productSubmenu === 'Products' && !activeProductEdit && (
            <div className="space-y-4 animate-fade-in">
              
              <div className="flex justify-between items-center bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
                <h3 className="text-sm font-bold text-white">Registered Catalog Items</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={importExternalProducts}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-glow-subtle transition-all"
                  >
                    <span>🌐 Import External Catalog</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateProductNew}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded bg-accent-mint text-darkBg text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Product</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleEditProductClick(product)}
                    className="p-4 rounded-xl border border-darkBg-border bg-darkBg-card hover:border-accent-mint/30 transition-all cursor-pointer space-y-4 group glass"
                  >
                    <div className="aspect-video w-full rounded overflow-hidden bg-darkBg border border-darkBg-border/40">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-accent-mint transition-colors">{product.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 capitalize">{product.category} • {product.product_type} • Stock: {product.stock_quantity}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-darkBg-border/30 text-xs font-bold">
                      <span className="text-accent-mint">${product.sales_price} / {product.periodicity.toLowerCase()}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-extrabold ${
                        product.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3.2 PRODUCT CREATION FLOW FORM TABS (Excalidraw Image 6 & 7) */}
          {productSubmenu === 'Products' && activeProductEdit && (
            <form onSubmit={handleSaveProduct} className="space-y-6 animate-slide-up max-w-4xl mx-auto">
              
              {/* Back action */}
              <button
                type="button"
                onClick={() => setActiveProductEdit(null)}
                className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Catalog registry</span>
              </button>

              {/* Form title header */}
              <div className="flex justify-between items-center bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
                <div className="flex items-center space-x-3">
                  <span className="text-base font-extrabold text-white">Product</span>
                  <span className="text-xs text-accent-mint uppercase font-bold bg-accent-mint/10 px-2 py-0.5 rounded">
                    {activeProductEdit.id === 'new' ? 'New Setup' : `ID: ${activeProductEdit.id}`}
                  </span>
                </div>

                {/* Save and Cancel buttons */}
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="p-1 px-3 bg-accent-mint rounded text-darkBg text-xs font-bold"
                    title="Save changes"
                  >
                    ✓ Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProductEdit(null)}
                    className="p-1 px-3 border border-darkBg-border rounded text-gray-400 hover:text-white text-xs font-bold"
                    title="Cancel changes"
                  >
                    ✗ Cancel
                  </button>
                </div>
              </div>

              {/* Input name & Image preview */}
              <div className="flex flex-col md:flex-row gap-6 bg-darkBg-card border border-darkBg-border p-6 rounded-xl glass justify-between items-start">
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Product Title</label>
                    <input
                      type="text"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="Product Name"
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2.5 text-sm text-white font-bold outline-none focus:border-accent-mint"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Product Category</label>
                    <input
                      type="text"
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-xs text-white outline-none focus:border-accent-mint"
                    />
                  </div>
                </div>

                {/* Top Right Image preview block */}
                <div className="h-24 w-40 rounded border border-darkBg-border/50 bg-darkBg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img src={activeProductEdit.image || '/images/ultrawide_monitor.jpg'} className="h-full w-full object-cover" alt="Preview" />
                </div>

              </div>

              {/* Form Navigation tabs: General Information, Attributes & Variants, Sales */}
              <div className="flex border-b border-darkBg-border gap-4 pb-2">
                {['General Information', 'Attributes & Variants', 'Sales'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setProductFormTab(tab)}
                    className={`pb-1.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      productFormTab === tab ? 'border-accent-mint text-accent-mint' : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TABS VIEW ROUTING */}
              
              {/* Tab 3.2A: GENERAL INFORMATION */}
              {productFormTab === 'General Information' && (
                <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4 text-xs animate-fade-in">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Product Type</label>
                    <div className="flex space-x-6 text-gray-300">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="product_type"
                          value="GOODS"
                          checked={pType === 'GOODS'}
                          onChange={() => setPType('GOODS')}
                          className="text-accent-mint focus:ring-0"
                        />
                        <span>Goods</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="product_type"
                          value="SERVICE"
                          checked={pType === 'SERVICE'}
                          onChange={() => setPType('SERVICE')}
                          className="text-accent-mint focus:ring-0"
                        />
                        <span>Service</span>
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
                      Note: If the vendor wants to add deposit or downpayment with the product then the vendor needs to create product (type Service) named deposit/downpayment and add it in the invoice. Same goes with the warranty.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-darkBg-border/30">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Quantity on Hand</label>
                      <input
                        type="number"
                        value={pQty}
                        onChange={(e) => setPQty(Number(e.target.value))}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Sales Price ($)</label>
                      <input
                        type="number"
                        value={pSalesPrice}
                        onChange={(e) => setPSalesPrice(Number(e.target.value))}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Cost Price ($)</label>
                      <input
                        type="number"
                        value={pCostPrice}
                        onChange={(e) => setPCostPrice(Number(e.target.value))}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-darkBg-border/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-300">Publish to Network Storefront</p>
                      <p className="text-[10px] text-gray-500">Only Admin should have the right to publish or unpublish a product</p>
                    </div>
                    
                    <label className={`relative inline-flex items-center ${user.role === 'ADMIN' ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <input
                        type="checkbox"
                        checked={pPublish}
                        onChange={(e) => setPPublish(e.target.checked)}
                        disabled={user.role !== 'ADMIN'}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-darkBg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-mint peer-checked:after:bg-darkBg"></div>
                    </label>
                  </div>

                </div>
              )}

              {/* Tab 3.2B: ATTRIBUTES & VARIANTS */}
              {productFormTab === 'Attributes & Variants' && (
                <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4 text-xs animate-fade-in">
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBg-border text-gray-400 text-[10px]">
                          <th className="py-2.5 font-bold uppercase">
                            Attributes
                            <span className="block text-[8px] text-gray-500 font-normal capitalize">Name of the Attributes (Brand, color, Size...)</span>
                          </th>
                          <th className="py-2.5 font-bold uppercase">
                            Values
                            <span className="block text-[8px] text-gray-500 font-normal capitalize">List of possible values (e.g. Red, Green, Blue..)</span>
                          </th>
                          <th className="py-2.5 font-bold uppercase text-center w-24">Configure</th>
                          <th className="py-2.5 font-bold uppercase text-right w-12">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBg-border/20">
                        {attributes.map((attr) => (
                          <tr key={attr.id} className="text-gray-300 border-b border-darkBg-border/10 hover:bg-darkBg-hover/10 transition-colors">
                            <td className="py-3 font-semibold text-white">{attr.name}</td>
                            <td className="py-3 text-gray-400">
                              {attr.values.map(v => v.value).join(', ')}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setProductSubmenu('Attributes');
                                  setSelectedAttrId(attr.id);
                                  setAttrNameInput(attr.name);
                                  setAttrDisplayInput(attr.display_type);
                                  setAttrValues(attr.values);
                                  triggerNotification(`Configure values for ${attr.name}`, 'info');
                                }}
                                className="text-[10px] text-accent-mint font-extrabold hover:underline"
                              >
                                Configure
                              </button>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                className="text-gray-500 hover:text-red-400 inline-block align-middle mr-2"
                                onClick={() => deleteAttribute(attr.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProductSubmenu('Attributes');
                      triggerNotification('Define attribute specifications here', 'info');
                    }}
                    className="text-xs text-accent-mint font-bold hover:underline"
                  >
                    + Add a line
                  </button>

                </div>
              )}

              {/* Tab 3.2C: SALES */}
              {productFormTab === 'Sales' && (
                <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass grid grid-cols-1 md:grid-cols-2 gap-6 text-xs animate-fade-in">
                  
                  {/* Left: Rental periodicity */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2 text-[11px]">Rental</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-bold">Periodicity</label>
                      <select
                        value={pPeriodicity}
                        onChange={(e) => setPPeriodicity(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      >
                        <option value="HOURS">Hours</option>
                        <option value="DAY">Day</option>
                        <option value="NIGHT">Night</option>
                        <option value="WEEKLY">Weekly</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Pickup</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            defaultValue="10:00"
                            className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                          />
                          <span className="text-gray-400 text-[11px] font-bold">H</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Return</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            defaultValue="19:00"
                            className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                          />
                          <span className="text-gray-400 text-[11px] font-bold">H</span>
                        </div>
                      </div>
                    </div>

                    {pPeriodicity === 'HOURS' && (
                      <div className="space-y-1 animate-fade-in pt-1">
                        <div className="flex items-center space-x-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">Padding Time</label>
                          <input
                            type="text"
                            defaultValue="2:00 H"
                            className="w-20 rounded border border-darkBg-border bg-darkBg p-1 text-[11px] text-white text-center outline-none focus:border-accent-mint"
                          />
                        </div>
                        <span className="text-[9px] text-red-400/90 block leading-tight">
                          (Only in case of Hours)
                        </span>
                      </div>
                    )}

                    {pickupLateFeeChecked ? (
                      <div className="space-y-2 animate-fade-in pt-2 border-t border-darkBg-border/20">
                        <div className="flex items-center space-x-2">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">Late Fees $</label>
                          <input
                            type="number"
                            defaultValue={150}
                            className="w-24 rounded border border-darkBg-border bg-darkBg p-1.5 text-white outline-none focus:border-accent-mint text-[11px]"
                          />
                          <span className="text-[10px] text-gray-400">per hour late</span>
                        </div>
                        
                        <div className="p-3 bg-darkBg/60 border border-darkBg-border/50 rounded-lg text-[9px] text-gray-500 space-y-1.5 leading-relaxed">
                          <p>
                            * If the rented product is returned late by a specific duration apart from regular rental charges, late fees are applicable. The calculation will be: <strong>(late fees per hour) × (number of hours late)</strong>.
                          </p>
                          <p>
                            E.g. If the product is rented for 9 hours and returned in 9.5 hours, the late fee charged is: <strong>1 hour × $150/hour = $150</strong>.
                          </p>
                          <p>
                            Also, one default product named "Late Fees" is automatically added to the Sales Order Line with the calculated amount when clicking the return button on the backend.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-darkBg/30 border border-dashed border-darkBg-border rounded-lg text-[9px] text-gray-500 leading-tight">
                        * Late Fees / Overdue Penalty option is hidden. To show this, check marked the option on the Settings page.
                      </div>
                    )}
                  </div>

                  {/* Right: Security deposit */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2 text-[11px]">Rental Deposit</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-bold">Security Deposit ($)</label>
                      <input
                        type="number"
                        value={pDeposit}
                        onChange={(e) => setPDeposit(Number(e.target.value))}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      />
                    </div>
                  </div>

                </div>
              )}

            </form>
          )}

          {/* 3.3 VIEW: PRICE LIST RULES (Excalidraw Image 2 & 3) */}
          {productSubmenu === 'Price list' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-xs">
              
              {/* Left Column: Rules configuration grid */}
              <div className="lg:col-span-2 rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-darkBg-border pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">Name</span>
                    <input
                      type="text"
                      value="My Price list"
                      disabled
                      className="rounded border border-darkBg-border bg-darkBg py-1 px-2.5 font-bold text-white outline-none"
                    />
                  </div>
                  
                  {/* Status checklist */}
                  <div className="flex space-x-1 bg-darkBg p-1.5 rounded border border-darkBg-border/60">
                    <button type="button" className="p-0.5 rounded text-accent-mint font-bold hover:brightness-110">✓</button>
                    <button type="button" className="p-0.5 rounded text-red-500 font-bold hover:brightness-110">✗</button>
                  </div>
                </div>

                {/* Rules list */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-300 uppercase tracking-wider block">Rules</h4>
                  
                  <div className="rounded border border-darkBg-border overflow-hidden bg-darkBg/30">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                          <th className="p-3">Apply On</th>
                          <th className="p-3">Mim. Qty</th>
                          <th className="p-3">Validity</th>
                          <th className="p-3 text-center">Selectable</th>
                          <th className="p-3 text-right">Unite Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricelists[0]?.rules.map((rule, idx) => (
                          <tr key={idx} className="text-gray-300 hover:bg-darkBg-hover/30 transition-colors">
                            <td className="p-3 font-semibold text-white">{rule.product}</td>
                            <td className="p-3">{Number(rule.min_qty || 0).toFixed(2)}</td>
                            <td className="p-3 text-gray-500">{rule.validity_start || 'Always Active'}</td>
                            <td className="p-3 text-center">
                              <input type="checkbox" checked={rule.selectable} disabled className="rounded" />
                            </td>
                            <td className="p-3 text-right font-extrabold text-accent-mint">
                              {rule.price_type === 'DISCOUNT' ? `${rule.discount_percentage}% Discount` : `$${rule.fixed_price}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerNotification('Enter rules fields in the right sidebar creator to add line.', 'info')}
                    className="text-xs text-accent-mint font-bold hover:underline"
                  >
                    + Add a line
                  </button>
                </div>

              </div>

              {/* Right Column: Create rules sidebar form */}
              <div className="lg:col-span-1 rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-4">
                <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2">Create Pricelist Rules</h4>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newRule = {
                      product: ruleProductInput,
                      price_type: ruleTypeInput,
                      fixed_price: Number(ruleFixedVal),
                      discount_percentage: Number(ruleDiscountVal),
                      min_qty: Number(ruleMinQty),
                      validity_start: ruleValidityText ? ruleValidityText.split(' - ')[0] : '',
                      validity_end: ruleValidityText ? ruleValidityText.split(' - ')[1] : '',
                      selectable: ruleSelectable
                    };
                    createPricelistRule('pl-1', newRule);
                    triggerNotification('Pricelist rule created!', 'success');
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Products</label>
                    <input
                      type="text"
                      value={ruleProductInput}
                      onChange={(e) => setRuleProductInput(e.target.value)}
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Price Type</label>
                    <div className="flex space-x-4 text-gray-300">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rule_price_type"
                          value="DISCOUNT"
                          checked={ruleTypeInput === 'DISCOUNT'}
                          onChange={() => setRuleTypeInput('DISCOUNT')}
                          className="text-accent-mint focus:ring-0"
                        />
                        <span>Discount</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rule_price_type"
                          value="FIXED"
                          checked={ruleTypeInput === 'FIXED'}
                          onChange={() => setRuleTypeInput('FIXED')}
                          className="text-accent-mint focus:ring-0"
                        />
                        <span>Fixed Price</span>
                      </label>
                    </div>
                  </div>

                  {ruleTypeInput === 'FIXED' ? (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Fixed Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ruleFixedVal}
                        onChange={(e) => setRuleFixedVal(Number(e.target.value))}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Discount (%)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          value={ruleDiscountVal}
                          onChange={(e) => setRuleDiscountVal(Number(e.target.value))}
                          className="w-24 rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                        />
                        <span className="text-[10px] text-gray-400">% on sales price</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Min Qty</label>
                    <input
                      type="number"
                      step="1"
                      value={ruleMinQty}
                      onChange={(e) => setRuleMinQty(Number(e.target.value))}
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Validity</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Open Calendar to select the date range"
                        value={ruleValidityText}
                        readOnly
                        onClick={() => {
                          setRuleValidityText("Jan 1, 2026 - Dec 31, 2026");
                          triggerNotification("Opent Calander to select the date or date range", "info");
                        }}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px] cursor-pointer"
                      />
                      <div className="text-[9px] text-accent-mint/70 mt-1">
                        * Opent Calander to select the date or date range
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="rule_selectable"
                      checked={ruleSelectable}
                      onChange={(e) => setRuleSelectable(e.target.checked)}
                      className="rounded border-darkBg-border bg-darkBg text-accent-mint focus:ring-0 h-3.5 w-3.5"
                    />
                    <label htmlFor="rule_selectable" className="text-[10px] text-gray-400 font-bold uppercase cursor-pointer select-none">
                      Selectable
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center py-2.5 bg-accent-mint hover:bg-accent-mintLight text-darkBg font-bold rounded-lg text-xs"
                  >
                    Create Pricelist Rule
                  </button>
                </form>

              </div>

            </div>
          )}

          {/* 3.4 VIEW: ATTRIBUTES MANAGEMENT VIEW (Excalidraw Image 1) */}
          {productSubmenu === 'Attributes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-xs">
              
              {/* Left Column: Attributes Checklist table */}
              <div className="lg:col-span-2 rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-darkBg-border pb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-bold text-white">Attributes</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAttrId('new');
                        setAttrNameInput('');
                        setAttrDisplayInput('RADIO');
                        setAttrValues([]);
                        triggerNotification('Enter attributes settings on the right panel to define.', 'info');
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-[10px] uppercase transition-colors"
                    >
                      New
                    </button>
                  </div>

                  {/* Search box matching Image 4 */}
                  <div className="relative w-full sm:w-48">
                    <input
                      type="text"
                      placeholder="Search attributes..."
                      value={attrSearch}
                      onChange={(e) => setAttrSearch(e.target.value)}
                      className="w-full rounded border border-darkBg-border bg-darkBg p-1.5 pl-7 text-white outline-none focus:border-accent-mint text-[11px]"
                    />
                    <span className="absolute left-2 top-1.5 text-gray-500">🔍</span>
                  </div>
                </div>

                <div className="rounded border border-darkBg-border overflow-hidden bg-darkBg/30">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                        <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
                        <th className="p-3">Attributes</th>
                        <th className="p-3">Display Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributes
                        .filter(attr => attr.name.toLowerCase().includes(attrSearch.toLowerCase()))
                        .map((attr) => (
                          <tr 
                            key={attr.id} 
                            onClick={() => {
                              setSelectedAttrId(attr.id);
                              setAttrNameInput(attr.name);
                              setAttrDisplayInput(attr.display_type);
                              setAttrValues(attr.values);
                            }}
                            className={`text-gray-300 hover:bg-darkBg-hover/30 transition-colors cursor-pointer ${
                              selectedAttrId === attr.id ? 'bg-darkBg-hover/30' : ''
                            }`}
                          >
                            <td className="p-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                            <td className="p-3 font-semibold text-white">{attr.name}</td>
                            <td className="p-3 font-semibold text-accent-mint capitalize">{attr.display_type.toLowerCase()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Right Column: Attribute Name config form */}
              <div className="lg:col-span-1 rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-4">
                <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2">Attribute Configuration</h4>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!attrNameInput) return;

                    const valuesList = attrValues.filter(val => val.value.trim() !== '');

                    if (selectedAttrId === 'new') {
                      createAttribute({
                        name: attrNameInput,
                        display_type: attrDisplayInput,
                        values: valuesList
                      });
                      setSelectedAttrId('attr-1');
                    } else {
                      updateAttribute(selectedAttrId, {
                        name: attrNameInput,
                        display_type: attrDisplayInput,
                        values: valuesList
                      });
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Attribute name</label>
                    <input
                      type="text"
                      value={attrNameInput}
                      onChange={(e) => setAttrNameInput(e.target.value)}
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Display Type</label>
                    <select
                      value={attrDisplayInput}
                      onChange={(e) => setAttrDisplayInput(e.target.value)}
                      className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                    >
                      <option value="RADIO">Radio</option>
                      <option value="PILLS">Pills</option>
                      <option value="CHECKBOX">Check Box</option>
                      <option value="IMAGE">Image</option>
                    </select>
                  </div>

                  {/* Values grid editor */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Attribute Values</label>
                    <div className="border border-darkBg-border rounded bg-darkBg/30 overflow-hidden">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                            <th className="p-2 font-bold uppercase">Values</th>
                            <th className="p-2 font-bold uppercase text-right">Default Extra Price</th>
                            <th className="p-2 font-bold uppercase text-center w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-darkBg-border/20">
                          {attrValues.map((val, idx) => (
                            <tr key={val.id || idx} className="text-gray-300">
                              <td className="p-1">
                                <input
                                  type="text"
                                  value={val.value}
                                  onChange={(e) => {
                                    const newVals = [...attrValues];
                                    newVals[idx] = { ...newVals[idx], value: e.target.value };
                                    setAttrValues(newVals);
                                  }}
                                  placeholder="e.g. Red"
                                  className="w-full rounded border border-darkBg-border/50 bg-darkBg p-1 text-white outline-none text-[11px] focus:border-accent-mint"
                                  required
                                />
                              </td>
                              <td className="p-1 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={val.default_extra_price}
                                  onChange={(e) => {
                                    const newVals = [...attrValues];
                                    newVals[idx] = { ...newVals[idx], default_extra_price: Number(e.target.value) };
                                    setAttrValues(newVals);
                                  }}
                                  className="w-20 rounded border border-darkBg-border/50 bg-darkBg p-1 text-white text-right outline-none text-[11px] focus:border-accent-mint inline-block"
                                  required
                                />
                              </td>
                              <td className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAttrValues(attrValues.filter((_, i) => i !== idx));
                                  }}
                                  className="text-gray-500 hover:text-red-400 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setAttrValues([...attrValues, { id: `v-${Date.now()}-${attrValues.length}`, value: '', default_extra_price: 0.00 }]);
                      }}
                      className="text-[11px] text-accent-mint font-bold hover:underline flex items-center space-x-1"
                    >
                      <span>+ Add a line</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-center py-2 bg-accent-mint hover:bg-accent-mintLight text-darkBg font-bold rounded-lg text-xs"
                  >
                    {selectedAttrId === 'new' ? 'Create Attribute' : 'Save Changes'}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* 3.5 SUBVIEW: RENTAL PERIOD SETTINGS */}
          {productSubmenu === 'Rental Period' && (
            <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass text-xs space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white border-b border-darkBg-border pb-2">Rental Period Defaults</h3>
              <p className="text-gray-400 leading-relaxed">
                Standard configured periodicities in this node: **Hours, Day, Night, Weekly**. Padding limits and pickup timelines can be modified directly on individual catalog items.
              </p>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== TAB 4: REPORT ===================== */}
      {/* ======================================================== */}
      {activeTab === 'Report' && (
        <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-6 animate-fade-in text-xs relative">
          
          {/* Header controls matching Image 1 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-darkBg-border pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-base font-extrabold text-white font-display">📊 Reports</span>
              <button
                type="button"
                onClick={() => {
                  try {
                    const doc = new jsPDF('p','mm','a4');
                    const totalRevenue = orders.reduce((s,o) => s+(o.total||0),0);
                    const lateCount = orders.filter(o=>o.kanbanCategory==='Late').length;
                    doc.setFillColor(6,7,15); doc.rect(0,0,210,297,'F');
                    doc.setTextColor(0,229,176); doc.setFontSize(28); doc.setFont('helvetica','bold'); doc.text('NEORENT',20,35);
                    doc.setTextColor(200,200,200); doc.setFontSize(12); doc.text('Executive Rental Report',20,48);
                    doc.setTextColor(120,120,120); doc.setFontSize(9); doc.text(`Generated: ${new Date().toLocaleDateString()}`,20,57);
                    doc.setDrawColor(0,229,176); doc.line(20,63,190,63);
                    doc.setTextColor(200,200,200); doc.setFontSize(10); doc.setFont('helvetica','bold');
                    doc.text('SUMMARY METRICS',20,75);
                    doc.setFont('helvetica','normal'); doc.setFontSize(9);
                    doc.text(`Total Orders: ${orders.length}`,20,85); doc.text(`Late Orders: ${lateCount}`,20,93);
                    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`,20,101); doc.text(`Invoices: ${invoices.length}`,20,109);
                    doc.setDrawColor(28,36,56); doc.line(20,116,190,116);
                    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(0,229,176);
                    doc.text('ORDER ID',20,126); doc.text('CUSTOMER',60,126); doc.text('STATUS',130,126); doc.text('TOTAL',170,126);
                    doc.setFont('helvetica','normal'); doc.setTextColor(180,180,180);
                    orders.slice(0,18).forEach((o,i)=>{
                      const y=134+i*8;
                      doc.text(o.orderId||'—',20,y); doc.text((o.customerName||'').slice(0,22),60,y);
                      doc.text(o.kanbanCategory||'—',130,y); doc.text(`$${Number(o.total||0).toFixed(0)}`,170,y);
                    });
                    doc.save('NeoRent_Executive_Report.pdf');
                    triggerNotification('📄 Executive PDF downloaded!','success');
                  } catch(e){ triggerNotification('PDF generation failed','error'); }
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent-violet to-accent-violetDark text-white text-xs font-extrabold uppercase shadow-glow-violet hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export PDF</span>
              </button>
              
              {/* Settings Gear Popover Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  className="p-1 px-2 border border-darkBg-border bg-darkBg rounded text-gray-400 hover:text-white transition-colors"
                  title="Report options"
                >
                  ⚙️
                </button>
                {showReportMenu && (
                  <div className="absolute left-0 mt-1 w-32 rounded-md bg-darkBg border border-darkBg-border shadow-lg z-50 overflow-hidden text-[10px] uppercase font-bold text-gray-300">
                    <button
                      type="button"
                      onClick={() => {
                        triggerNotification('Generating PDF report layout...', 'success');
                        setShowReportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-darkBg-hover hover:text-white border-b border-darkBg-border/40 flex justify-between items-center"
                    >
                      <span>Print</span>
                      <span className="text-[8px] text-gray-500 font-normal">→ PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerNotification('Opening file import wizard...', 'info');
                        setShowReportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-darkBg-hover hover:text-white border-b border-darkBg-border/40"
                    >
                      Import
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerNotification('Exporting reports to excel_csv_bundle.zip...', 'success');
                        setShowReportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-darkBg-hover hover:text-white flex justify-between items-center"
                    >
                      <span>Export</span>
                      <span className="text-[8px] text-gray-500 font-normal">→ Excel & csv</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Criteria analysis button */}
              <button
                type="button"
                onClick={() => {
                  const options = ['Total Sales', 'Late Fees Penalty', 'Average Duration'];
                  const curIdx = options.indexOf(criteriaAnalysis);
                  const nextOpt = options[(curIdx + 1) % options.length];
                  setCriteriaAnalysis(nextOpt);
                  triggerNotification(`Analysis criteria set to: ${nextOpt}`, 'info');
                }}
                className="px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 font-bold text-[10px] uppercase flex items-center space-x-1 hover:bg-purple-900/60"
              >
                <span>Criteria for analysis 💜</span>
              </button>

              {/* Insert sheet button */}
              <button
                type="button"
                onClick={() => triggerNotification('New sheet dashboard view inserted.', 'success')}
                className="px-3 py-1.5 rounded bg-gray-700/50 border border-gray-600/30 text-gray-300 font-bold text-[10px] uppercase hover:bg-gray-700"
              >
                Insert a sheet
              </button>
            </div>

            {/* Display Switchers icons */}
            <div className="flex items-center space-x-1.5 bg-darkBg border border-darkBg-border p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`p-1.5 px-2 rounded text-[10px] font-bold ${chartType === 'bar' ? 'bg-accent-mint text-darkBg' : 'text-gray-400 hover:text-white'}`}
                title="Bar Chart view"
              >
                📊 Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType('pie')}
                className={`p-1.5 px-2 rounded text-[10px] font-bold ${chartType === 'pie' ? 'bg-accent-mint text-darkBg' : 'text-gray-400 hover:text-white'}`}
                title="Pie Chart view"
              >
                ⚪ Pie
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`p-1.5 px-2 rounded text-[10px] font-bold ${chartType === 'line' ? 'bg-accent-mint text-darkBg' : 'text-gray-400 hover:text-white'}`}
                title="Line Chart view"
              >
                📈 Line
              </button>
            </div>

          </div>

          {/* Role Check explanation tag matching Image 1 */}
          <div className="p-3 bg-darkBg/50 border border-darkBg-border rounded-lg text-gray-500 text-[10px] leading-relaxed max-w-lg">
            * Reporting for Admin and individual vendors should be different.
            <span className="block mt-1 font-bold text-gray-400">
              Active Context: {userRole === 'ADMIN' ? 'Aggregated Platform Metrics (Admin View)' : `Vendor Profile: ${userCompany} (Vendor View)`}
            </span>
          </div>

          {/* Simulated chart section based on type */}
          <div className="space-y-6 pt-2">
            <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">
              {criteriaAnalysis} performance distribution (Jan 2026)
            </h4>
            
            <div className="bg-darkBg/20 border border-darkBg-border p-6 rounded-xl flex items-center justify-center min-h-[280px]">
              
              {chartType === 'bar' && (
                <div className="w-full max-w-xl mx-auto space-y-4 animate-fade-in">
                  <div className="h-48 flex items-end justify-around border-b border-l border-darkBg-border/50 p-4">
                    {userRole === 'ADMIN' ? (
                      <>
                        <div className="w-8 bg-accent-mint rounded-t animate-pulse-glow" style={{ height: '75%' }} title="Computers: $400,000"></div>
                        <div className="w-8 bg-accent-mint/60 rounded-t" style={{ height: '35%' }} title="Sofa: $240"></div>
                        <div className="w-8 bg-accent-mint/90 rounded-t" style={{ height: '55%' }} title="Monitor: $325"></div>
                        <div className="w-8 bg-accent-mint/55 rounded-t" style={{ height: '20%' }} title="Chair: $90"></div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '0%' }} title="Others: $0"></div>
                        <div className="w-8 bg-purple-500 rounded-t animate-pulse-glow" style={{ height: '80%' }} title="Sofa (Your ComfortMax Sofa): $240"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '0%' }} title="Others: $0"></div>
                        <div className="w-8 bg-purple-500 rounded-t" style={{ height: '0%' }} title="Others: $0"></div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-around text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>S00001</span>
                    <span>S00012 (Sofa)</span>
                    <span>S00020</span>
                    <span>S00010</span>
                  </div>
                </div>
              )}

              {chartType === 'pie' && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in">
                  {/* Conic gradient pie */}
                  <div 
                    className="h-40 w-40 rounded-full border border-darkBg-border shadow-glow-subtle flex items-center justify-center text-[10px] font-extrabold text-white"
                    style={{
                      background: userRole === 'ADMIN'
                        ? 'conic-gradient(#10b981 0% 70%, #10b98190 70% 90%, #6366f1 90% 100%)'
                        : 'conic-gradient(#a855f7 0% 100%)'
                    }}
                  >
                    <div className="h-20 w-20 rounded-full bg-darkBg-card flex items-center justify-center text-center p-1 border border-darkBg-border">
                      {userRole === 'ADMIN' ? 'Platform total' : 'Vendor total'}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-2 text-[10px]">
                    {userRole === 'ADMIN' ? (
                      <>
                        <div className="flex items-center"><span className="h-3 w-3 bg-accent-mint mr-2 rounded-sm"></span> Computers: 70%</div>
                        <div className="flex items-center"><span className="h-3 w-3 bg-accent-mint/60 mr-2 rounded-sm"></span> Monitor: 20%</div>
                        <div className="flex items-center"><span className="h-3 w-3 bg-indigo-500 mr-2 rounded-sm"></span> Sofa & Others: 10%</div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center"><span className="h-3 w-3 bg-purple-500 mr-2 rounded-sm"></span> Sofa (Your Product): 100%</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {chartType === 'line' && (
                <div className="w-full max-w-xl mx-auto animate-fade-in">
                  {/* simulated line chart using SVG */}
                  <svg viewBox="0 0 500 200" className="w-full h-48 stroke-current text-accent-mint bg-darkBg/10 border border-darkBg-border/50 rounded-lg">
                    {/* Grid lines */}
                    <line x1="50" y1="50" x2="450" y2="50" stroke="#1f2937" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="50" y1="100" x2="450" y2="100" stroke="#1f2937" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="50" y1="150" x2="450" y2="150" stroke="#1f2937" strokeWidth="1" strokeDasharray="5,5" />
                    
                    {/* Graph line */}
                    {userRole === 'ADMIN' ? (
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        points="50,160 150,110 250,130 350,60 450,90"
                        className="animate-pulse-glow"
                      />
                    ) : (
                      <polyline
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        points="50,180 150,180 250,100 350,180 450,180"
                        className="animate-pulse-glow"
                      />
                    )}
                    
                    {/* Graph dots */}
                    <circle cx="350" cy="60" r="5" fill="#ffffff" />
                    <circle cx="250" cy="130" r="4" fill="#10b981" />
                  </svg>
                  
                  <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2.5 px-4">
                    <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ================= TAB: IOT TRACKING ==================== */}
      {/* ======================================================== */}
      {activeTab === 'IoT Tracking' && (
        <div className="space-y-6 animate-fade-in text-xs text-gray-300">
          <div className="flex justify-between items-center bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                Real-Time IoT GPS Telemetry Devices
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Live tracking for high-value rental assets across active leases</p>
            </div>
            <button
              onClick={() => triggerNotification('Telemetry telemetry ping dispatched to 2 active devices.', 'info')}
              className="px-3 py-1.5 bg-accent-mint text-darkBg rounded font-extrabold text-[10px] uppercase shadow-glow-subtle hover:brightness-105"
            >
              Refresh Telemetry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(iotTelemetryList || []).map((dev) => (
              <div key={dev.deviceId} className="rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-3">
                <div className="flex justify-between items-center border-b border-darkBg-border/40 pb-2.5">
                  <span className="font-extrabold text-white text-xs">{dev.deviceName}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[9px] bg-accent-mint/20 text-accent-mint border border-accent-mint/30">
                    {dev.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Device ID</span>
                    <span className="font-mono text-gray-300 font-bold">{dev.deviceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Battery Level</span>
                    <span className="font-bold text-emerald-400">⚡ {dev.battery}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">GPS Coordinates</span>
                    <span className="font-mono text-gray-300">{dev.lat}, {dev.lng}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-bold">Last Ping</span>
                    <span className="text-gray-400">{new Date(dev.lastPing).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="bg-darkBg/60 border border-darkBg-border/40 p-2.5 rounded text-[10px] text-gray-400 font-mono flex items-center justify-between">
                  <span>📍 Geo-Fence: San Francisco Region</span>
                  <span className="text-accent-mint font-bold">SIGNAL STABLE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ================== TAB: AUDIT TRAIL ==================== */}
      {/* ======================================================== */}
      {activeTab === 'Audit Trail' && (
        <div className="space-y-6 animate-fade-in text-xs text-gray-300">
          <div className="flex justify-between items-center bg-darkBg-card/50 border border-darkBg-border p-4 rounded-xl glass">
            <div>
              <h3 className="text-sm font-extrabold text-white">Enterprise System Audit Logs</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Immutable audit trail of administrator and system actions</p>
            </div>
            <button
              onClick={() => logAuditAction('MANUAL_AUDIT_EXPORT', 'Exported system audit logs snapshot')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-extrabold text-[10px] uppercase transition-colors"
            >
              Log Snapshot
            </button>
          </div>

          <div className="rounded-xl border border-darkBg-border bg-darkBg-card overflow-hidden glass">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBg-border bg-darkBg/80 text-gray-400 uppercase text-[10px] font-bold">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBg-border/30">
                {(auditLogs || []).map((log) => (
                  <tr key={log.id} className="hover:bg-darkBg-hover/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-accent-mint text-[11px]">{log.id}</td>
                    <td className="p-3 text-gray-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-white uppercase text-[10px]">{log.action}</td>
                    <td className="p-3 font-semibold text-gray-300">{log.user}</td>
                    <td className="p-3 text-gray-400 italic text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ==================== TAB 5: SETTINGS =================== */}
      {/* ======================================================== */}
      {activeTab === 'Settings' && (
        <div className="space-y-6">
          
          {/* 3.1 SUBVIEW: SETTING (Excalidraw Image 4) */}
          {configSubmenu === 'Setting' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs text-gray-300">
              
              {/* Pickup & Return Block */}
              <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
                <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2">Pickup & Return</h4>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="flex items-center space-x-3 cursor-pointer group text-xs text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={pickupLateFeeChecked}
                        onChange={(e) => setPickupLateFeeChecked(e.target.checked)}
                        className="rounded border-darkBg-border bg-darkBg text-accent-mint h-4 w-4"
                      />
                      <div>
                        <span className="font-bold block">Late Fee/Overdue Penalty</span>
                        <span className="text-[10px] text-gray-500">Manage your late fee or overdue charges</span>
                      </div>
                    </label>
                  </div>

                  {pickupLateFeeChecked && (
                    <div className="space-y-2 animate-slide-up pt-1 border-t border-darkBg-border/20">
                      <div className="flex items-center space-x-2 text-xs">
                        <span>Late Fees</span>
                        <span className="text-gray-400 font-extrabold">$</span>
                        <input
                          type="number"
                          value={lateFeePerHour}
                          onChange={(e) => setLateFeePerHour(Number(e.target.value))}
                          className="w-20 rounded border border-darkBg-border bg-darkBg p-1 text-white text-center outline-none focus:border-accent-mint font-bold text-xs"
                        />
                        <span>per hour late</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed italic">
                        * whatever is mentioned here will be applied on all the products by default
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Configurations Block */}
              <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
                <h4 className="font-bold text-white uppercase border-b border-darkBg-border/40 pb-2">Product</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Variants Configuration */}
                  <div className="space-y-3.5">
                    <label className="flex items-center space-x-3 cursor-pointer group text-xs text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={productWarrantyChecked}
                        onChange={(e) => setProductWarrantyChecked(e.target.checked)}
                        className="rounded border-darkBg-border bg-darkBg text-accent-mint h-4 w-4"
                      />
                      <span className="font-bold">Variants</span>
                    </label>

                    {productWarrantyChecked && (
                      <div className="space-y-1.5 animate-slide-up pt-1 border-t border-darkBg-border/20 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleTabChange('Product');
                            setProductSubmenu('Attributes');
                            triggerNotification('Redirected to Attributes configuration page', 'info');
                          }}
                          className="text-accent-mint hover:underline font-bold text-xs flex items-center space-x-1"
                        >
                          <span>&rarr; Attributes</span>
                        </button>
                        <p className="text-[9px] text-gray-500 leading-relaxed">
                          * enable this option once the above checkbox is check marked and one user click on the Attributes redirect to the attributes page
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Price List Configuration */}
                  <div className="space-y-3.5">
                    <label className="flex items-center space-x-3 cursor-pointer group text-xs text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={priceListChecked}
                        onChange={(e) => setPriceListChecked(e.target.checked)}
                        className="rounded border-darkBg-border bg-darkBg text-accent-mint h-4 w-4"
                      />
                      <span className="font-bold">Price List</span>
                    </label>

                    {priceListChecked && (
                      <div className="space-y-1.5 animate-slide-up pt-1 border-t border-darkBg-border/20 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleTabChange('Product');
                            setProductSubmenu('Price list');
                            triggerNotification('Redirected to Price list configuration page', 'info');
                          }}
                          className="text-accent-mint hover:underline font-bold text-xs flex items-center space-x-1"
                        >
                          <span>&rarr; Pricelists</span>
                        </button>
                        <p className="text-[9px] text-gray-500 leading-relaxed">
                          * Keep the same for the Price list
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* 3.2 SUBVIEW: USER (Excalidraw Image 2) */}
          {configSubmenu === 'User' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-xs text-gray-300">
              
              {/* Main settings form */}
              <form onSubmit={handleSaveUserProfile} className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-6">
                
                <div className="flex justify-between items-center border-b border-darkBg-border pb-3">
                  <h3 className="text-sm font-bold text-white uppercase">User profile settings</h3>
                  <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-1.5 bg-accent-mint text-darkBg rounded font-bold hover:brightness-105 transition-all">
                      Save
                    </button>
                    <button type="button" onClick={() => triggerNotification('Discarded profile changes.', 'info')} className="px-4 py-1.5 border border-darkBg-border rounded text-gray-400 hover:text-white hover:bg-darkBg transition-all">
                      Discard
                    </button>
                  </div>
                </div>

                {/* Grid layout matching Image 2 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: Personal info (5/12 width) */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Email</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Phone</label>
                      <input
                        type="text"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Company name</label>
                      <input
                        type="text"
                        value={userCompany}
                        onChange={(e) => setUserCompany(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Middle Column: Business & Logo info (4/12 width) */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Company Logo</label>
                        <button
                          type="button"
                          onClick={() => triggerNotification('Trigger logo upload file dialogue...', 'info')}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-[10px] uppercase transition-colors"
                        >
                          Upload
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">GST IN</label>
                      <input
                        type="text"
                        value={userGst}
                        onChange={(e) => setUserGst(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Address</label>
                      <textarea
                        rows="3"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: User Avatar card with edit/delete icons (3/12 width) */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center">
                    <div className="w-36 h-36 rounded-lg bg-darkBg border border-darkBg-border p-3 flex flex-col justify-between items-center relative group">
                      {/* Avatar initials / placeholder */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 mt-2">
                        <div className="h-14 w-14 rounded-full bg-accent-mint/10 border border-accent-mint/30 flex items-center justify-center text-accent-mint text-lg font-extrabold shadow-glow-subtle">
                          {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold text-white block mt-1">User</span>
                      </div>
                      
                      {/* Edit and Delete icon overlays */}
                      <div className="w-full flex justify-around border-t border-darkBg-border/40 pt-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => triggerNotification('Change profile avatar picture...', 'info')}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Edit Avatar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerNotification('Delete profile avatar picture...', 'info')}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Avatar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Sub tabs inside User settings */}
                <div className="flex border-b border-darkBg-border gap-4 pb-1 pt-4">
                  {['Work Information', 'Security'].map((utab) => (
                    <button
                      key={utab}
                      type="button"
                      onClick={() => setUserTab(utab)}
                      className={`pb-1 text-xs font-bold uppercase transition-all border-b-2 ${
                        userTab === utab ? 'border-accent-mint text-accent-mint' : 'border-transparent text-gray-500'
                      }`}
                    >
                      {utab}
                    </button>
                  ))}
                </div>

                {/* Work Information tab */}
                {userTab === 'Work Information' && (
                  <div className="space-y-4 animate-fade-in pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase block">Roles</label>
                      <div className="flex space-x-6 text-gray-300 font-bold">
                        {['ADMIN', 'VENDOR', 'CUSTOMER'].map((role) => (
                          <label key={role} className="flex items-center space-x-2 cursor-pointer capitalize">
                            <input
                              type="radio"
                              name="user_role"
                              value={role}
                              checked={userRole === role}
                              onChange={() => setUserRole(role)}
                              className="text-accent-mint focus:ring-0"
                            />
                            <span>{role.toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-darkBg/30 border border-darkBg-border rounded text-[10px] text-gray-500 max-w-md leading-relaxed">
                      * Standard work hierarchy constraints apply. Vendor role is tied to catalog submissions, customer role is limited to storefront access.
                    </div>
                  </div>
                )}

                {/* Security Password tab */}
                {userTab === 'Security' && (
                  <div className="space-y-4 animate-fade-in pt-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-[11px] font-bold text-gray-300">Change Password:</span>
                      <button
                        type="button"
                        onClick={() => triggerNotification('Change password instruction link dispatched!', 'success')}
                        className="rounded bg-purple-600 hover:bg-purple-500 px-4 py-1.5 font-bold text-white text-[11px] uppercase transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                    
                    <div className="p-3 bg-darkBg/50 border border-darkBg-border rounded text-[10px] text-gray-500 max-w-md leading-relaxed">
                      * Note: Settings should only be visible to Admin user. For all the remaining users this user information page should only be visible under profile section.
                    </div>
                  </div>
                )}

              </form>

            </div>
          )}

          {/* 3.3 SUBVIEW: QUOTATION TEMPLATES (Excalidraw Image 1 & 4) */}
          {configSubmenu === 'Quotation Templates' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-xs">
              
              {/* Left templates list */}
              <div className="lg:col-span-4 rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-4">
                <div className="flex justify-between items-center border-b border-darkBg-border/40 pb-2">
                  <h4 className="font-bold text-white uppercase text-[11px]">Quotation Template</h4>
                  <button
                    type="button"
                    onClick={() => triggerNotification('Add new quotation template...', 'info')}
                    className="px-2.5 py-1 bg-accent-mint text-darkBg rounded font-extrabold text-[10px]"
                  >
                    New
                  </button>
                </div>
                
                {/* Search box */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full rounded border border-darkBg-border bg-darkBg p-2 pl-7 text-[11px] text-white outline-none focus:border-accent-mint"
                  />
                  <span className="absolute left-2.5 top-2.5 text-gray-500 text-xs">🔍</span>
                </div>

                <div className="space-y-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTempId(t.id);
                        setTempNameInput(t.name);
                        setTempValidityInput(t.validity_days);
                        setTempTermsInput(t.payment_terms_percentage);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedTempId === t.id 
                          ? 'border-accent-mint bg-accent-mint/5 text-accent-mint font-bold' 
                          : 'border-darkBg-border hover:border-gray-500 text-gray-300 hover:text-white'
                      }`}
                    >
                      <p className="text-[11px] font-bold">{t.name}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Validity: {t.validity_days} Days • Payment: {t.payment_terms_percentage}%</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Edit templates form */}
              <div className="lg:col-span-8 rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4 relative">
                
                <div className="flex justify-between items-center border-b border-darkBg-border pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Quotation Template</span>
                    <h3 className="text-base font-extrabold text-white pb-0.5 border-b-2 border-emerald-500 inline-block min-w-[150px]">
                      {tempNameInput || 'Home Rental Furniture'}
                    </h3>
                  </div>
                  
                  {/* Save Check and Cancel Cross */}
                  <div className="flex items-center space-x-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        updateTemplate(selectedTempId, {
                          name: tempNameInput,
                          validity_days: Number(tempValidityInput),
                          payment_terms_percentage: Number(tempTermsInput)
                        });
                        triggerNotification('Template changes successfully saved!', 'success');
                      }}
                      className="p-1 px-2.5 bg-emerald-500 text-white rounded font-bold text-[10px] flex items-center space-x-1 hover:bg-emerald-600 transition-colors"
                      title="Save Template"
                    >
                      <span>✓</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        triggerNotification('Changes reverted.', 'info');
                      }}
                      className="p-1 px-2.5 border border-red-500 text-red-500 rounded font-bold text-[10px] flex items-center space-x-1 hover:bg-red-500/10 transition-colors"
                      title="Discard Changes"
                    >
                      <span>✕</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Left panel: Name */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Template</h4>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Name</label>
                      <input
                        type="text"
                        value={tempNameInput}
                        onChange={(e) => setTempNameInput(e.target.value)}
                        className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Right panel: Confirmation */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Confirmation</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold uppercase">Quotation Validity</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            value={tempValidityInput}
                            onChange={(e) => setTempValidityInput(e.target.value)}
                            className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                          />
                          <span className="text-gray-400 text-[10px] font-bold">Days</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-bold uppercase">Payment Teams</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            value={tempTermsInput}
                            onChange={(e) => setTempTermsInput(e.target.value)}
                            className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                          />
                          <span className="text-gray-400 text-[10px] font-bold">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lines tab grid */}
                <div className="space-y-2 pt-4 border-t border-darkBg-border/40">
                  <div className="flex border-b border-darkBg-border gap-4 pb-1">
                    <button type="button" className="text-xs font-bold text-accent-mint pb-1.5 border-b-2 border-accent-mint">Lines</button>
                    <button type="button" className="text-xs font-bold text-gray-500 pb-1.5 hover:text-gray-300 transition-colors">Quote Builder</button>
                  </div>

                  <div className="rounded border border-darkBg-border overflow-hidden bg-darkBg/30 mt-2">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                          <th className="p-3">Product</th>
                          <th className="p-3">Quntity</th>
                          <th className="p-3">Unit</th>
                          <th className="p-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templates.find(t => t.id === selectedTempId)?.lines.map((line, idx) => (
                          <tr key={idx} className="text-gray-300 border-b border-darkBg-border/10 hover:bg-darkBg-hover/10 transition-colors">
                            <td className="p-3 font-semibold text-white">{line.product}</td>
                            <td className="p-3">{line.quantity}</td>
                            <td className="p-3 text-gray-400">{line.unit}</td>
                            <td className="p-3 text-right">
                              <button 
                                type="button" 
                                onClick={() => triggerNotification('Add/Delete line logs updated.', 'info')} 
                                className="text-gray-500 hover:text-red-400 inline-block align-middle mr-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerNotification('Add line item clicked.', 'info')}
                    className="text-xs text-accent-mint font-bold hover:underline"
                  >
                    + Add a line
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* 3.4 SUBVIEW: HEADER/FOOTER */}
          {configSubmenu === 'Header/Footer' && (
            <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass text-xs space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white border-b border-darkBg-border pb-2">Document Layout Header/Footer</h3>
              <p className="text-gray-400 leading-relaxed">
                Configure corporate headers and standard footers appearing on invoice prints.
              </p>
            </div>
          )}

        </div>
      )}

      {/* TAB: IOT TRACKING & GEOFENCING MAP */}
      {activeTab === 'IoT Tracking' && (
        <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass text-xs space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-darkBg-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">🛰️ Real-Time IoT Asset Telemetry &amp; Geofencing Tracker</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Mock high-frequency GPS ping coordinates &amp; hardware battery levels.</p>
            </div>
            <button
              onClick={() => triggerNotification('Pinging hardware GPS devices...', 'info')}
              className="px-3 py-1.5 rounded bg-accent-mint text-darkBg font-bold text-xs"
            >
              Refresh Pings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {iotTelemetryList.map(dev => (
              <div key={dev.deviceId} className="p-4 bg-darkBg border border-darkBg-border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm">{dev.deviceName}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">{dev.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-400 text-[11px] pt-2 border-t border-darkBg-border/40">
                  <p>Device ID: <span className="text-gray-200 font-mono">{dev.deviceId}</span></p>
                  <p>Battery: <span className="text-accent-mint font-bold">{dev.battery}%</span></p>
                  <p>Lat / Lng: <span className="text-gray-200 font-mono">{dev.lat}, {dev.lng}</span></p>
                  <p>Last Ping: <span className="text-gray-200">{new Date(dev.lastPing).toLocaleTimeString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ENTERPRISE AUDIT TRAIL LOGS */}
      {activeTab === 'Audit Trail' && (
        <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass text-xs space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-darkBg-border pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">📜 System Enterprise Audit Logs</h3>
            <span className="text-[10px] text-accent-mint font-bold">({auditLogs.length} Records)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBg-border/20 text-gray-300">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-darkBg-hover/20 transition-colors">
                    <td className="p-3 text-[10px] font-mono text-gray-400">{log.timestamp}</td>
                    <td className="p-3 font-bold text-accent-mint">{log.action}</td>
                    <td className="p-3 font-semibold text-white">{log.user}</td>
                    <td className="p-3 text-gray-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voice Command Panel */}
      <VoiceCommandPanel
        triggerNotification={triggerNotification}
        onCommand={(heard) => {
          if (heard.includes('late') || heard.includes('overdue')) {
            setActiveFilterPill('Late');
            triggerNotification('🎙️ Filtered: Late orders', 'success');
          } else if (heard.includes('pickup')) {
            setActiveFilterPill('Pickup');
            triggerNotification('🎙️ Filtered: Pickup orders', 'success');
          } else if (heard.includes('all') || heard.includes('reset')) {
            setActiveFilterPill('All');
            triggerNotification('🎙️ Filter cleared', 'info');
          } else if (heard.includes('product')) {
            handleTabChange('Product');
            triggerNotification('🎙️ Switched to Products', 'info');
          } else if (heard.includes('report') || heard.includes('revenue')) {
            handleTabChange('Report');
            triggerNotification('🎙️ Switched to Reports', 'info');
          } else if (heard.includes('setting')) {
            handleTabChange('Settings');
            triggerNotification('🎙️ Switched to Settings', 'info');
          }
        }}
      />

    </div>
  );
}
