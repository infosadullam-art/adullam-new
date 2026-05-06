export default function AidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Centre d'aide</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Comment passer une commande ?</h2>
          <p>1. Ajoutez les produits souhaités au panier</p>
          <p>2. Choisissez la quantité (respectez la MOQ)</p>
          <p>3. Sélectionnez votre mode de livraison (Mer, Air, Express)</p>
          <p>4. Validez votre commande et procédez au paiement</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Quels sont les modes de livraison ?</h2>
          <p><strong>Maritime (bateau)</strong> : 45-50 jours - Économique</p>
          <p><strong>Aérien (avion)</strong> : 15-17 jours - Rapide</p>
          <p><strong>Express</strong> : 7-10 jours - Très rapide</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Puis-je suivre ma commande ?</h2>
          <p>Oui, vous recevez un numéro de suivi par email dès l'expédition.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Que faire en cas de problème ?</h2>
          <p>Contactez-nous via la page <a href="/contact" className="text-[#2B4F3C] underline">Contact</a> avec votre numéro de commande.</p>
        </section>
      </div>
    </div>
  )
}