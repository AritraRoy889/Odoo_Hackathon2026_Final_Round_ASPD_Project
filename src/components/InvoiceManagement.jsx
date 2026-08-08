import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Mail, Printer, FileText } from 'lucide-react';

export default function InvoiceManagement() {
  const {
    invoices,
    setCurrentView,
    setSelectedOrderId,
    triggerNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // all, draft, posted

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'draft') return inv.status === 'Draft';
    if (activeTab === 'posted') return inv.status === 'Posted';
    return true;
  });

  const handlePostInvoice = (id) => {
    transitionInvoiceStatus(id, 'Posted');
    triggerNotification(`Invoice ${id} posted successfully`, 'success');
  };

  const handleSendInvoice = (inv) => {
    triggerNotification(`Invoice ${inv.invoiceId} dispatched via email to ${inv.customerName}!`, 'success');
  };

  const handlePrintInvoice = (orderId) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-confirmation');
    // Once they land on order-confirmation, they can trigger print layout
  };

  const draftTotal = invoices
    .filter(inv => inv.status === 'Draft')
    .reduce((acc, item) => acc + item.amount, 0);

  const postedTotal = invoices
    .filter(inv => inv.status === 'Posted')
    .reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentView('admin')}
        className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors no-print"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Admin Dashboard</span>
      </button>

      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-darkBg-border pb-4 no-print">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-accent-mint bg-accent-mint/10 px-2 py-0.5 rounded">
            Financial Ledger
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Invoice Statement Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">Post draft invoices, dispatch email copies, and generate print statements.</p>
        </div>
      </div>

      {/* Stats summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 no-print">
        <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-4 glass flex items-center space-x-4">
          <div className="h-10 w-10 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center font-bold">
            $
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unposted Draft Invoices</p>
            <p className="text-lg font-extrabold text-white mt-0.5">${Number(draftTotal || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-4 glass flex items-center space-x-4">
          <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
            $
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Posted Ledger Revenue</p>
            <p className="text-lg font-extrabold text-white mt-0.5">${Number(postedTotal || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tab Filter Control */}
      <div className="flex border-b border-darkBg-border no-print gap-4">
        {['all', 'draft', 'posted'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-accent-mint text-accent-mint' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab} Invoices ({(invoices || []).filter(i => tab === 'all' ? true : tab === 'draft' ? i.status === 'Draft' : i.status === 'Posted').length})
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="rounded-xl border border-darkBg-border bg-darkBg-card overflow-hidden glass no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-darkBg-border bg-darkBg/60 text-gray-400">
                <th className="p-4 font-bold uppercase tracking-wider">Invoice ID</th>
                <th className="p-4 font-bold uppercase tracking-wider">Linked Order</th>
                <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
                <th className="p-4 font-bold uppercase tracking-wider">Issue Date</th>
                <th className="p-4 font-bold uppercase tracking-wider">Due Date</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Status</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Value Amount</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBg-border/30">
              {(filteredInvoices || []).map((inv) => (
                <tr key={inv.invoiceId || inv.id} className="text-gray-300 hover:bg-darkBg-hover/30 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center">
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                    {inv.invoiceId || inv.name || inv.id}
                  </td>
                  <td className="p-4 font-medium text-gray-400">{inv.orderId || '-'}</td>
                  <td className="p-4 font-bold text-white">{inv.customerName || inv.partner_id?.[1] || '-'}</td>
                  <td className="p-4 text-gray-400">{inv.date || inv.invoice_date || '-'}</td>
                  <td className="p-4 text-gray-400">{inv.dueDate || inv.invoice_date_due || '-'}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold border ${
                      inv.status === 'Posted' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/35'
                    }`}>
                      {inv.status || 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-extrabold text-white">
                    ${Number(inv.amount || inv.amount_total || inv.amountDue || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {inv.status === 'Draft' ? (
                      <button
                        onClick={() => handlePostInvoice(inv.invoiceId)}
                        className="rounded bg-accent-mint px-2.5 py-1 text-[10px] font-bold text-darkBg hover:bg-accent-mintLight transition-colors"
                      >
                        Approve & Post
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSendInvoice(inv)}
                          className="p-1 px-2 rounded bg-darkBg border border-darkBg-border text-gray-300 hover:text-accent-mint hover:border-accent-mint transition-colors"
                          title="Email Invoice"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(inv.orderId)}
                          className="p-1 px-2 rounded bg-darkBg border border-darkBg-border text-gray-300 hover:text-accent-mint hover:border-accent-mint transition-colors"
                          title="Print Invoice / View Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
