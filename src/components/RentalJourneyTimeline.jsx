import React from 'react';
import { FileText, Send, CheckCircle, Package, RotateCcw, Lock, CheckCheck } from 'lucide-react';

const STAGES = [
  { key: 'QUOTATION',      label: 'Quotation',  icon: FileText,     color: 'gray' },
  { key: 'QUOTATION_SENT', label: 'Sent',       icon: Send,         color: 'violet' },
  { key: 'SALE_ORDER',     label: 'Confirmed',  icon: CheckCircle,  color: 'teal' },
  { key: 'PICKUP',         label: 'Pickup',     icon: Package,      color: 'violet' },
  { key: 'ACTIVE',         label: 'Active',     icon: RotateCcw,    color: 'teal' },
  { key: 'LATE',           label: 'Overdue',    icon: Lock,         color: 'red' },
  { key: 'CLOSED',         label: 'Closed',     icon: CheckCheck,   color: 'teal' },
];

function getActiveStep(order) {
  if (!order) return 0;
  const { status, kanbanCategory, invoiceStatus } = order;
  if (invoiceStatus === 'Invoiced' && kanbanCategory !== 'Late') return 6; // Closed
  if (kanbanCategory === 'Late')    return 5;
  if (kanbanCategory === 'Return')  return 4; // Active
  if (kanbanCategory === 'Pickup')  return 3;
  if (status === 'SALE_ORDER')      return 2;
  if (status === 'QUOTATION_SENT')  return 1;
  return 0;
}

const COLOR_MAP = {
  gray:   { active: 'bg-gray-500 border-gray-500',    text: 'text-gray-400',   line: 'bg-gray-500' },
  violet: { active: 'bg-accent-violet border-accent-violet shadow-glow-violet', text: 'text-accent-violet', line: 'bg-accent-violet' },
  teal:   { active: 'bg-accent-teal border-accent-teal shadow-glow-subtle',    text: 'text-accent-teal',   line: 'bg-accent-teal' },
  red:    { active: 'bg-red-500 border-red-500',      text: 'text-red-400',    line: 'bg-red-500' },
};

export default function RentalJourneyTimeline({ order }) {
  const activeStep = getActiveStep(order);

  return (
    <div className="glass-premium rounded-2xl p-5 border border-[#1C2438]">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-5">
        Rental Journey
      </h4>

      <div className="relative">
        {/* Connecting line track */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#1C2438] z-0" />
        {/* Filled progress line */}
        <div
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-accent-teal to-accent-violet z-0 transition-all duration-1000"
          style={{ width: `calc(${(activeStep / (STAGES.length - 1)) * 100}% - ${activeStep === STAGES.length - 1 ? '40px' : '0px'})` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between z-10">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isDone    = i < activeStep;
            const isCurrent = i === activeStep;
            const colorConfig = COLOR_MAP[stage.color];

            return (
              <div key={stage.key} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                {/* Circle */}
                <div className={`
                  relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500
                  ${isDone    ? `bg-accent-teal border-accent-teal shadow-glow-subtle` : ''}
                  ${isCurrent ? `${colorConfig.active} animate-breathe` : ''}
                  ${!isDone && !isCurrent ? 'bg-[#0D1117] border-[#1C2438]' : ''}
                `}>
                  <Icon className={`h-4 w-4 ${
                    isDone || isCurrent ? 'text-white' : 'text-gray-600'
                  }`} />
                  {/* Pulse ring for current */}
                  {isCurrent && (
                    <div className={`absolute inset-[-4px] rounded-full border-2 ${
                      stage.color === 'red' ? 'border-red-500/40' : stage.color === 'violet' ? 'border-accent-violet/40' : 'border-accent-teal/40'
                    } animate-pulse-glow`} />
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${
                    isDone    ? 'text-accent-teal' :
                    isCurrent ? colorConfig.text :
                    'text-gray-600'
                  }`}>
                    {stage.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status label */}
      <div className="mt-4 pt-3 border-t border-[#1C2438] text-center">
        <p className="text-[10px] text-gray-500">
          Current stage: <span className="font-bold text-white">{STAGES[activeStep].label}</span>
          {activeStep === 5 && <span className="ml-2 text-red-400 font-bold animate-pulse">⚠️ Overdue</span>}
        </p>
      </div>
    </div>
  );
}
