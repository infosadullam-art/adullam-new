export default function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Conditions générales de vente</h1>
      <p className="mb-4">En vigueur au 6 mai 2026</p>
      
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Article 1 - Champ d'application</h2>
          <p>Les présentes conditions générales de vente s'appliquent à toutes les ventes effectuées sur le site Adullam (adullamarket.com), édité par Adullam Global (société en cours d'immatriculation).</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Article 2 - Prix et commandes</h2>
          <p>Les prix sont indiqués en dollars US (USD). Les commandes sont validées après paiement effectif.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Article 3 - Livraison</h2>
          <p>Les délais de livraison sont indiqués lors de la commande. Adullam Global ne peut être tenu responsable des retards de livraison indépendants de sa volonté.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Article 4 - Rétractation</h2>
          <p>Vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Article 5 - Litiges</h2>
          <p>En attendant l'immatriculation définitive, tout litige sera traité à l'amiable. Contactez-nous à contact@adullamarket.com.</p>
        </section>

        <section className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">⚠️ Information temporaire</h2>
          <p className="text-yellow-700">
            Ces CGV seront mises à jour après l'immatriculation officielle de la société.
          </p>
        </section>
      </div>
    </div>
  )
}