"use client";

import { useEffect, useState } from "react";

export function StatusBar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dubai',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date())
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="status-bar" className="fixed bottom-0 left-0 w-full z-40 bg-[#000000] border-t border-[#ffffff] flex flex-col sm:flex-row items-center justify-between text-[#ffffff] text-[10px] font-bold uppercase tracking-widest">
      
      {/* Left side */}
      <div className="flex w-full sm:w-auto items-center justify-center sm:justify-start px-4 py-3 sm:py-0 border-b sm:border-b-0 sm:border-r border-[#ffffff] sm:h-12">
        <span>LOC: DXB · TIME: {time || "--:--"}</span>
      </div>
      
      {/* Center */}
      <div className="hidden md:flex flex-1 items-center justify-center h-12 px-4 border-r border-[#ffffff]">
        <span>STATUS: AVAILABLE FOR AI ENGINEERING ROLES</span>
      </div>

      {/* Right side */}
      <div className="flex w-full sm:w-auto sm:h-12 border-t sm:border-t-0 border-[#ffffff]">
        <a 
          href="mailto:taaqib.masood@icloud.com" 
          className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 sm:py-0 border-r border-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] transition-colors"
        >
          EMAIL
        </a>
        <a 
          href="https://wa.me/971501330057?text=Hi%20Taaqib%2C%20I%20reviewed%20your%20portfolio." 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 sm:py-0 hover:bg-[#ffffff] hover:text-[#000000] transition-colors"
        >
          WHATSAPP
        </a>
      </div>
    </div>
  );
}
