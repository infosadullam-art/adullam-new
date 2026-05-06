export default function CarrieresPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Carrières</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Rejoignez l'aventure</h2>
          <p>Adullam grandit et recherche des talents passionnés pour connecter l'Afrique aux opportunités mondiales.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Postes ouverts</h2>
          <ul className="space-y-3">
            <li className="border-b pb-2">
              <h3 className="font-semibold">Développeur Full Stack</h3>
              <p className="text-sm text-gray-600">Remote (Côte d'Ivoire) - CDI</p>
            </li>
            <li className="border-b pb-2">
              <h3 className="font-semibold">Chargé de clientèle</h3>
              <p className="text-sm text-gray-600">Abidjan - CDI</p>
            </li>
            <li className="border-b pb-2">
              <h3 className="font-semibold">Logisticien / Coordinateur export</h3>
              <p className="text-sm text-gray-600">Remote - Freelance</p>
            </li>
          </ul>
        </section>
        
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Candidature spontanée</h2>
          <p>Vous ne trouvez pas de poste correspondant ? Envoyez-nous votre CV à <strong>jobs@adullamarket.com</strong></p>
        </section>
      </div>
    </div>
  )
}