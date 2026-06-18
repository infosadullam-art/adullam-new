// components/OfferBanner.tsx
// Bannière d'offre épurée et professionnelle

'use client'

interface OfferBannerProps {
  discount: number
  timeLimit: number
  message?: string
  onAccept?: () => void
  onDecline?: () => void
  variant?: 'safe' | 'risky' | 'urgent'
  className?: string
}

export function OfferBanner({
  discount,
  timeLimit,
  message,
  onAccept,
  onDecline,
  variant = 'safe',
  className = '',
}: OfferBannerProps) {
  const colors = {
    safe: {
      bg: 'bg-gray-900',
      text: 'text-white',
      accent: 'bg-gray-700',
      button: 'bg-white text-gray-900 hover:bg-gray-100',
      timer: 'text-gray-400',
    },
    risky: {
      bg: 'bg-red-600',
      text: 'text-white',
      accent: 'bg-red-500',
      button: 'bg-white text-red-600 hover:bg-gray-100',
      timer: 'text-red-200',
    },
    urgent: {
      bg: 'bg-orange-600',
      text: 'text-white',
      accent: 'bg-orange-500',
      button: 'bg-white text-orange-600 hover:bg-gray-100',
      timer: 'text-orange-200',
    },
  }

  const style = colors[variant] || colors.safe

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`fixed bottom-24 right-6 z-50 max-w-xs w-full rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${style.bg} ${className}`}
      style={{
        animation: 'slideUp 0.4s ease-out',
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${style.text} leading-tight`}>
              {message || `-${discount}% sur votre commande`}
            </p>
            <p className={`text-xs ${style.timer} mt-1 opacity-80`}>
              ⏱️ {formatTime(timeLimit)}
            </p>
          </div>
          <button
            onClick={() => {
              if (onDecline) onDecline()
            }}
            className={`text-xs ${style.text} opacity-60 hover:opacity-100 transition-opacity`}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              if (onAccept) onAccept()
            }}
            className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${style.button}`}
          >
            Profiter
          </button>
          <button
            onClick={() => {
              if (onDecline) onDecline()
            }}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${style.text} opacity-60 hover:opacity-100`}
          >
            Plus tard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}