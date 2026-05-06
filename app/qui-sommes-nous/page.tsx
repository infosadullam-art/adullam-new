export default function QuiSommesNousPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Qui sommes-nous ?</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Notre mission</h2>
          <p>Adullam connecte les acheteurs africains directement aux usines du monde entier. Nous supprimons les intermédiaires pour offrir les meilleurs prix.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Notre histoire</h2>
          <p>Née de la volonté de faciliter l'accès aux produits internationaux pour les entrepreneurs et particuliers africains, Adullam simplifie l'importation en un clic.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Nos valeurs</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Transparence sur les prix</li>
            <li>Qualité vérifiée</li>
            <li>Livraison sécurisée</li>
            <li>Support client réactif</li>
          </ul>
        </section>
        
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Adullam Global</h2>
          <p>Société en cours d'immatriculation (CCORP - États-Unis)</p>
          <p className="text-sm text-gray-500 mt-2">"Connecter l'Afrique aux usines du monde"</p>
        </section>
      </div>
    </div>
  )
}