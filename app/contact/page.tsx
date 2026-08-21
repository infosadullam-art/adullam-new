export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Nous contacter</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Par email</h2>
          <p>contact@adullamarket.com</p>
          
          <h2 className="text-xl font-semibold mt-4">Formulaire</h2>
          <form className="space-y-3">
            <input type="text" placeholder="Votre nom" className="w-full p-2 border rounded" />
            <input type="email" placeholder="Votre email" className="w-full p-2 border rounded" />
            <textarea placeholder="Votre message" rows={4} className="w-full p-2 border rounded" />
            <button type="submit" className="bg-[#2B4F3C] text-white px-4 py-2 rounded hover:bg-[#3A6B4E]">Envoyer</button>
          </form>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Retour rapide</h2>
          <p>Nous répondons sous 24h ouvrées.</p>
          <p className="text-sm text-gray-500">Pour toute question sur une commande, merci d'indiquer votre numéro de commande.</p>
        </div>
      </div>
    </div>
  )
}