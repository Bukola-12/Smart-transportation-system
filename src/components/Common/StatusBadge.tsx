import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let colorClasses = 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700/50';

  if (norm === 'available' || norm === 'confirmed' || norm === 'active' || norm === 'completed') {
    colorClasses = 'bg-[#E8F8F0] text-[#00A86B] dark:bg-emerald-950/80 dark:text-emerald-400 dark:border dark:border-emerald-800/60 font-semibold';
  } else if (norm === 'on break' || norm === 'break' || norm === 'en route' || norm === 'accepted') {
    colorClasses = 'bg-[#EDF2F7] text-[#2B6CB0] dark:bg-blue-950/80 dark:text-blue-400 dark:border dark:border-blue-800/60 font-semibold';
  } else if (norm === 'on trip' || norm === 'in progress' || norm === 'pending' || norm === 'updated') {
    colorClasses = 'bg-[#FEF6E9] text-[#D97706] dark:bg-amber-950/80 dark:text-amber-400 dark:border dark:border-amber-800/60 font-semibold';
  } else if (norm === 'unconfirmed' || norm === 'stale') {
    colorClasses = 'bg-[#F3F4F6] text-[#6B7280] dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700/60 font-semibold';
  } else if (norm === 'needs review' || norm === 'flagged') {
    colorClasses = 'bg-[#FEF3C7] text-[#92400E] dark:bg-yellow-950/90 dark:text-yellow-300 dark:border dark:border-yellow-700/60 font-semibold';
  } else if (norm === 'cancelled' || norm === 'rejected' || norm === 'suspended') {
    colorClasses = 'bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400 dark:border dark:border-red-800/60 font-semibold';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  return (
    <span className={`inline-flex items-center rounded-full capitalize leading-tight ${sizeClasses} ${colorClasses} shadow-xs`}>
      {status}
    </span>
  );
};
