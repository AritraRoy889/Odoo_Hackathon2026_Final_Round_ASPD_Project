import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const INTENTS = [
  {
    patterns: ['cheapest', 'affordable', 'lowest price', 'cheap'],
    respond: (products) => {
      const sorted = [...products].sort((a, b) => (a.price?.day || 0) - (b.price?.day || 0));
      const p = sorted[0];
      return p ? `The most affordable option is **${p.name}** by ${p.brand} — starting at just **$${p.price?.day}/day**. Want me to add it to your cart?` : "I couldn't find pricing data right now.";
    }
  },
  {
    patterns: ['monitor', 'screen', 'display'],
    respond: (products) => {
      const items = products.filter(p => p.name.toLowerCase().includes('monitor') || p.category === 'Electronics');
      return items.length > 0
        ? `We have **${items.length} electronics** available! Top pick: **${items[0].name}** at $${items[0].price?.day}/day. Browse the product grid to see all options.`
        : "No monitors in stock currently.";
    }
  },
  {
    patterns: ['chair', 'furniture', 'sofa', 'desk'],
    respond: (products) => {
      const items = products.filter(p => p.category === 'Furniture');
      return items.length > 0
        ? `We stock **${items.length} furniture items** — starting from **$${Math.min(...items.map(i => i.price?.day || 999))}/day**. Great for home or office setups!`
        : "No furniture available right now.";
    }
  },
  {
    patterns: ['track', 'where is', 'my order', 'order status'],
    respond: (_, orders) => {
      const active = orders?.filter(o => o.status === 'SALE_ORDER').slice(0, 2);
      return active?.length
        ? `Found **${active.length} active rental(s)**:\n• ${active.map(o => `${o.orderId} — Return: ${o.returnDate}`).join('\n• ')}`
        : "No active rentals found. Place an order first!";
    }
  },
  {
    patterns: ['hello', 'hi', 'hey', 'help'],
    respond: () => "👋 Hey there! I'm **NeoBot**, your rental assistant.\n\nI can help you:\n• Find the **cheapest** item\n• Browse by **category** (chairs, monitors...)\n• Check **order status**\n• Get **rental tips**\n\nWhat are you looking for?"
  },
  {
    patterns: ['how does', 'how do i', 'how to', 'how it works'],
    respond: () => "It's simple:\n\n**1.** Browse & pick a product\n**2.** Configure your rental period\n**3.** Checkout & pay securely\n**4.** We deliver to your door!\n\nSecurity deposits are refunded within 48hrs after verified return. 🎉"
  },
  {
    patterns: ['price', 'cost', 'how much', 'rate'],
    respond: (products) => {
      const rates = products.map(p => ({ name: p.name, day: p.price?.day || 0 })).sort((a, b) => a.day - b.day);
      return `Rental rates range from **$${rates[0]?.day}/day** to **$${rates[rates.length - 1]?.day}/day**.\n\nMost popular: $${rates[Math.floor(rates.length / 2)]?.day}/day for mid-tier items.`;
    }
  },
  {
    patterns: ['deposit', 'security', 'refund'],
    respond: () => "Security deposits are **fully refundable** within 48 business hours after return verification.\n\nThey range from 10–25% of the item's sale price depending on the product tier."
  },
];

const SUGGESTIONS = [
  "Cheapest item?", "Track my order", "How it works", "Furniture options"
];

export default function NeoBotChat() {
  const { products, orders } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm **NeoBot** 🤖\nHow can I help you today?", time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const typewriterEffect = (text, onDone) => {
    let i = 0;
    setDisplayText('');
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(interval); onDone && onDone(); }
    }, 18);
    return interval;
  };

  const getBotResponse = (userInput) => {
    const lower = userInput.toLowerCase();
    for (const intent of INTENTS) {
      if (intent.patterns.some(p => lower.includes(p))) {
        return intent.respond(products, orders);
      }
    }
    return `I'm not sure about that yet! Try asking:\n• "What's the cheapest item?"\n• "How does renting work?"\n• "Show me furniture"\n\nOr contact our team via the **Contact** page 📬`;
  };

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    setMessages(prev => [...prev, { from: 'user', text: msg, time: new Date() }]);
    setTyping(true);

    setTimeout(() => {
      const response = getBotResponse(msg);
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: response, time: new Date(), isNew: true }]);
    }, 800 + Math.random() * 400);
  };

  const formatText = (text) => {
    // Bold **text**
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-accent-teal font-bold">{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          open ? 'bg-[#1C2438] shadow-glow-violet rotate-0' : 'bg-gradient-to-tr from-accent-tealDark to-accent-teal shadow-glow hover:scale-105'
        }`}
        aria-label="Open NeoBot chat"
      >
        {open ? (
          <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {/* Notification dot */}
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent-violet border-2 border-[#06070F] animate-pulse-violet" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl glass-premium border border-[#1C2438] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-[#1C2438] bg-gradient-to-r from-accent-tealDark/20 to-accent-violet/20">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-accent-tealDark to-accent-teal flex items-center justify-center text-xl shadow-glow-subtle">
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display">NeoBot</p>
              <div className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-live-blink" />
                <p className="text-[10px] text-accent-teal font-medium">Online · AI Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-gradient-to-r from-accent-teal to-accent-tealDark text-darkBg font-semibold rounded-tr-sm'
                    : 'bg-[#111827] border border-[#1C2438] text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.from === 'bot' ? formatText(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-[#111827] border border-[#1C2438] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center space-x-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold glass-teal text-accent-teal hover:bg-accent-teal/15 transition-colors border border-accent-teal/20"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-2 rounded-xl bg-[#0D1117] border border-[#1C2438] focus-within:border-accent-teal/50 transition-colors">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask NeoBot anything..."
                className="flex-1 bg-transparent py-3 pl-3 pr-1 text-xs text-white placeholder-gray-600 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="mr-2 p-1.5 rounded-lg bg-accent-teal text-darkBg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-tealLight transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
