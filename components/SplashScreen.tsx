'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isPWA) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <img src="/favicon.svg" alt="Adullam" />
      </div>
      <div className="splash-title">
        adul<span className="splash-dot">.</span>lam
      </div>
    </div>
  );
}