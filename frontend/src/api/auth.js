import http, { unwrap } from './axios';

// Lit le contenu d'un jeton JWT (utile si le serveur n'envoie pas l'utilisateur)
function decodeJwt(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part));
  } catch {
    return null;
  }
}

// POST /auth/login  { email, mot_de_passe }  ->  { token, user }
export async function login(email, mot_de_passe) {
  const data = await http.post('/auth/login', { email, mot_de_passe }).then(unwrap);
  const token = data?.token ?? data?.accessToken;
  if (!token) throw new Error('Réponse de connexion inattendue : jeton manquant.');
  const user = data.user ?? data.utilisateur ?? decodeJwt(token) ?? { email };
  return { token, user };
}

export const me = () => http.get('/auth/me').then(unwrap);
