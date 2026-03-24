export function Footer() {
  return (
    <footer className="bg-[#0F2A44] text-white mt-auto pb-20 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-white">À propos</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-white">
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Carrières
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Presse
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-white">Service client</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Aide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Retours
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-white">Vendez</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-white">
                  Devenir vendeur
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Publier une annonce
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Espace vendeur
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-white">Suivez-nous</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-white">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-white/70">
          <p>&copy; 2025 Adullam. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}