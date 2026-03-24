"use client";

import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';

export default function TestSentryPage() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    const sendTestMessage = async () => {
      try {
        // Utilisez startSpan pour mieux suivre l'opération dans Sentry
        // et capturer d'éventuelles erreurs d'envoi.
        await Sentry.startSpan(
          {
            name: 'Test Sentry Message',
            op: 'ui.test',
          },
          async () => {
            const eventId = Sentry.captureMessage("🧪 Test frontend Sentry - Page chargée", {
              level: 'info',
              tags: { test: 'frontend-page' }
            });

            // Optionnel: vérifier que l'eventId est bien généré
            if (eventId) {
              console.log(`✅ Message capturé avec l'ID: ${eventId}`);
              setStatus(`✅ Message capturé (ID: ${eventId})`);
            } else {
              throw new Error("Sentry n'a pas généré d'ID d'événement.");
            }
          }
        );
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi à Sentry:", error);
        setStatus('❌ Échec de l\'envoi à Sentry');
      }
    };

    sendTestMessage();
  }, []);

  const triggerError = () => {
    try {
      throw new Error("🧪 Erreur de test volontaire");
    } catch (error) {
      const eventId = Sentry.captureException(error);
      setStatus(`✅ Erreur envoyée à Sentry (ID: ${eventId})`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🧪 Test Sentry Frontend</h1>
      <p>DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Configuré' : '❌ Manquant'}</p>
      <p>Status: {status}</p>
      
      <button 
        onClick={triggerError}
        style={{
          padding: '10px 20px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Tester une erreur
      </button>
    </div>
  );
}