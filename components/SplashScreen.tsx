'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <img src="/favicon.svg" alt="ADULLAM" />
      </div>
      <div className="splash-title">ADULLAM</div>
    </div>
  );
}