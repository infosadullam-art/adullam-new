export default function DesktopHero() {
  return (
    <section className="relative bg-gradient-to-r from-[#1a4d4d] via-[#0d3a3a] to-[#1a4d4d] text-white overflow-hidden">
      {/* Christmas decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-10 left-20 text-6xl">✨</div>
        <div className="absolute top-32 right-32 text-4xl">⭐</div>
        <div className="absolute bottom-20 left-40 text-5xl">✨</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Offres exceptionnelles :<br />
              dernière chance
            </h1>
            <ul className="space-y-4 mb-8 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-[#FF6B35] text-2xl mt-1">•</span>
                <span>Prix de gros imbattables</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF6B35] text-2xl mt-1">•</span>
                <span>
                  Quantités limitées, ne manquez pas
                  <br />
                  les meilleures affaires
                </span>
              </li>
            </ul>
            <button className="px-8 py-4 bg-[#FF6B35] hover:bg-[#ff5722] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl">
              Découvrir toutes les offres
            </button>
          </div>

          <div className="relative">
            <img
              src="/images/file-00000000845c7243bedae928bb1acbf5.png"
              alt="Cadeaux de Noël"
              className="w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
