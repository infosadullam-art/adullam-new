export default function RetoursPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Politique de retours</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Délai de rétractation</h2>
          <p>Vous disposez de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Conditions d'éligibilité</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Produit non utilisé, dans son emballage d'origine</li>
            <li>Étiquettes et accessoires intacts</li>
            <li>Produits personnalisés non remboursables</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Comment retourner un produit ?</h2>
          <p>1. Contactez-nous à retours@adullamarket.com</p>
          <p>2. Nous vous fournissons l'adresse de retour</p>
          <p>3. Expédiez le colis (les frais de retour sont à votre charge)</p>
          <p>4. Le remboursement est effectué sous 14 jours après réception</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Produits défectueux</h2>
          <p>Si votre produit est défectueux, contactez-nous immédiatement. Nous prendrons en charge les frais de retour et d'échange.</p>
        </section>
      </div>
    </div>
  )
}