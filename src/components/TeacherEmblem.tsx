import React from 'react';

interface TeacherEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
}

export const TeacherEmblem: React.FC<TeacherEmblemProps> = ({
  size = 'md',
  showOnlineStatus = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const badgeSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {/* Outer British Crown Ring */}
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-[#0b1b3d] via-[#1b365d] to-[#c8102e] p-0.5 shadow-md flex items-center justify-center`}
      >
        <div className="w-full h-full bg-[#0b1b3d] rounded-[14px] flex flex-col items-center justify-center text-white relative overflow-hidden">
          {/* Subtle British cross lines in background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute inset-0 bg-[#c8102e] w-full h-[2px] top-1/2 -translate-y-1/2"></div>
            <div className="absolute inset-0 bg-[#c8102e] w-[2px] h-full left-1/2 -translate-x-1/2"></div>
          </div>

          {/* Monogram Initials TM with Royal Accent */}
          <span className="font-black tracking-wider text-amber-300 drop-shadow-sm select-none">
            TM
          </span>
        </div>
      </div>

      {/* Online indicator */}
      {showOnlineStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${badgeSize[size]} bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm`}
          title="Teacher Marcelo Online"
        ></span>
      )}
    </div>
  );
};
