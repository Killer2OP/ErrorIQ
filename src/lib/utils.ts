import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return '$' + (amount / 1000).toFixed(1) + 'K';
  }
  return '$' + amount.toFixed(0);
}

export function formatPercentage(value: number): string {
  return value.toFixed(0) + '%';
}

export function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return (ms / 1000).toFixed(1) + 's';
  }
  return ms + 'ms';
}

export function formatTimeAgo(input: number): string {
  // If input looks like a timestamp (large number), convert to minutes ago
  let minutes: number;
  if (input > 1000000000) {
    // It's a timestamp
    minutes = Math.floor((Date.now() - input) / (1000 * 60));
  } else {
    // It's already in minutes
    minutes = input;
  }
  
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

export function getStatusColor(status: 'healthy' | 'warning' | 'degraded' | 'critical'): string {
  switch (status) {
    case 'healthy':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'degraded':
    case 'critical':
      return 'text-error';
    default:
      return 'text-text-secondary';
  }
}

export function getProgressBarColor(percentage: number): string {
  if (percentage >= 90) return 'progress-bar-red';
  if (percentage >= 70) return 'progress-bar-amber';
  return 'progress-bar-blue';
}

export function getSimilarityColor(similarity: number): string {
  if (similarity >= 95) return 'bg-success';
  if (similarity >= 80) return 'bg-info';
  return 'bg-text-tertiary';
}

export function getSimilarityTextColor(similarity: number): string {
  if (similarity >= 95) return 'text-success';
  if (similarity >= 80) return 'text-info';
  return 'text-text-tertiary';
}

// Animation delay helper for staggered animations
export function getStaggerDelay(index: number, baseDelay: number = 0.1): string {
  return `${index * baseDelay}s`;
}
