export default function PromotionsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-gradient-to-r from-[#0B1F3F] to-[#1a3a52] rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-12">
          <div className="flex-1">
            <div className="inline-block px-4 py-2 bg-[#FF6B35] text-white text-sm font-bold rounded-full mb-4">
              OFFRE SPÉCIALE
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Jusqu'à -60% sur une sélection</h2>
            <p className="text-lg text-white/90 mb-6">
              Profitez de nos meilleures promotions sur des milliers de produits
            </p>
            <button className="px-8 py-4 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold rounded-lg transition-colors">
              Découvrir les offres
            </button>
          </div>
          <div className="flex-1 flex justify-end">
            <img src="/promo-banner-products.jpg" alt="Promotion" className="w-full max-w-md object-contain" />
          </div>
        </div>
      </div>

      {/* Secondary promotion cards */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-[#FF6B35]/10 rounded-lg p-4 mb-4">
            <img src="/icon-free-shipping.jpg" alt="Livraison gratuite" className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="font-bold text-[#0B1F3F] text-center mb-2">Livraison gratuite</h3>
          <p className="text-sm text-muted-foreground text-center">Sur toutes les commandes de plus de 50,000 XOF</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-[#FF6B35]/10 rounded-lg p-4 mb-4">
            <img src="/icon-secure-payment.jpg" alt="Paiement sécurisé" className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="font-bold text-[#0B1F3F] text-center mb-2">Paiement sécurisé</h3>
          <p className="text-sm text-muted-foreground text-center">Toutes vos transactions sont protégées</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-[#FF6B35]/10 rounded-lg p-4 mb-4">
            <img src="/icon-customer-support.jpg" alt="Support client" className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="font-bold text-[#0B1F3F] text-center mb-2">Support 24/7</h3>
          <p className="text-sm text-muted-foreground text-center">Notre équipe est disponible pour vous aider</p>
        </div>
      </div>
    </section>
  )
}
