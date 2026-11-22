// Token de admin fica só na sessão do navegador (nunca no bundle): o servidor exige
// `Authorization: Bearer <ADMIN_TOKEN>` nas rotas de administrador.
const KEY = 'code-street:admin-token';

const read = () => {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

const save = (token) => {
  try {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  } catch {
    // sessão indisponível (modo privado): o token vale só para esta chamada
  }
};

const withAuth = (options, token) => ({
  ...options,
  headers: { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});

// Chamadas paralelas que recebem 401 juntas perguntam o token uma vez só.
let asking = null;
const askToken = () => {
  if (!asking) {
    asking = Promise.resolve(window.prompt('Token de administrador (ADMIN_TOKEN):') || '').finally(() => {
      asking = null;
    });
  }
  return asking;
};

/** fetch para rotas de admin: manda o token salvo e, num 401, pede o token e tenta de novo uma vez. */
export async function adminFetch(url, options = {}) {
  const res = await fetch(url, withAuth(options, read()));
  if (res.status !== 401) return res;
  save('');
  const token = (await askToken()).trim();
  if (!token) return res;
  const retry = await fetch(url, withAuth(options, token));
  if (retry.ok) save(token);
  return retry;
}
