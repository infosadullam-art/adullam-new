export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Gestion des cookies</h1>
      
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Qu'est-ce qu'un cookie ?</h2>
          <p>Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Cookies utilisés</h2>
          <ul className="list-disc list-inside mt-2">
            <li>Cookies essentiels (panier, connexion)</li>
            <li>Cookies de session</li>
            <li>Cookies d'analyse (amélioration du site)</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Gestion des cookies</h2>
          <p>Vous pouvez configurer votre navigateur pour refuser les cookies.</p>
        </section>
      </div>
    </div>
  )
}