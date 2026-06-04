'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Vérifier si on est en mode PWA (installée sur mobile)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    // Si navigateur desktop classique, ne pas afficher
    if (!isPWA) {
      setShow(false);
      return;
    }

    // Disparaît après 2 secondes avec animation
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShow(false), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-logo">
        <img src="/favicon.svg" alt="Adullam" />
      </div>
      <div className="splash-title">
        adul<span className="splash-dot">.</span>lam
      </div>
    </div>
  );
}