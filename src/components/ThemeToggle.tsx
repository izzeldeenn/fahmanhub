'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`w-48 aspect-video rounded-xl border-4 border-[#121331] scale-40 ${
        theme === 'dark' ? 'bg-[#ebe6ef]' : 'bg-[#ebe6ef]'
      }`}
    >
      <div className="flex h-full w-full px-2 items-center gap-x-2">
        <div
          className="w-6 h-6 flex-shrink-0 rounded-full border-4 border-[#121331]"
        ></div>
        <label
          className={`w-full h-10 border-4 border-[#121331] rounded cursor-pointer ${
            theme === 'dark' ? 'scale-x-[-1]' : ''
          }`}
        >
          <input 
            type="checkbox" 
            checked={theme === 'dark'}
            onChange={toggleTheme}
            className="hidden" 
          />
          <div className={`w-full h-full relative ${
            theme === 'dark' ? 'bg-[#f24c00]' : 'bg-[#f24c00]'
          }`}>
            <div
              className="w-0 h-0 z-20 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[20px] border-t-[#121331] relative"
            >
              <div
                className="w-0 h-0 absolute border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[15px] border-t-[#e44901] -top-5 -left-[18px]"
              ></div>
            </div>
            <div
              className={`w-[24px] h-9 z-10 absolute top-[9px] left-0 border-r-2 border-b-4 border-[#121331] transform skew-y-[39deg] ${
                theme === 'dark' ? 'bg-[#f24c00]' : 'bg-[#f24c00]'
              }`}
            ></div>
            <div
              className={`w-[25px] h-9 z-10 absolute top-[9px] left-[24px] border-r-4 border-l-2 border-b-4 border-[#121331] transform skew-y-[-39deg] ${
                theme === 'dark' ? 'bg-[#c44002]' : 'bg-[#c44002]'
              }`}
            ></div>
          </div>
        </label>
        <div className="w-6 h-1 flex-shrink-0 bg-[#121331] rounded-full"></div>
      </div>
    </div>
  );
}
