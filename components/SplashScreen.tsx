'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Détecter si c'est une PWA installée (mobile) OU un navigateur desktop
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Afficher le splash UNIQUEMENT sur mobile PWA
    if (!isPWA || !isMobile) {
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