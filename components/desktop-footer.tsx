export default function DesktopFooter() {
  return (
    <footer className="hidden lg:block bg-[#0B1F3F] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">À propos</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Carrières
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Presse
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Service client</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Aide & Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Retours
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Suivi de commande
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Livraison
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Informations</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Conditions générales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Suivez-nous</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B35]">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex items-center justify-between text-sm text-white/60">
          <p>&copy; 2025 Adullam. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <img src="/payment-visa.jpg" alt="Visa" className="h-6" />
            <img src="/payment-mastercard.jpg" alt="Mastercard" className="h-6" />
            <img src="/payment-mobile-money.jpg" alt="Mobile Money" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  )
}
