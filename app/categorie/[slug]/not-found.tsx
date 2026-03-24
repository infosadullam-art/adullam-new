// app/categorie/[slug]/not-found.tsx
import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Catégorie non trouvée</h2>
        <p className="text-muted-foreground mb-8">
          La catégorie que vous recherchez n'existe pas.
        </p>
        <Link 
          href="/"
          className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}