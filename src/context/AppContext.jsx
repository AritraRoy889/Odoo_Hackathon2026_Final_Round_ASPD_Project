import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Helper for initial catalog products mapped from Django schemas and Excalidraw details
const INITIAL_PRODUCTS = [
  {
    id: 'prod-10',
    name: 'Computers',
    brand: 'SysMax',
    colors: ['black', 'silver'],
    price: { hour: 50, day: 200, month: 2000 },
    category: 'Electronics',
    image: '/images/ultrawide_monitor.jpg',
    product_type: 'GOODS', // GOODS, SERVICE
    stock_quantity: 100.00,
    sales_price: 20000.00, // Matching invoice screenshots (Rs 20,000)
    cost_price: 15000.00,
    security_deposit: 5000.00,
    periodicity: 'DAY', // HOURS, DAY, NIGHT, WEEKLY
    is_published: true,
    hasVariants: true,
    specs: {
      color: ['Carbon Black', 'Steel Silver'],
      ram: ['16GB RAM', '32GB RAM (+ $100)']
    }
  },
  {
    id: 'prod-1',
    name: 'AetherWave 34" Curved Monitor',
    brand: 'AetherWave',
    colors: ['black', 'silver'],
    price: { hour: 5, day: 25, month: 450 },
    category: 'Electronics',
    image: '/images/ultrawide_monitor.jpg',
    product_type: 'GOODS',
    stock_quantity: 5.00,
    sales_price: 600.00,
    cost_price: 450.00,
    security_deposit: 150.00,
    periodicity: 'DAY',
    is_published: true,
    hasVariants: true,
    specs: {
      color: ['Carbon Black', 'Starlight Silver'],
      size: ['34-Inch UltraWide', '38-Inch Cinematic (+ $10/day)']
    }
  },
  {
    id: 'prod-2',
    name: 'LuxeForm Ergonomic Chair',
    brand: 'LuxeForm',
    colors: ['black', 'brown'],
    price: { hour: 3, day: 15, month: 250 },
    category: 'Furniture',
    image: '/images/ergonomic_chair.jpg',
    product_type: 'GOODS',
    stock_quantity: 8.00,
    sales_price: 300.00,
    cost_price: 180.00,
    security_deposit: 75.00,
    periodicity: 'DAY',
    is_published: true,
    hasVariants: true,
    specs: {
      color: ['Obsidian Black', 'Cognac Leather']
    }
  },
  {
    id: 'prod-4',
    name: 'ComfortMax Modular Sofa',
    brand: 'ComfortMax',
    colors: ['grey', 'navy'],
    price: { hour: 8, day: 40, month: 700 },
    category: 'Furniture',
    image: '/images/lounge_sofa.jpg',
    product_type: 'GOODS',
    stock_quantity: 3.00,
    sales_price: 1200.00,
    cost_price: 800.00,
    security_deposit: 300.00,
    periodicity: 'DAY',
    is_published: true,
    hasVariants: true,
    specs: {
      color: ['Charcoal Grey', 'Deep Navy']
    }
  }
];

// Initial dynamic attributes (Excalidraw Image 1)
const INITIAL_ATTRIBUTES = [
  {
    id: 'attr-1',
    name: 'Brand',
    display_type: 'RADIO', // RADIO, PILLS, CHECKBOX, IMAGE
    values: [
      { id: 'v-1', value: 'AetherWave', default_extra_price: 0.00 },
      { id: 'v-2', value: 'LuxeForm', default_extra_price: 0.00 },
      { id: 'v-3', value: 'Optix', default_extra_price: 0.00 },
      { id: 'v-4', value: 'ComfortMax', default_extra_price: 0.00 }
    ]
  },
  {
    id: 'attr-2',
    name: 'Color',
    display_type: 'PILLS',
    values: [
      { id: 'v-5', value: 'Red', default_extra_price: 0.00 },
      { id: 'v-6', value: 'Green', default_extra_price: 0.00 },
      { id: 'v-7', value: 'Blue', default_extra_price: 0.00 },
      { id: 'v-8', value: 'Black', default_extra_price: 0.00 },
      { id: 'v-9', value: 'White', default_extra_price: 0.00 }
    ]
  }
];

// Initial pricelist rules (Excalidraw Image 2 & 3)
const INITIAL_PRICELISTS = [
  {
    id: 'pl-1',
    name: 'My Price list',
    rules: [
      {
        id: 'plr-1',
        product: 'All Products',
        price_type: 'DISCOUNT', // DISCOUNT, FIXED
        fixed_price: 0.00,
        discount_percentage: 10.00,
        min_qty: 0.00,
        validity_start: '',
        validity_end: '',
        selectable: true
      }
    ]
  }
];

// Initial quotation templates (Excalidraw Image 8)
const INITIAL_TEMPLATES = [
  {
    id: 'qt-1',
    name: 'Home Rental Furniture',
    validity_days: 30,
    payment_terms_percentage: 50.00,
    lines: [
      { id: 'tl-1', product: 'ComfortMax Modular Sofa', quantity: 1, unit: 'Units' }
    ]
  },
  {
    id: 'qt-2',
    name: 'Office Rental Furniture',
    validity_days: 15,
    payment_terms_percentage: 100.00,
    lines: [
      { id: 'tl-2', product: 'LuxeForm Ergonomic Chair', quantity: 4, unit: 'Units' }
    ]
  }
];

// Rental scheduler calendar events mapped exactly from Excalidraw Image 4 & 5
const INITIAL_SCHEDULE_EVENTS = {
  // Key format: YYYY-MM-DD
  '2026-01-04': [
    { id: 'sch-1', orderRef: 'S00001', product: 'Projector', variant: 'Smith Black', quantity: 1, status: 'Available', type: 'Pickup' },
    { id: 'sch-2', orderRef: 'S00005', product: 'Printer', variant: 'John Dow', quantity: 1, status: 'Available', type: 'Booked' },
    { id: 'sch-3', orderRef: 'S00012', product: 'Monitor', variant: 'Sam', quantity: 1, status: 'Available', type: 'Pickup' }
  ],
  '2026-01-05': [
    { id: 'sch-4', orderRef: 'S00001', product: 'Projector', variant: 'Smith Black', quantity: 1, status: 'Available', type: 'Pickup' },
    { id: 'sch-5', orderRef: 'S00013', product: 'Laptop', variant: 'Mack', quantity: 2, status: 'Booked', type: 'Booked' },
    { id: 'sch-6', orderRef: 'S00014', product: 'Monitor', variant: 'Sam', quantity: 1, status: 'Available', type: 'Pickup' }
  ],
  '2026-01-06': [
    { id: 'sch-7', orderRef: 'S00001', product: 'Projector', variant: 'Smith Black', quantity: 1, status: 'Available', type: 'Pickup' },
    { id: 'sch-8', orderRef: 'S00003', product: 'Printer', variant: 'John Dow', quantity: 1, status: 'Available', type: 'Pickup' },
    { id: 'sch-9', orderRef: 'S00013', product: 'Laptop', variant: 'Mack', quantity: 2, status: 'Booked', type: 'Booked' },
    { id: 'sch-10', orderRef: 'S00014', product: 'Monitor', variant: 'Sam', quantity: 1, status: 'Available', type: 'Pickup' }
  ],
  '2026-01-07': [
    { id: 'sch-11', orderRef: 'S00012', product: 'Monitor', variant: 'Sam', quantity: 1, status: 'Available', type: 'Late Pickup' }
  ],
  '2026-01-14': [
    { id: 'sch-12', orderRef: 'S00020', product: 'Projector', variant: 'Smith White', quantity: 1, status: 'Available', type: 'Pickup' },
    { id: 'sch-13', orderRef: 'S00021', product: 'Laptop', variant: 'Mack Book', quantity: 1, status: 'Late', type: 'Late Delivery' }
  ],
  '2026-01-21': [
    { id: 'sch-14', orderRef: 'S00030', product: 'Printer', variant: 'John Dow', quantity: 1, status: 'Available', type: 'Late Delivery' }
  ]
};

// Initial orders matching the list/kanban view list in Excalidraw Image 12 & 13
const INITIAL_ORDERS = [
  {
    orderId: 'S00001',
    customerName: 'Mark Wood',
    customerEmail: 'mark.w@example.com',
    customerPhone: '+1 (555) 019-3221',
    date: '2026-01-04',
    items: [
      {
        id: 'prod-10',
        name: 'Computers',
        quantity: 20,
        variantDetails: { color: 'Carbon Black' },
        rentalPeriod: { start: '2026-01-04', end: '2026-01-12' },
        rentalDuration: 8,
        priceRate: 20000.00,
        totalCost: 400000.00
      }
    ],
    subtotal: 400000.00,
    deliveryOption: 'shipping',
    deliveryCharge: 0.00,
    discount: 0.00,
    total: 400000.00,
    status: 'SALE_ORDER', // QUOTATION, QUOTATION_SENT, SALE_ORDER
    kanbanCategory: 'Return', // TODAY, PICKUP, RETURN, LATE (logistics_status)
    pickupDate: 'Jan 6, 6:30pm',
    returnDate: 'Jan 10, 6:30pm',
    invoiceStatus: 'Invoiced',
    gstIn: '27VENDORGSTIN'
  },
  {
    orderId: 'S00005',
    customerName: 'Smith',
    customerEmail: 'smith@example.com',
    customerPhone: '+1 (555) 012-7889',
    date: '2026-01-03',
    items: [
      {
        id: 'prod-1',
        name: 'AetherWave 34" Curved Monitor',
        quantity: 1,
        variantDetails: { color: 'Starlight Silver' },
        rentalPeriod: { start: '2026-01-04', end: '2026-01-08' },
        rentalDuration: 4,
        priceRate: 25.00,
        totalCost: 100.00
      }
    ],
    subtotal: 100.00,
    deliveryOption: 'pickup',
    deliveryCharge: 0.00,
    discount: 10.00, // 10% discount applied
    total: 90.00,
    status: 'QUOTATION_SENT',
    kanbanCategory: 'Pickup',
    pickupDate: 'Jul 12, 6:30pm',
    returnDate: 'Jul 15, 6:30pm',
    invoiceStatus: 'Quotation Sent',
    gstIn: ''
  },
  {
    orderId: 'S00010',
    customerName: 'John',
    customerEmail: 'john@example.com',
    customerPhone: '+1 (555) 014-9988',
    date: '2026-01-05',
    items: [
      {
        id: 'prod-2',
        name: 'LuxeForm Ergonomic Chair',
        quantity: 2,
        variantDetails: { color: 'Cognac Leather' },
        rentalPeriod: { start: '2026-01-06', end: '2026-01-09' },
        rentalDuration: 3,
        priceRate: 15.00,
        totalCost: 90.00
      }
    ],
    subtotal: 90.00,
    deliveryOption: 'shipping',
    deliveryCharge: 30.00,
    discount: 0.00,
    total: 120.00,
    status: 'SALE_ORDER',
    kanbanCategory: 'Return',
    pickupDate: 'Jan 6, 6:30pm',
    returnDate: 'Jan 10, 6:30pm',
    invoiceStatus: 'Invoiced',
    gstIn: ''
  },
  {
    orderId: 'S00012',
    customerName: 'Alex',
    customerEmail: 'alex@example.com',
    customerPhone: '+1 (555) 011-3004',
    date: '2026-01-04',
    items: [
      {
        id: 'prod-4',
        name: 'ComfortMax Modular Sofa',
        quantity: 1,
        variantDetails: { color: 'Deep Navy' },
        rentalPeriod: { start: '2026-01-05', end: '2026-01-11' },
        rentalDuration: 6,
        priceRate: 40.00,
        totalCost: 240.00
      }
    ],
    subtotal: 240.00,
    deliveryOption: 'shipping',
    deliveryCharge: 15.00,
    discount: 60.00, // coupon 25% applied
    total: 195.00,
    status: 'QUOTATION',
    kanbanCategory: 'Today',
    pickupDate: 'Jan 5, 9:00am',
    returnDate: 'Jan 11, 9:00am',
    invoiceStatus: 'Nothing to Invoice',
    gstIn: ''
  },
  {
    orderId: 'S00020',
    customerName: 'Sam',
    customerEmail: 'sam@example.com',
    customerPhone: '+1 (555) 018-7766',
    date: '2025-12-28',
    items: [
      {
        id: 'prod-1',
        name: 'AetherWave 34" Curved Monitor',
        quantity: 1,
        variantDetails: { color: 'Carbon Black' },
        rentalPeriod: { start: '2026-01-02', end: '2026-01-15' },
        rentalDuration: 13,
        priceRate: 25.00,
        totalCost: 325.00
      }
    ],
    subtotal: 325.00,
    deliveryOption: 'shipping',
    deliveryCharge: 15.00,
    discount: 0.00,
    total: 340.00,
    status: 'SALE_ORDER',
    kanbanCategory: 'Late',
    pickupDate: 'Jan 2, 10:00am',
    returnDate: 'Jan 15, 6:00pm',
    invoiceStatus: 'Invoiced',
    gstIn: ''
  }
];

// Initial invoices linked to the database structures in Image 9 & 10
const INITIAL_INVOICES = [
  {
    invoiceId: 'INV/2026/0001',
    orderId: 'S00001',
    date: '2026-01-04',
    customerName: 'Mark Wood',
    amount: 440000.00, // Matching Image 9 totals (Rs 4,40,000 including taxes)
    status: 'DRAFT', // DRAFT, POSTED
    dueDate: '2026-01-12',
    tax_percentage: 10.00,
    untaxed_amount: 400000.00,
    taxes: 40000.00,
    invoice_address: 'Computers HQ, West Gables',
    delivery_address: 'Mark Wood Garage, SF',
    delivery_method: 'Standard Delivery'
  },
  {
    invoiceId: 'INV/2026/0002',
    orderId: 'S00010',
    date: '2026-01-05',
    customerName: 'John',
    amount: 132.00, // 120 + 10% taxes
    status: 'POSTED',
    dueDate: '2026-01-10',
    tax_percentage: 10.00,
    untaxed_amount: 120.00,
    taxes: 12.00,
    invoice_address: 'John Residence Street',
    delivery_address: 'John Residence Street',
    delivery_method: 'Standard Delivery'
  }
];

export const AppProvider = ({ children }) => {
  // Navigation active view routing
  const [currentView, setCurrentView] = useState('storefront');
  
  // Auth account profiles
  const [user, setUser] = useState({
    id: 'usr-admin',
    name: 'Devon Miller (Admin)',
    email: 'admin@apex.com',
    role: 'ADMIN', // ADMIN, VENDOR, CUSTOMER
    companyName: 'Apex Tech Rentals Ltd',
    gstIn: '27ABCDE1234F1Z9',
    late_fee_per_hour: 15.00,
    address: 'HQ coordinates Grid Section #894, SF'
  });

  // Database core state managers
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [attributes, setAttributes] = useState(INITIAL_ATTRIBUTES);
  const [pricelists, setPricelists] = useState(INITIAL_PRICELISTS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [scheduleEvents, setScheduleEvents] = useState(INITIAL_SCHEDULE_EVENTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Storefront controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    brands: [],
    colors: [],
    duration: 'day',
    priceRange: [0, 25000]
  });

  // Schedulers month config
  const [scheduleMonth, setScheduleMonth] = useState('2026-01');

  // Customer Shopping Basket
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Logistics parameters
  const [deliveryOption, setDeliveryOption] = useState('shipping'); // shipping (Standard), pickup (Pickup from Store)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    zipCode: '',
    country: 'United States'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: false
  });

  // General settings tab checkboxes (Image 11)
  const [pickupLateFeeChecked, setPickupLateFeeChecked] = useState(true);
  const [lateFeePerHour, setLateFeePerHour] = useState(15.00);
  const [productWarrantyChecked, setProductWarrantyChecked] = useState(true);
  const [priceListChecked, setPriceListChecked] = useState(true);

  // --- ENTERPRISE & PUBLIC API SUITE STATES ---
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({ EUR: 0.92, GBP: 0.79, INR: 83.50 });
  const [userLocation, setUserLocation] = useState({ city: 'San Francisco', country: 'United States', countryCode: 'US', region: 'CA' });
  const [weatherLogistics, setWeatherLogistics] = useState({ temperature_c: 22.5, logistics_flag: '☀️ Clear & Optimal Delivery Weather' });
  const [iotTelemetryList, setIotTelemetryList] = useState([
    { deviceId: 'IOT-ASSET-001', deviceName: 'AetherWave 34 Monitor #1', lat: 37.7749, lng: -122.4194, battery: 94.0, status: 'ACTIVE_LEASE', lastPing: '2026-08-09T01:50:00Z' },
    { deviceId: 'IOT-ASSET-002', deviceName: 'LuxeForm Ergonomic Chair #4', lat: 37.7833, lng: -122.4167, battery: 88.5, status: 'IN_TRANSIT', lastPing: '2026-08-09T01:52:00Z' }
  ]);
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', timestamp: new Date().toISOString(), action: 'SYSTEM_BOOT', user: 'Admin System', details: 'NeoRent Platform initialized' }
  ]);

  // Notifications helper
  const [notification, setNotification] = useState(null);

  const triggerNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert USD price dynamically to selectedCurrency
  const convertPrice = (usdAmount) => {
    const num = Number(usdAmount) || 0;
    if (selectedCurrency === 'EUR') {
      const val = num * (exchangeRates.EUR || 0.92);
      return { value: val, symbol: '€', formatted: `€${val.toFixed(2)}` };
    } else if (selectedCurrency === 'GBP') {
      const val = num * (exchangeRates.GBP || 0.79);
      return { value: val, symbol: '£', formatted: `£${val.toFixed(2)}` };
    } else if (selectedCurrency === 'INR') {
      const val = num * (exchangeRates.INR || 83.50);
      return { value: val, symbol: '₹', formatted: `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` };
    }
    return { value: num, symbol: '$', formatted: `$${num.toFixed(2)}` };
  };

  // Log audit trail
  const logAuditAction = (action, details) => {
    const payload = { action, details, user: user ? user.name : 'Guest User' };
    fetch('http://127.0.0.1:8000/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.log('Audit log silent save error', err));
    
    setAuditLogs(prev => [{ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), ...payload }, ...prev]);
  };

  // Import External Products from DummyJSON
  const importExternalProducts = () => {
    fetch('http://127.0.0.1:8000/api/external/import-dummyjson')
      .then(res => res.json())
      .then(res => {
        if (res.data?.product_ids) {
          triggerNotification(`Imported ${res.data.imported_count} external tech products!`, 'success');
          // Refresh products
          fetch('http://127.0.0.1:8000/api/products')
            .then(r => r.json())
            .then(data => { if (data && data.length > 0) setProducts(data); });
        }
      })
      .catch(() => triggerNotification('External catalog seeder offline', 'info'));
  };

  // Synchronize state with SQLite3 Database on mount
  useEffect(() => {
    const apiBase = 'http://127.0.0.1:8000/api';
    
    // Fetch Products
    fetch(`${apiBase}/products`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setProducts(data); })
      .catch(err => console.log('Backend sync warning: products offline', err));

    // Fetch Attributes
    fetch(`${apiBase}/attributes`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setAttributes(data); })
      .catch(err => console.log('Backend sync warning: attributes offline', err));

    // Fetch Pricelists
    fetch(`${apiBase}/pricelists`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setPricelists(data); })
      .catch(err => console.log('Backend sync warning: pricelists offline', err));

    // Fetch Templates
    fetch(`${apiBase}/templates`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setTemplates(data); })
      .catch(err => console.log('Backend sync warning: templates offline', err));

    // Fetch Orders
    fetch(`${apiBase}/orders`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setOrders(data); })
      .catch(err => console.log('Backend sync warning: orders offline', err));

    // Fetch Invoices
    fetch(`${apiBase}/invoices`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setInvoices(data); })
      .catch(err => console.log('Backend sync warning: invoices offline', err));

    // Fetch GeoIP
    fetch(`${apiBase}/external/geoip`)
      .then(res => res.json())
      .then(res => { if (res.data?.city) setUserLocation(res.data); })
      .catch(err => console.log('GeoIP fallback active', err));

    // Fetch Exchange Rates
    fetch(`${apiBase}/external/exchange-rates`)
      .then(res => res.json())
      .then(res => { if (res.data) setExchangeRates(res.data); })
      .catch(err => console.log('Exchange rates fallback active', err));

    // Fetch Weather
    fetch(`${apiBase}/external/weather`)
      .then(res => res.json())
      .then(res => { if (res.data?.logistics_flag) setWeatherLogistics(res.data); })
      .catch(err => console.log('Weather fallback active', err));

    // Fetch IoT Telemetry
    fetch(`http://127.0.0.1:8000/api/v1/iot/telemetry`)
      .then(res => res.json())
      .then(res => { if (res.data && res.data.length > 0) setIotTelemetryList(res.data); })
      .catch(err => console.log('IoT telemetry fallback active', err));

    // Fetch Audit Logs
    fetch(`${apiBase}/admin/audit-logs`)
      .then(res => res.json())
      .then(res => { if (res.data && res.data.length > 0) setAuditLogs(res.data); })
      .catch(err => console.log('Audit logs fallback active', err));
  }, []);

  // Helper to post a product to the backend
  const syncProductToBackend = (product) => {
    fetch('http://127.0.0.1:8000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).catch(err => console.error('Failed to sync product to db', err));
  };

  // Helper to post an order to the backend
  const syncOrderToBackend = (order) => {
    const formattedOrder = {
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryMethod: order.deliveryOption === 'pickup' ? 'Store Pickup' : 'Standard Delivery',
      status: order.status,
      totalAmount: order.total || order.totalAmount || 0,
      rentalPeriodStart: order.date || order.rentalPeriodStart || '',
      rentalPeriodEnd: order.returnDate || order.rentalPeriodEnd || '',
      deliveryAddress: order.deliveryAddress || {},
      billingAddress: order.billingAddress || {},
      orderLines: order.items || order.orderLines || [],
      paymentDetails: order.paymentDetails || {},
      invoices: order.invoices || []
    };

    fetch('http://127.0.0.1:8000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedOrder)
    }).catch(err => console.error('Failed to sync order to db', err));
  };

  // Helper to post an invoice to the backend
  const syncInvoiceToBackend = (inv) => {
    const formattedInvoice = {
      invoiceNumber: inv.invoiceId || inv.invoiceNumber,
      orderId: inv.orderId,
      issueDate: inv.date || inv.issueDate,
      invoiceStatus: inv.status || inv.invoiceStatus,
      amountDue: inv.amount || inv.amountDue || 0,
      invoiceLines: inv.invoiceLines || [
        { product: "Rental Product Line", quantity: 1, unitPrice: inv.untaxed_amount, taxPercent: inv.tax_percentage, amount: inv.amount }
      ]
    };

    fetch('http://127.0.0.1:8000/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedInvoice)
    }).catch(err => console.error('Failed to sync invoice to db', err));
  };

  // Toggle wishlist
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      triggerNotification('Removed from Wishlist', 'info');
    } else {
      setWishlist([...wishlist, productId]);
      triggerNotification('Added to Wishlist', 'success');
    }
  };

  // Cart operations
  const addToCart = (product, configuredDetails, rentalPeriod, duration, rate, cost) => {
    const cartItemId = `${product.id}-${Date.now()}`;
    const newCartItem = {
      cartItemId,
      id: product.id,
      product,
      variantDetails: configuredDetails,
      rentalPeriod,
      rentalDuration: duration,
      priceRate: rate,
      totalCost: cost,
      quantity: 1
    };

    setCart([...cart, newCartItem]);
    triggerNotification(`Added ${product.name} to Cart`, 'success');
  };

  const updateCartQty = (cartItemId, change) => {
    setCart(prev => 
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = Math.max(1, item.quantity + change);
          const newCost = (item.totalCost / item.quantity) * newQty;
          return { ...item, quantity: newQty, totalCost: newCost };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
    triggerNotification('Removed from Cart', 'info');
  };

  const applyCoupon = (code) => {
    if (code.trim().toUpperCase() === 'HACK25') {
      setAppliedCoupon({ code: 'HACK25', discountPercent: 25 });
      triggerNotification('Coupon HACK25 (25% Off) applied!', 'success');
    } else {
      triggerNotification('Invalid coupon code', 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    triggerNotification('Coupon removed', 'info');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.totalCost, 0);
  const deliveryCharge = deliveryOption === 'shipping' ? 15.00 : 0.00;
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent / 100) : 0;
  const totalAmount = subtotal + deliveryCharge - discountAmount;

  // Checkout order submission
  const finalizeOrder = (addressOverride, paymentOverride) => {
    if (cart.length === 0) return null;

    const newOrderNumber = `S000${Math.floor(10 + Math.random() * 89)}`;
    const addr = addressOverride || shippingAddress;

    const newOrder = {
      orderId: newOrderNumber,
      customerName: addr.fullName || (user ? user.name : 'Guest Customer'),
      customerEmail: user ? user.email : 'guest@example.com',
      customerPhone: addr.phone || '+1 (555) 000-0000',
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      subtotal,
      deliveryOption,
      deliveryCharge,
      discount: discountAmount,
      total: totalAmount,
      status: 'QUOTATION',
      kanbanCategory: 'Today',
      pickupDate: 'Jan 5, 9:00am',
      returnDate: 'Jan 11, 9:00am',
      invoiceStatus: 'Nothing to Invoice',
      gstIn: user?.gstIn || '',
      deliveryAddress: addr,
      billingAddress: addr,
      paymentDetails: paymentOverride || paymentDetails
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setAppliedCoupon(null);
    setCouponCode('');
    
    // Add date schedule dot log
    const dateStr = '2026-01-05';
    const newSchEvent = {
      id: `sch-${Date.now()}`,
      orderRef: newOrderNumber,
      product: newOrder.items[0].product.name.split(' ')[0],
      variant: Object.values(newOrder.items[0].variantDetails)[0] || 'Default',
      quantity: newOrder.items[0].quantity,
      status: 'Available',
      type: 'Pickup'
    };
    
    setScheduleEvents(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), newSchEvent]
    }));

    // Post new order to SQLite3 via FastAPI
    syncOrderToBackend(newOrder);

    triggerNotification(`Order ${newOrderNumber} logged. Quotation created.`, 'success');
    return newOrderNumber;
  };

  // State Machine logic (QUOTATION -> QUOTATION_SENT -> SALE_ORDER)
  const sendQuotation = (orderId) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.orderId === orderId) {
          const updated = { ...o, status: 'QUOTATION_SENT', invoiceStatus: 'Quotation Sent', kanbanCategory: 'Pickup' };
          syncOrderToBackend(updated);
          triggerNotification(`Quotation S000${orderId.substring(4)} sent successfully!`, 'success');
          return updated;
        }
        return o;
      })
    );
  };

  const confirmSale = (orderId) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.orderId === orderId) {
          // Generate new draft invoice corresponding to Order S000XX
          const newInvoiceNumber = `INV/2026/${orderId.substring(1)}`;
          const newInvoice = {
            invoiceId: newInvoiceNumber,
            orderId: orderId,
            date: new Date().toISOString().split('T')[0],
            customerName: o.customerName,
            amount: o.total * 1.10, // including 10% taxes
            status: 'DRAFT',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tax_percentage: 10.00,
            untaxed_amount: o.total,
            taxes: o.total * 0.10,
            invoice_address: o.customerName + ' Office',
            delivery_address: 'Fulfillment coordinate dest',
            delivery_method: o.deliveryOption === 'shipping' ? 'Standard Delivery' : 'Pickup from Store'
          };
          
          setInvoices(prevInv => [newInvoice, ...prevInv]);
          syncInvoiceToBackend(newInvoice);

          const updated = { ...o, status: 'SALE_ORDER', invoiceStatus: 'Invoiced', kanbanCategory: 'Return' };
          syncOrderToBackend(updated);

          triggerNotification(`Sale Order Confirmed. Draft Invoice ${newInvoiceNumber} Created.`, 'success');
          return updated;
        }
        return o;
      })
    );
  };

  const pickupOrder = (orderId) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId === orderId) {
          const updated = { ...o, kanbanCategory: 'Return' };
          syncOrderToBackend(updated);
          triggerNotification('Order items picked up by client', 'success');
          return updated;
        }
        return o;
      })
    );
  };

  const moveOrderKanban = (orderId, targetCol) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId === orderId) {
          const updated = { ...o, kanbanCategory: targetCol };
          syncOrderToBackend(updated);
          return updated;
        }
        return o;
      })
    );
  };

  const postInvoice = (invoiceId) => {
    setInvoices(prev => 
      prev.map(inv => {
        if (inv.invoiceId === invoiceId) {
          const updated = { ...inv, status: 'POSTED' };
          syncInvoiceToBackend(updated);
          triggerNotification(`Invoice ${invoiceId} Posted. Financial accounts adjusted.`, 'success');
          return updated;
        }
        return inv;
      })
    );
  };

  // Products Attributes Crud
  const createAttribute = (newAttr) => {
    const attrId = `attr-${Date.now()}`;
    const payload = { id: attrId, ...newAttr };
    
    fetch('http://127.0.0.1:8000/api/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error(err));

    setAttributes([...attributes, payload]);
    triggerNotification('New Attribute defined', 'success');
  };

  const updateAttribute = (id, updatedAttr) => {
    const payload = { id, ...updatedAttr };

    fetch('http://127.0.0.1:8000/api/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error(err));

    setAttributes(prev => prev.map(a => a.id === id ? payload : a));
    triggerNotification('Attribute updated', 'success');
  };

  const deleteAttribute = (id) => {
    fetch(`http://127.0.0.1:8000/api/attributes/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error(err));

    setAttributes(attributes.filter(a => a.id !== id));
    triggerNotification('Attribute deleted', 'info');
  };

  // Pricelists rules
  const createPricelistRule = (plId, newRule) => {
    setPricelists(prev =>
      prev.map(pl => {
        if (pl.id === plId) {
          const updated = {
            ...pl,
            rules: [...pl.rules, { id: `plr-${Date.now()}`, ...newRule }]
          };
          fetch('http://127.0.0.1:8000/api/pricelists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).catch(err => console.error(err));
          return updated;
        }
        return pl;
      })
    );
    triggerNotification('Pricelist rule defined', 'success');
  };

  // Quotation Templates Crud
  const createTemplate = (newTemp) => {
    const payload = { id: `qt-${Date.now()}`, ...newTemp };
    fetch('http://127.0.0.1:8000/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error(err));

    setTemplates([...templates, payload]);
    triggerNotification('Template created successfully', 'success');
  };

  const updateTemplate = (id, updatedTemp) => {
    const payload = { id, ...updatedTemp };
    fetch('http://127.0.0.1:8000/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error(err));

    setTemplates(prev => prev.map(t => t.id === id ? payload : t));
    triggerNotification('Template updated successfully', 'success');
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      user,
      setUser,
      
      products,
      setProducts,
      attributes,
      setAttributes,
      pricelists,
      setPricelists,
      templates,
      setTemplates,
      scheduleEvents,
      setScheduleEvents,
      orders,
      setOrders,
      invoices,
      setInvoices,
      
      selectedOrderId,
      setSelectedOrderId,
      selectedInvoiceId,
      setSelectedInvoiceId,
      
      searchQuery,
      setSearchQuery,
      filters,
      setFilters,
      scheduleMonth,
      setScheduleMonth,
      
      wishlist,
      toggleWishlist,
      
      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      
      couponCode,
      setCouponCode,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      
      deliveryOption,
      setDeliveryOption,
      billingSameAsShipping,
      setBillingSameAsShipping,
      shippingAddress,
      setShippingAddress,
      paymentDetails,
      setPaymentDetails,
      
      pickupLateFeeChecked,
      setPickupLateFeeChecked,
      lateFeePerHour,
      setLateFeePerHour,
      productWarrantyChecked,
      setProductWarrantyChecked,
      priceListChecked,
      setPriceListChecked,
      
      subtotal,
      deliveryCharge,
      discountAmount,
      totalAmount,
      
      finalizeOrder,
      
      sendQuotation,
      confirmSale,
      pickupOrder,
      moveOrderKanban,
      postInvoice,
      
      createAttribute,
      updateAttribute,
      deleteAttribute,
      createPricelistRule,
      createTemplate,
      updateTemplate,
      syncProductToBackend,
      
      selectedCurrency,
      setSelectedCurrency,
      exchangeRates,
      convertPrice,
      userLocation,
      weatherLogistics,
      iotTelemetryList,
      setIotTelemetryList,
      auditLogs,
      setAuditLogs,
      logAuditAction,
      importExternalProducts,
      
      triggerNotification
    }}>
      {children}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up bg-darkBg-card border-l-4 border-accent-mint px-5 py-4 rounded-r-lg shadow-glow flex items-center space-x-3 text-sm font-semibold max-w-sm glass">
          <span className="h-2 w-2 rounded-full bg-accent-mint animate-ping animate-pulse-glow"></span>
          <span>{notification.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};
