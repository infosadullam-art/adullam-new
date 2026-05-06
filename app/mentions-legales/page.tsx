export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Éditeur du site</h2>
          <p><strong>Adullam Global</strong> (en cours d'immatriculation)</p>
          <p>Email : contact@adullamarket.com</p>
          <p>Téléphone : +225 05 64 74 91 51</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Hébergement</h2>
          <p>Vercel Inc.</p>
          <p>440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
        </section>

        <section className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">⚠️ Informations temporaires</h2>
          <p className="text-yellow-700">
            Ces mentions légales seront complétées dès l'immatriculation officielle de la société.
          </p>
        </section>
      </div>
    </div>
  )
}