'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Vérifier si c'est une PWA installée sur mobile
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Vérifier si le splash a déjà été montré pendant cette session
    const splashShown = sessionStorage.getItem('splashShown');
    
    // Afficher UNIQUEMENT sur mobile PWA et UNE SEULE FOIS par session
    if (isPWA && isMobile && !splashShown) {
      setShow(true);
      sessionStorage.setItem('splashShown', 'true');
      
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
    
    setShow(false);
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