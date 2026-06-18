// Dans ChatbotWidget.tsx
import { OfferBanner } from '@/components/OfferBanner'

// ...
{showOfferBanner && activeOffer && (
  <OfferBanner
    discount={activeOffer.discount_2}
    timeLimit={offerTimer}
    message={activeOffer.taunt_message || `-${activeOffer.discount_2}% si vous validez maintenant !`}
    variant={activeOffer.type === 'risky' ? 'risky' : 'safe'}
    onAccept={() => {
      // Rediriger vers le panier
      window.location.href = '/cart'
    }}
    onDecline={() => {
      setShowOfferBanner(false)
      setActiveOffer(null)
    }}
  />
)}