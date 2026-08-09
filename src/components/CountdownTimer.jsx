import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, AlertTriangle, Timer } from 'lucide-react';

function parseReturnDate(returnDateStr) {
  if (!returnDateStr) return null;
  // Handle "Jan 10, 6:30pm" format
  try {
    const d = new Date(returnDateStr);
    if (!isNaN(d)) return d;
    // Try parsing "Jan 10, 6:30pm" manually
    const match = returnDateStr.match(/([A-Za-z]+)\s+(\d+),?\s+(\d+):(\d+)(am|pm)/i);
    if (match) {
      const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
      let hours = parseInt(match[3]);
      const mins = parseInt(match[4]);
      if (match[5].toLowerCase() === 'pm' && hours !== 12) hours += 12;
      if (match[5].toLowerCase() === 'am' && hours === 12) hours = 0;
      const date = new Date(2026, months[match[1].toLowerCase().slice(0,3)], parseInt(match[2]), hours, mins);
      return date;
    }
  } catch {}
  return null;
}

export default function CountdownTimer({ returnDate, compact = false, lateFeePerHour = 15 }) {
  const [timeData, setTimeData] = useState(null);

  useEffect(() => {
    const target = parseReturnDate(returnDate);
    if (!target) return;

    const tick = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      const isLate = diff < 0;
      const absDiff = Math.abs(diff);
      const totalSeconds = Math.floor(absDiff / 1000);
      const days    = Math.floor(totalSeconds / 86400);
      const hours   = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const lateHours = absDiff / 3600000;
      const lateFee = isLate ? (lateHours * lateFeePerHour).toFixed(2) : 0;
      const urgency = isLate ? 'critical' : (diff < 7200000 ? 'warning' : 'normal');
      setTimeData({ days, hours, minutes, seconds, isLate, lateFee, urgency, diff });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [returnDate, lateFeePerHour]);

  if (!timeData) return (
    <span className="text-[10px] text-gray-600 price-mono">—</span>
  );

  const { days, hours, minutes, seconds, isLate, lateFee, urgency } = timeData;

  const pad = n => String(n).padStart(2, '0');

  if (compact) {
    // Compact row version for table/kanban
    if (isLate) {
      return (
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-red-400 animate-pulse price-mono">
            <AlertTriangle className="h-3 w-3" />
            <span>+{pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
          </span>
          <span className="text-[9px] text-red-400/70">Fee: ${lateFee}</span>
        </div>
      );
    }
    if (urgency === 'warning') {
      return (
        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-accent-gold animate-pulse price-mono">
          <Clock className="h-3 w-3" />
          <span>{pad(hours)}h {pad(minutes)}m</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-accent-teal price-mono">
        <Clock className="h-3 w-3" />
        <span>{days > 0 ? `${days}d ` : ''}{pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
      </span>
    );
  }

  // Full display version
  if (isLate) {
    return (
      <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30 animate-pulse-glow">
        <div className="flex items-center space-x-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider">RENTAL OVERDUE</span>
        </div>
        <div className="price-mono text-2xl font-extrabold text-red-400">
          +{pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </div>
        <div className="text-[10px] text-red-400/80 mt-0.5">
          Accrued late fee: <span className="font-bold">${lateFee}</span> and counting…
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-3 border ${
      urgency === 'warning'
        ? 'bg-accent-gold/8 border-accent-gold/30'
        : 'bg-accent-teal/5 border-accent-teal/20'
    }`}>
      <div className="flex items-center space-x-2 mb-1.5">
        <Timer className={`h-3.5 w-3.5 ${urgency === 'warning' ? 'text-accent-gold' : 'text-accent-teal'}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${urgency === 'warning' ? 'text-accent-gold' : 'text-accent-teal'}`}>
          Return Countdown
        </span>
      </div>
      <div className="flex items-baseline space-x-1">
        {days > 0 && (
          <><span className={`price-mono text-xl font-extrabold ${urgency === 'warning' ? 'text-accent-gold' : 'text-white'}`}>{days}d</span></>
        )}
        <span className={`price-mono text-xl font-extrabold ${urgency === 'warning' ? 'text-accent-gold' : 'text-white'}`}>
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </div>
    </div>
  );
}
