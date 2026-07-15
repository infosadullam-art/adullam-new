export function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border mt-auto pb-20 lg:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-foreground/90">À propos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/qui-sommes-nous" className="hover:text-foreground transition-colors duration-200">
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a href="/carrieres" className="hover:text-foreground transition-colors duration-200">
                  Carrières
                </a>
              </li>
              <li>
                <a href="/presse" className="hover:text-foreground transition-colors duration-200">
                  Presse
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-foreground/90">Service client</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/contact" className="hover:text-foreground transition-colors duration-200">
                  Contact
                </a>
              </li>
              <li>
                <a href="/aide" className="hover:text-foreground transition-colors duration-200">
                  Aide
                </a>
              </li>
              <li>
                <a href="/retours" className="hover:text-foreground transition-colors duration-200">
                  Retours
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-foreground/90">Informations légales</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/mentions-legales" className="hover:text-foreground transition-colors duration-200">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/cgv" className="hover:text-foreground transition-colors duration-200">
                  CGV
                </a>
              </li>
              <li>
                <a href="/confidentialite" className="hover:text-foreground transition-colors duration-200">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-foreground transition-colors duration-200">
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 lg:mb-4 text-foreground/90">Suivez-nous</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://facebook.com/adullam" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com/adullam" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com/adullam" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Adullam. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}