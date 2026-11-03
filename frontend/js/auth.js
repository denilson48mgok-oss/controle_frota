document.addEventListener('DOMContentLoaded', () => {
  const { token } = window.api.getSession();
  if (token) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  const alertBox = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-btn');

  function showError(message) {
    alertBox.textContent = message;
    alertBox.className = 'alert alert-error show';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.className = 'alert';

    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;

    if (!login || !senha) {
      showError('Preencha login e senha.');
      return;
    }

    submitBtn.disabled = true;
    try {
      const res = await window.api.post('/auth/login', { login, senha });
      const usuario = res.usuario || res.user;
      window.api.setSession({ token: res.token, usuario });
      window.location.href = 'dashboard.html';
    } catch (err) {
      showError(err.message || 'Falha ao autenticar.');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
