/**
 * NeoRent AI Rental Risk Oracle
 * Pure heuristic engine — no API required.
 * Returns a risk score 0-100 and breakdown.
 */

export function computeRiskScore(order, allOrders = []) {
  let score = 0;
  const breakdown = [];

  // Factor 1: Rental duration (longer = higher risk)
  const items = order.items || order.orderLines || [];
  const days = items[0]?.rentalDuration || 1;
  const daysScore = Math.min(days * 2, 25);
  score += daysScore;
  if (daysScore > 0) breakdown.push({ label: 'Rental duration', points: daysScore });

  // Factor 2: Order value (higher value = higher risk)
  const value = order.total || order.totalAmount || 0;
  const valueScore = value > 50000 ? 25 : value > 10000 ? 18 : value > 1000 ? 10 : 4;
  score += valueScore;
  breakdown.push({ label: 'Order value', points: valueScore });

  // Factor 3: Customer past late orders
  const customerOrders = allOrders.filter(
    o => o.customerEmail === order.customerEmail && o.orderId !== order.orderId
  );
  const lateCount = customerOrders.filter(o => o.kanbanCategory === 'Late').length;
  const lateScore = Math.min(lateCount * 18, 36);
  if (lateScore > 0) { score += lateScore; breakdown.push({ label: `Late history (×${lateCount})`, points: lateScore }); }

  // Factor 4: Delivery method (shipping = vendor has less physical control)
  if (order.deliveryOption === 'shipping' || order.deliveryMethod === 'Standard Delivery') {
    score += 8;
    breakdown.push({ label: 'Remote delivery', points: 8 });
  }

  // Factor 5: Kanban already Late
  if (order.kanbanCategory === 'Late') {
    score += 20;
    breakdown.push({ label: 'Currently overdue', points: 20 });
  }

  // Factor 6: Positive trust signals (discounts = engaged customer)
  if (order.discount && order.discount > 0) {
    score -= 5;
    breakdown.push({ label: 'Loyalty discount', points: -5 });
  }

  return {
    score: Math.min(Math.max(Math.round(score), 0), 100),
    breakdown,
  };
}

export function getRiskLevel(score) {
  if (score < 30) return { label: 'SAFE',    color: 'teal',   icon: '🟢', textColor: 'text-accent-teal',   bgColor: 'bg-accent-teal/10',   borderColor: 'border-accent-teal/30' };
  if (score < 65) return { label: 'CAUTION', color: 'gold',   icon: '🟡', textColor: 'text-accent-gold',   bgColor: 'bg-accent-gold/10',   borderColor: 'border-accent-gold/30' };
  return              { label: 'HIGH RISK', color: 'red',    icon: '🔴', textColor: 'text-red-400',       bgColor: 'bg-red-500/10',       borderColor: 'border-red-500/30' };
}
