export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>
      <p className="mb-4">Dernière mise à jour : 6 mai 2026</p>
      
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Collecte des données</h2>
          <p>Nous collectons les informations nécessaires au traitement de vos commandes (nom, email, adresse, téléphone).</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Utilisation des données</h2>
          <p>Vos données sont utilisées uniquement pour :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Traiter vos commandes</li>
            <li>Gérer votre compte client</li>
            <li>Vous informer sur vos achats</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Sécurité</h2>
          <p>Nous mettons en œuvre des mesures de sécurité pour protéger vos données.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Vos droits</h2>
          <p>Vous pouvez accéder, modifier ou supprimer vos données en nous contactant à contact@adullamarket.com.</p>
        </section>
      </div>
    </div>
  )
}