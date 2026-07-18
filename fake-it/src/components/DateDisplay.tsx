'use client';

import { useEffect, useState } from 'react';

export function DateDisplay() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }));
  }, []);

  return (
    <div className="px-4 py-2 text-center min-h-[20px]">
      {date && <p className="text-xs text-warm-gray">{date}</p>}
    </div>
  );
}
