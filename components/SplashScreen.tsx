'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Vérifier si on est en mode PWA (installée sur mobile)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    // Si navigateur desktop classique, ne pas afficher
    if (!isPWA) {
      setShow(false);
      return;
    }

    // Disparaît après 2 secondes
    const timer = setTimeout(() => setShow(false), 2000);
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