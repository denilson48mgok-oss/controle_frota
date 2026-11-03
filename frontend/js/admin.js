(function () {
  let usuariosCache = [];
  let reativacoesCache = [];

  function showAdminMessage(message, isError = false) {
    const alertBox = document.getElementById('admin-alert');
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert ${isError ? 'alert-error' : 'alert-success'} show`;
  }

  function configurarSelectPerfil(perfilLogado) {
    const select = document.getElementById('usuario-perfil');
    if (!select) return;
    select.innerHTML = '';

    if (perfilLogado === 'MASTER') {
      select.innerHTML = `
        <option value="GERAL">GERAL</option>
        <option value="ADMIN">ADMIN</option>
      `;
      select.disabled = false;
    } else {
      select.innerHTML = '<option value="GERAL">GERAL</option>';
      select.value = 'GERAL';
      select.disabled = true;
    }
  }

  function renderReativacoes() {
    const tbody = document.getElementById('reativacoes-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const pendentes = reativacoesCache.filter((r) => r.status === 'PENDENTE');
    if (pendentes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação pendente.</td></tr>';
      return;
    }

    pendentes.forEach((r) => {
      const tr = document.createElement('tr');
      const solicitanteNome = r.solicitante ? `${r.solicitante.nome} (${r.solicitante.login})` : `#${r.solicitante_id}`;

      tr.innerHTML = `
        <td>#${r.id}</td>
        <td>${r.tipo_entidade} #${r.entidade_id}</td>
        <td>${r.motivo}</td>
        <td>${solicitanteNome}</td>
        <td><span class="badge badge-pendente">${r.status}</span></td>
        <td>
          <div class="actions" data-reativacao-actions="${r.id}"></div>
        </td>
      `;

      const actionsEl = tr.querySelector(`[data-reativacao-actions="${r.id}"]`);

      const aprovarBtn = document.createElement('button');
      aprovarBtn.type = 'button';
      aprovarBtn.className = 'btn-success btn-sm';
      aprovarBtn.textContent = 'Aprovar';
      aprovarBtn.addEventListener('click', () => aprovarSolicitacao(r.id));

      const rejeitarBtn = document.createElement('button');
      rejeitarBtn.type = 'button';
      rejeitarBtn.className = 'btn-danger btn-sm';
      rejeitarBtn.textContent = 'Rejeitar';
      rejeitarBtn.addEventListener('click', () => rejeitarSolicitacao(r.id));

      actionsEl.appendChild(aprovarBtn);
      actionsEl.appendChild(rejeitarBtn);
      tbody.appendChild(tr);
    });
  }

  function renderUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    usuariosCache.forEach((u) => {
      const tr = document.createElement('tr');
      const statusBadge = u.ativo
        ? '<span class="badge badge-ativo">Ativo</span>'
        : '<span class="badge badge-inativo">Inativo</span>';

      tr.innerHTML = `
        <td>#${u.id}</td>
        <td>${u.nome}</td>
        <td>${u.login}</td>
        <td>${u.cpf}</td>
        <td><strong>${u.perfil}</strong></td>
        <td>${statusBadge}</td>
        <td>
          <div class="actions" data-usuario-actions="${u.id}"></div>
        </td>
      `;

      const actionsEl = tr.querySelector(`[data-usuario-actions="${u.id}"]`);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-secondary btn-sm';
      editBtn.textContent = 'Editar';
      editBtn.disabled = u.ativo === false || u.perfil === 'MASTER';
      editBtn.addEventListener('click', () => preencherFormularioUsuario(u));
      actionsEl.appendChild(editBtn);

      if (u.ativo && u.perfil !== 'MASTER') {
        const baixaBtn = document.createElement('button');
        baixaBtn.type = 'button';
        baixaBtn.className = 'btn-danger btn-sm';
        baixaBtn.textContent = 'Dar Baixa';
        baixaBtn.addEventListener('click', () => darBaixaUsuario(u.id));
        actionsEl.appendChild(baixaBtn);
      } else if (!u.ativo) {
        const reativarBtn = document.createElement('button');
        reativarBtn.type = 'button';
        reativarBtn.className = 'btn-success btn-sm';
        reativarBtn.textContent = 'Reativar';
        reativarBtn.addEventListener('click', () => reativarUsuarioDireto(u.id));
        actionsEl.appendChild(reativarBtn);
      }

      tbody.appendChild(tr);
    });
  }

  function preencherFormularioUsuario(u) {
    document.getElementById('usuario-id').value = u.id;
    document.getElementById('usuario-nome').value = u.nome;
    document.getElementById('usuario-login').value = u.login;
    document.getElementById('usuario-cpf').value = u.cpf;
    document.getElementById('usuario-senha').value = '';
    document.getElementById('usuario-senha').required = false;

    const { perfil } = window.api.getSession();
    configurarSelectPerfil(perfil);
    const select = document.getElementById('usuario-perfil');
    if (perfil === 'MASTER') {
      select.value = u.perfil === 'ADMIN' ? 'ADMIN' : 'GERAL';
    }

    document.getElementById('usuario-form-title').textContent = `Editar Usuário #${u.id}`;
    document.getElementById('usuario-cancel-btn').classList.remove('hidden');
  }

  function resetFormularioUsuario() {
    document.getElementById('usuario-form').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-senha').required = true;
    const { perfil } = window.api.getSession();
    configurarSelectPerfil(perfil);
    document.getElementById('usuario-form-title').textContent = 'Gerenciar Usuários';
    document.getElementById('usuario-cancel-btn').classList.add('hidden');
  }

  async function carregarDadosAdmin() {
    try {
      const [reativacoes, usuarios] = await Promise.all([
        window.api.get('/reativacoes'),
        window.api.get('/usuarios'),
      ]);
      reativacoesCache = reativacoes;
      usuariosCache = usuarios;
      renderReativacoes();
      renderUsuarios();
    } catch (err) {
      showAdminMessage(err.message || 'Erro ao carregar dados administrativos.', true);
    }
  }

  async function aprovarSolicitacao(id) {
    try {
      await window.api.patch(`/reativacoes/${id}/aprovar`);
      showAdminMessage('Solicitação aprovada e registro reativado.');
      await carregarDadosAdmin();
    } catch (err) {
      showAdminMessage(err.message, true);
    }
  }

  async function rejeitarSolicitacao(id) {
    try {
      await window.api.patch(`/reativacoes/${id}/rejeitar`);
      showAdminMessage('Solicitação rejeitada.');
      await carregarDadosAdmin();
    } catch (err) {
      showAdminMessage(err.message, true);
    }
  }

  async function darBaixaUsuario(id) {
    try {
      await window.api.patch(`/usuarios/${id}/baixa`);
      showAdminMessage('Usuário inativado com sucesso.');
      await carregarDadosAdmin();
    } catch (err) {
      showAdminMessage(err.message, true);
    }
  }

  async function reativarUsuarioDireto(id) {
    try {
      await window.api.patch(`/usuarios/${id}/reativar`);
      showAdminMessage('Usuário reativado com sucesso.');
      await carregarDadosAdmin();
    } catch (err) {
      showAdminMessage(err.message, true);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const session = window.api.requireAuth();
    if (!session) return;

    if (session.perfil === 'GERAL') {
      window.location.href = 'dashboard.html';
      return;
    }

    document.getElementById('admin-main').classList.remove('hidden');

    const userInfo = document.getElementById('admin-user-info');
    if (userInfo && session.usuario) {
      userInfo.textContent = `${session.usuario.nome} (${session.perfil})`;
    }

    document.getElementById('admin-logout-btn').addEventListener('click', () => {
      window.api.clearSession();
      window.location.href = 'index.html';
    });

    configurarSelectPerfil(session.perfil);
    document.getElementById('usuario-senha').required = true;
    document.getElementById('usuario-cancel-btn').addEventListener('click', resetFormularioUsuario);

    document.getElementById('usuario-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('usuario-id').value;
      const senha = document.getElementById('usuario-senha').value;
      const perfilSelecionado = session.perfil === 'ADMIN'
        ? 'GERAL'
        : document.getElementById('usuario-perfil').value;

      const payload = {
        nome: document.getElementById('usuario-nome').value.trim(),
        login: document.getElementById('usuario-login').value.trim(),
        cpf: document.getElementById('usuario-cpf').value.trim(),
        perfil: perfilSelecionado,
      };

      if (senha) {
        payload.senha = senha;
      }

      try {
        if (id) {
          await window.api.put(`/usuarios/${id}`, payload);
          showAdminMessage('Usuário atualizado com sucesso.');
        } else {
          await window.api.post('/usuarios', payload);
          showAdminMessage('Usuário criado com sucesso.');
        }
        resetFormularioUsuario();
        await carregarDadosAdmin();
      } catch (err) {
        showAdminMessage(err.message, true);
      }
    });

    carregarDadosAdmin();
  });
})();
