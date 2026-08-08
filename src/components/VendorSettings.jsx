import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Save, ShieldAlert, Upload, FileText } from 'lucide-react';

export default function VendorSettings() {
  const { 
    vendorSettings, 
    setVendorSettings, 
    setCurrentView, 
    triggerNotification,
    user,
    setUser
  } = useApp();

  const [companyName, setCompanyName] = useState(vendorSettings.companyName);
  const [gstIn, setGstIn] = useState(vendorSettings.gstIn);
  const [category, setCategory] = useState(vendorSettings.category);
  const [defaultTemplate, setDefaultTemplate] = useState(vendorSettings.defaultTemplate);

  // Template details mock states
  const [depositPercent, setDepositPercent] = useState('15%');
  const [minDuration, setMinDuration] = useState('3 Days');
  const [terms, setTerms] = useState('All property must be returned in the original lease configuration. Sizing changes require 48h advance vendor log.');

  const [logoPreview, setLogoPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        setLogoPreview(URL.createObjectURL(file));
        setUploading(false);
        triggerNotification('Company logo mock uploaded!', 'success');
      }, 1000);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (gstIn.trim().length !== 15) {
      triggerNotification('GST IN must be exactly 15 characters', 'error');
      return;
    }

    const updated = {
      companyName,
      gstIn: gstIn.toUpperCase(),
      category,
      defaultTemplate,
      logoUrl: logoPreview
    };

    // Update vendor settings
    setVendorSettings(updated);

    // If active user is vendor, sync user profile
    if (user && user.role === 'vendor') {
      setUser({
        ...user,
        name: companyName, // update name shown in navbar dropdown
        companyName,
        gstIn: gstIn.toUpperCase(),
        category
      });
    }

    triggerNotification('Vendor settings updated successfully!', 'success');
  };

  // Pre-load templates properties helper
  const handleTemplateChange = (val) => {
    setDefaultTemplate(val);
    if (val.includes('Furniture')) {
      setDepositPercent('20%');
      setMinDuration('7 Days');
      setTerms('Furniture rentals subject to damage inspections. Return timelines must align with modular assembly pickup schedules.');
    } else {
      setDepositPercent('10%');
      setMinDuration('1 Day');
      setTerms('Electronics must remain unmodified. Standard firmware locks apply. Return package in original protective cases.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentView('admin')}
        className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Admin Dashboard</span>
      </button>

      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-darkBg-border pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-accent-mint bg-accent-mint/10 px-2 py-0.5 rounded">
            Configuration Panel
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Vendor Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">Configure corporate identity details and default quotation workflows.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Logo Drag-n-drop */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass text-center">
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-4">
              Company Logo
            </label>
            
            <div className="relative flex flex-col items-center justify-center p-6 border border-dashed border-darkBg-border rounded-lg bg-darkBg/50 group hover:border-accent-mint transition-colors">
              {logoPreview ? (
                <div className="space-y-3">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-20 w-20 rounded-lg object-cover border border-darkBg-border mx-auto"
                  />
                  <p className="text-[10px] text-gray-400">File uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-500 mx-auto group-hover:text-accent-mint transition-colors" />
                  <p className="text-[10px] text-gray-400">Drag logo here or click</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {uploading && (
              <p className="text-[10px] text-accent-mint mt-2 animate-pulse">Processing upload...</p>
            )}
          </div>

          {/* Info warnings */}
          <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/20 text-yellow-400 text-xs flex gap-3">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Tax Registry compliance</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Changes to Company Name and GST IN will cascade directly to your customer invoices. Enforce valid alphanumeric logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Fields & Templates */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-darkBg-border/50 pb-2">
              Corporate Registry Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-darkBg-border bg-darkBg px-3 py-2 text-xs text-white outline-none focus:border-accent-mint"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Default Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-darkBg-border bg-darkBg px-3 py-2 text-xs text-white outline-none focus:border-accent-mint"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Vehicles">Vehicles</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">GST IN Tax Identification</label>
              <input
                type="text"
                value={gstIn}
                onChange={(e) => setGstIn(e.target.value)}
                maxLength={15}
                className="w-full rounded-lg border border-darkBg-border bg-darkBg px-3 py-2.5 text-xs text-white outline-none focus:border-accent-mint"
                required
              />
              <span className="text-[10px] text-gray-400 block">Must be exactly 15 characters (e.g. 27ABCDE1234F1Z9)</span>
            </div>
          </div>

          {/* Quotation Templates Config */}
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-darkBg-border/50 pb-2 flex items-center">
              <FileText className="mr-1.5 h-3.5 w-3.5 text-accent-mint" />
              Quotation Template Engine
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Selected Template Layout</label>
              <select
                value={defaultTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full rounded-lg border border-darkBg-border bg-darkBg px-3 py-2 text-xs text-white outline-none focus:border-accent-mint"
              >
                <option value="Office Electronics Template">Office Electronics Template</option>
                <option value="Home Electronics Template">Home Electronics Template</option>
                <option value="Office Furniture Template">Office Furniture Template</option>
                <option value="Home Furniture Template">Home Furniture Template</option>
              </select>
            </div>

            {/* Template dynamic options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-darkBg/40 p-4 border border-darkBg-border/40 rounded-lg text-xs">
              <div>
                <p className="text-gray-400">Lease Deposit:</p>
                <p className="text-white font-bold">{depositPercent}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Min Rental Period:</p>
                <p className="text-white font-bold">{minDuration}</p>
              </div>

              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-darkBg-border/30">
                <p className="text-gray-400 mb-1">Standard Policy Terms:</p>
                <p className="text-gray-300 text-[10px] leading-relaxed">{terms}</p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-accent-mint py-3 font-bold text-darkBg hover:bg-accent-mintLight transition-all shadow-glow"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
}
