import React, { useState, useEffect } from 'react';

export const HeaderClock: React.FC<{ className?: string; id?: string; hour12?: boolean }> = ({
  className = 'sidebar-clock',
  id = 'headerClock',
  hour12 = true,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (hour12 === false) {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        setTimeStr(`${hh}:${mm}:${ss}`);
      } else {
        let h = now.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        setTimeStr(`${h}:${mm}:${ss} ${ampm}`);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [hour12]);

  return (
    <span className={className} id={id}>
      {timeStr}
    </span>
  );
};

