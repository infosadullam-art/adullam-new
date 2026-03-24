import { redirect } from 'next/navigation'

export default function LoginRedirect() {
  // Redirige automatiquement vers la page de connexion utilisateur
  redirect('/account?mode=login')
}