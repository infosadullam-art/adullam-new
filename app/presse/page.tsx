export default function PressePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Presse & Médias</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Adullam dans les médias</h2>
          <p>Découvrez nos articles et apparitions médias.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Derniers articles</h2>
          <ul className="space-y-2">
            <li>🔜 Prochainement</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Communiqués de presse</h2>
          <ul className="space-y-2">
            <li>🔜 Prochainement</li>
          </ul>
        </section>
        
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Contact presse</h2>
          <p>Pour toute demande média : <strong>presse@adullamarket.com</strong></p>
          <p className="mt-2">Téléphone : +225 05 64 74 91 51</p>
        </section>
      </div>
    </div>
  )
}