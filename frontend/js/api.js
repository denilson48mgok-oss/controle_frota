const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://localhost:3000';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const msg = data?.message || data?.error || `Erro HTTP ${response.status}`;

    if (response.status === 401 && path !== '/auth/login') {
      clearSession();
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
    }

    const err = new Error(msg);
    err.status = response.status;
    err.details = data?.details;
    throw err;
  }

  return data;
}

function setSession({ token, usuario }) {
  localStorage.setItem('token', token);
  localStorage.setItem('perfil', usuario.perfil);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function getSession() {
  const token = localStorage.getItem('token');
  const perfil = localStorage.getItem('perfil');
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch {
    usuario = null;
  }
  return { token, perfil, usuario };
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('perfil');
  localStorage.removeItem('usuario');
}

function requireAuth() {
  const session = getSession();
  if (!session.token) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

window.api = {
  baseUrl: API_BASE_URL,
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  setSession,
  getSession,
  clearSession,
  requireAuth,
};
