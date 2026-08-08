import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactUs() {
  const { triggerNotification } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      triggerNotification('Please fill in all contact fields', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      triggerNotification('Message transmitted successfully!', 'success');
      setName('');
      setEmail('');
      setMsg('');
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="text-center">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-accent-mint bg-accent-mint/10 px-2 py-0.5 rounded">
          Support Hub
        </span>
        <h2 className="text-2xl font-extrabold text-white mt-1">Get In Touch</h2>
        <p className="text-xs text-gray-400 mt-1">Have rental questions or specific custom catalog requirements? Drop us a line.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Contact details */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border border-darkBg-border bg-darkBg-card p-5 glass space-y-4">
            
            <div className="flex items-center space-x-3 text-xs">
              <div className="h-8 w-8 bg-accent-mint/10 border border-accent-mint/20 rounded flex items-center justify-center text-accent-mint">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Email Support</p>
                <p className="text-white font-semibold">support@neorent.network</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="h-8 w-8 bg-accent-mint/10 border border-accent-mint/20 rounded flex items-center justify-center text-accent-mint">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Corporate Hotline</p>
                <p className="text-white font-semibold">+1 (555) NEO-RENT</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="h-8 w-8 bg-accent-mint/10 border border-accent-mint/20 rounded flex items-center justify-center text-accent-mint">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">HQ Coordinates</p>
                <p className="text-white font-semibold">Grid Section #894, SF</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact form */}
        <div className="md:col-span-2 rounded-xl border border-darkBg-border bg-darkBg-card p-6 glass">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aria Sterling"
                  className="w-full rounded-lg border border-darkBg-border bg-darkBg px-3 py-2 text-xs text-white outline-none focus:border-accent-mint"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aria.s@example.com"
                  className="w-full rounded-lg border border-darkBg-border bg-darkBg px-3 py-2 text-xs text-white outline-none focus:border-accent-mint"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Message Content</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Enter details about your inquiry..."
                  className="w-full rounded-lg border border-darkBg-border bg-darkBg py-3.5 pl-10 pr-4 text-xs text-white outline-none focus:border-accent-mint min-h-[120px]"
                  required
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-accent-mint py-2.5 font-bold text-darkBg hover:bg-accent-mintLight transition-all shadow-glow text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Transmitting...' : 'Send Message'}</span>
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
