import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthFlow({ isOpen, onClose, initialTab = 'login' }) {
  const { setUser, triggerNotification, setCurrentView } = useApp();
  const [authTab, setAuthTab] = useState(initialTab);

  // When the modal opens, jump to the requested tab
  useEffect(() => {
    if (isOpen) setAuthTab(initialTab);
  }, [isOpen, initialTab]);


  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Electronics');
  const [gstIn, setGstIn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password validation indicators (Image 1)
  const [passChecks, setPassChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false,
    match: false
  });

  useEffect(() => {
    const hasLength = password.length >= 6 && password.length <= 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[@$&_]/.test(password); // At least one special character from @, $, &, _
    const doesMatch = password.length > 0 && password === confirmPassword;

    setPassChecks({
      length: hasLength,
      upper: hasUpper,
      lower: hasLower,
      special: hasSpecial,
      match: doesMatch
    });
  }, [password, confirmPassword]);

  const isPasswordValid = passChecks.length && passChecks.upper && passChecks.lower && passChecks.special && passChecks.match;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      triggerNotification('Please fill in all fields', 'error');
      return;
    }

    const emailLower = email.toLowerCase();
    const isVendorEmail = emailLower.includes('vendor');
    
    // Credentials verification logic (Image 4)
    // Accept standard mock logins with Password123! or any valid password meeting checks
    const isValidMockPassword = password === 'Password123!' || password === 'admin123' || password === 'vendor123' || isPasswordValid;
    const isAlex = emailLower === 'alex.m@example.com' || emailLower === 'customer@example.com';
    const isAdmin = emailLower === 'admin@admin.com';
    
    if ((isAlex || isVendorEmail || isAdmin) && isValidMockPassword) {
      const mockUser = {
        id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
        name: isAdmin ? 'Platform Administrator' : isVendorEmail ? 'Vanguard Electronics' : 'Alex Mercer',
        email: email,
        role: isAdmin ? 'ADMIN' : isVendorEmail ? 'VENDOR' : 'CUSTOMER',
        companyName: isVendorEmail ? 'Vanguard Inc' : '',
        gstIn: isVendorEmail ? '27VANGUARD1234Z' : '',
        category: isVendorEmail ? 'Electronics' : ''
      };

      setUser(mockUser);
      triggerNotification(`Welcome back, ${mockUser.name}!`, 'success');
      setCurrentView('storefront');
      onClose();
    } else {
      // Custom wireframe mismatch error message (Image 4)
      triggerNotification('Invalid User ID or Password.', 'error');
    }
  };

  const handleRegisterUserSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      triggerNotification('Please complete all fields', 'error');
      return;
    }

    // Unique Email verification simulation (Image 1)
    if (email.toLowerCase() === 'alex.m@example.com' || email.toLowerCase() === 'admin@admin.com') {
      triggerNotification('Sign-up failed: The email ID must be unique.', 'error');
      return;
    }

    // Unique Password verification simulation (Image 1)
    if (password === 'Password123!') {
      triggerNotification('Sign-up failed: The password must be unique.', 'error');
      return;
    }

    if (!isPasswordValid) {
      triggerNotification('Password does not meet safety criteria or mismatch.', 'error');
      return;
    }

    const newUser = {
      id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${firstName} ${lastName}`,
      email,
      role: 'CUSTOMER'
    };

    setUser(newUser);
    triggerNotification('Customer Account registered successfully!', 'success');
    setCurrentView('storefront');
    onClose();
  };

  const handleRegisterVendorSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword || !companyName || !gstIn) {
      triggerNotification('Please fill in all vendor fields', 'error');
      return;
    }

    // Unique Email verification simulation (Image 1)
    if (email.toLowerCase() === 'vendor@company.com' || email.toLowerCase() === 'admin@admin.com') {
      triggerNotification('Sign-up failed: The email ID must be unique.', 'error');
      return;
    }

    // Unique Password verification simulation
    if (password === 'Password123!') {
      triggerNotification('Sign-up failed: The password must be unique.', 'error');
      return;
    }

    if (!isPasswordValid) {
      triggerNotification('Password does not meet safety criteria or mismatch.', 'error');
      return;
    }

    if (gstIn.trim().length !== 15) {
      triggerNotification('GST no must be exactly 15 characters', 'error');
      return;
    }

    const newVendor = {
      id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${firstName} ${lastName}`,
      email,
      role: 'VENDOR',
      companyName,
      gstIn: gstIn.toUpperCase(),
      category: vendorCategory
    };

    setUser(newVendor);
    triggerNotification(`Vendor portal registered for ${companyName}!`, 'success');
    setCurrentView('storefront');
    onClose();
  };

  const handleRegisterAdminSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      triggerNotification('Please fill in all fields', 'error');
      return;
    }

    if (email.trim().toLowerCase() !== 'neorent435@gmail.com') {
      triggerNotification('Admin not matched', 'error');
      return;
    }

    const adminUser = {
      id: `admin-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Platform Administrator',
      email: 'neorent435@gmail.com',
      role: 'ADMIN'
    };

    setUser(adminUser);
    triggerNotification('Admin portal opened successfully!', 'success');
    setCurrentView('admin');
    onClose();
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      triggerNotification('Please enter your email', 'error');
      return;
    }

    // Email existence validation logic (Image 4)
    const emailLower = email.toLowerCase();
    const emailExists = ['alex.m@example.com', 'vendor@company.com', 'admin@admin.com', 'customer@example.com'].includes(emailLower) || emailLower.includes('vendor') || emailLower.includes('alex');
    
    if (emailExists) {
      triggerNotification('The password reset link has been sent to your email.', 'success');
      setAuthTab('login');
    } else {
      triggerNotification('Email ID does not exist in our registry.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-lg rounded-xl border border-darkBg-border bg-darkBg-card p-6 shadow-glow-lg animate-slide-up glass-premium max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Header Selector */}
        {authTab !== 'forgot' && (
          <div className="mb-6 flex border-b border-darkBg-border pb-3 justify-start gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setPassword(''); setConfirmPassword(''); }}
              className={`pb-1 text-sm font-bold uppercase tracking-wider transition-colors ${
                authTab === 'login' ? 'border-b-2 border-accent-mint text-accent-mint' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register-user'); setPassword(''); setConfirmPassword(''); }}
              className={`pb-1 text-sm font-bold uppercase tracking-wider transition-colors ${
                authTab === 'register-user' ? 'border-b-2 border-accent-mint text-accent-mint' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register-vendor'); setPassword(''); setConfirmPassword(''); }}
              className={`pb-1 text-sm font-bold uppercase tracking-wider transition-colors ${
                authTab === 'register-vendor' ? 'border-b-2 border-accent-mint text-accent-mint' : 'text-gray-400 hover:text-white'
              }`}
            >
              Vendor Partner
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register-admin'); setPassword(''); setConfirmPassword(''); }}
              className={`pb-1 text-sm font-bold uppercase tracking-wider transition-colors ${
                authTab === 'register-admin' ? 'border-b-2 border-accent-mint text-accent-mint' : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {/* --- 1. LOGIN PAGE (Image 4) --- */}
        {authTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-xs text-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Login Page</h3>
              <p className="text-[10px] text-gray-500 mt-1">
                Use <code className="text-accent-mint">alex.m@example.com</code> / <code className="text-accent-mint">Password123!</code> to sign in.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Login ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.m@example.com"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2.5 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2.5 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Pink button: Log In */}
            <button
              type="submit"
              className="w-full text-center py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-extrabold tracking-wider uppercase text-xs transition-colors shadow-glow"
            >
              Log In
            </button>

            {/* Links footer (Image 4) */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-darkBg-border/40 text-[11px]">
              <button
                type="button"
                onClick={() => setAuthTab('forgot')}
                className="text-accent-mint hover:underline font-bold"
              >
                Forgot Password?
              </button>
              
              <div className="text-gray-400">
                Do not have an account ?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthTab('register-user'); setPassword(''); setConfirmPassword(''); }}
                  className="text-accent-mint hover:underline font-extrabold"
                >
                  Register Here
                </button>
              </div>
            </div>
          </form>
        )}

        {/* --- 2. RESET PASSWORD PAGE (Image 4) --- */}
        {authTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-5 text-xs text-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Reset Password</h3>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Enter Email ID:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.m@example.com"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2.5 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Orange warning note box (Image 4) */}
            <div className="p-3 bg-orange-950/20 border border-orange-500/30 text-[10px] text-orange-400 rounded-lg leading-relaxed">
              Note: The system should verify whether the entered email exists.
            </div>

            {/* Pink button: Submit */}
            <button
              type="submit"
              className="w-full text-center py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-extrabold tracking-wider uppercase text-xs transition-colors shadow-glow"
            >
              Submit
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className="text-[11px] text-gray-400 hover:text-white transition-colors underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* --- 3. CUSTOMER REGISTRATION (Image 1) --- */}
        {authTab === 'register-user' && (
          <form onSubmit={handleRegisterUserSubmit} className="space-y-4 text-xs text-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sign-up Page</h3>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mercer"
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>
            </div>

            {/* Email ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.m@example.com"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Password strength checks box */}
            <div className="p-3 bg-darkBg/60 border border-darkBg-border rounded-lg space-y-2 text-[10px] text-gray-400">
              <div className="flex items-center space-x-1.5">
                {passChecks.length ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.length ? 'text-accent-mint font-bold' : ''}>Password length: 6 - 12 characters</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.upper ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.upper ? 'text-accent-mint font-bold' : ''}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.lower ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.lower ? 'text-accent-mint font-bold' : ''}>At least one lowercase letter</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.special ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.special ? 'text-accent-mint font-bold' : ''}>At least one special character (@, $, &, _)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.match ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.match ? 'text-accent-mint font-bold' : ''}>Passwords match</span>
              </div>
            </div>

            {/* Pink Button: Register */}
            <button
              type="submit"
              disabled={!isPasswordValid}
              className={`w-full text-center py-2.5 rounded-lg text-white font-extrabold tracking-wider text-xs uppercase transition-colors ${
                isPasswordValid
                  ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer shadow-glow-subtle'
                  : 'bg-darkBg-border text-gray-500 cursor-not-allowed'
              }`}
            >
              Register
            </button>

            {/* Become a vendor link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setAuthTab('register-vendor'); setPassword(''); setConfirmPassword(''); }}
                className="text-xs text-accent-mint hover:underline font-bold"
              >
                Become a vendor
              </button>
            </div>

          </form>
        )}

        {/* --- 4. VENDOR REGISTRATION (Image 1) --- */}
        {authTab === 'register-vendor' && (
          <form onSubmit={handleRegisterVendorSubmit} className="space-y-4 text-xs text-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Vendor Sign-up Page</h3>
            </div>

            {/* First Name & Company Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Devon"
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Rentals Ltd"
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>
            </div>

            {/* Product Category dropdown & GST no */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Product Category</label>
                <select
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Vehicles">Vehicles</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">GST no</label>
                <input
                  type="text"
                  value={gstIn}
                  onChange={(e) => setGstIn(e.target.value)}
                  placeholder="27ABCDE1234F1Z9"
                  maxLength={15}
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>
            </div>

            {/* Last Name & Email ID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Miller"
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@apex.com"
                  className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Password strength checks box */}
            <div className="p-3 bg-darkBg/60 border border-darkBg-border rounded-lg space-y-2 text-[10px] text-gray-400">
              <div className="flex items-center space-x-1.5">
                {passChecks.length ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.length ? 'text-accent-mint font-bold' : ''}>Password length: 6 - 12 characters</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.upper ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.upper ? 'text-accent-mint font-bold' : ''}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.lower ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.lower ? 'text-accent-mint font-bold' : ''}>At least one lowercase letter</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.special ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.special ? 'text-accent-mint font-bold' : ''}>At least one special character (@, $, &, _)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {passChecks.match ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-mint" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className={passChecks.match ? 'text-accent-mint font-bold' : ''}>Passwords match</span>
              </div>
            </div>

            {/* Pink Button: Register */}
            <button
              type="submit"
              disabled={!isPasswordValid || gstIn.trim().length !== 15}
              className={`w-full text-center py-2.5 rounded-lg text-white font-extrabold tracking-wider text-xs uppercase transition-colors ${
                isPasswordValid && gstIn.trim().length === 15
                  ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer shadow-glow-subtle'
                  : 'bg-darkBg-border text-gray-500 cursor-not-allowed'
              }`}
            >
              Register
            </button>

          </form>
        )}

        {/* --- 5. ADMIN SIGN-UP PAGE --- */}
        {authTab === 'register-admin' && (
          <form onSubmit={handleRegisterAdminSubmit} className="space-y-4 text-xs text-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Admin Sign-Up</h3>
              <p className="text-[10px] text-gray-500 mt-1">
                Enter your administrative credentials to open the back-office management console.
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neorent435@gmail.com"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2.5 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-darkBg-border bg-darkBg p-2.5 text-white outline-none focus:border-accent-mint text-[11px]"
                required
              />
            </div>

            {/* Sign-Up Button */}
            <button
              type="submit"
              className="w-full text-center py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-extrabold tracking-wider uppercase text-xs transition-colors shadow-glow cursor-pointer"
            >
              Sign-Up
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
