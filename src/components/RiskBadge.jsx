import React, { useState, useEffect } from 'react';
import { computeRiskScore, getRiskLevel } from '../utils/riskOracle';

export default function RiskBadge({ order, allOrders = [], compact = false }) {
  const [hovered, setHovered] = useState(false);
  const { score, breakdown } = computeRiskScore(order, allOrders);
  const risk = getRiskLevel(score);

  // SVG arc for circular gauge
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const arcColor = score < 30 ? '#00E5B0' : score < 65 ? '#F59E0B' : '#EF4444';

  if (compact) {
    return (
      <div className="relative inline-flex" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider cursor-default ${risk.textColor} ${risk.bgColor} ${risk.borderColor}`}>
          <span>{risk.icon}</span>
          <span>{risk.label}</span>
        </div>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 glass-premium rounded-xl border border-[#1C2438] p-3 z-50 animate-fade-in shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-white uppercase">Risk Score</span>
              <span className={`price-mono text-sm font-extrabold ${risk.textColor}`}>{score}</span>
            </div>
            <div className="space-y-1">
              {breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-gray-400">{item.label}</span>
                  <span className={item.points < 0 ? 'text-accent-teal' : 'text-gray-300'}>
                    {item.points > 0 ? '+' : ''}{item.points}pts
                  </span>
                </div>
              ))}
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 glass-premium rotate-45 border-b border-r border-[#1C2438]" />
          </div>
        )}
      </div>
    );
  }

  // Full gauge version
  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* SVG Circular Gauge */}
      <div className="relative w-14 h-14 animate-breathe">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="24" cy="24" r={radius} fill="none" stroke="#1C2438" strokeWidth="4" />
          {/* Progress */}
          <circle
            cx="24" cy="24" r={radius}
            fill="none"
            stroke={arcColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 4px ${arcColor})`,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </svg>
        {/* Score label in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`price-mono text-xs font-extrabold ${risk.textColor}`}>{score}</span>
        </div>
      </div>
      <span className={`mt-1 text-[9px] font-extrabold uppercase tracking-wider ${risk.textColor}`}>
        {risk.label}
      </span>

      {/* Breakdown tooltip */}
      {hovered && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 glass-premium rounded-xl border border-[#1C2438] p-3 z-50 animate-fade-in shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
          <p className="text-[10px] font-bold text-white uppercase mb-2">Risk Breakdown</p>
          {breakdown.map((item, i) => (
            <div key={i} className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">{item.label}</span>
              <span className={item.points < 0 ? 'text-accent-teal font-bold' : 'text-gray-300'}>
                {item.points > 0 ? '+' : ''}{item.points}pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
