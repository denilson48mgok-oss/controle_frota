(function () {
  let motoristasCache = [];

  function showDashboardMessage(message, isError = false) {
    const alertBox = document.getElementById('dashboard-alert');
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert ${isError ? 'alert-error' : 'alert-success'} show`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10).split('-').reverse().join('/');
  }

  function atualizarSelectResponsaveis() {
    const select = document.getElementById('veiculo-responsavel');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">Sem responsável</option>';
    motoristasCache
      .filter((m) => m.ativo)
      .forEach((m) => {
        const opt = document.createElement('option');
        opt.value = String(m.id);
        opt.textContent = `${m.nome} (CPF: ${m.cpf})`;
        select.appendChild(opt);
      });
    if (currentVal) select.value = currentVal;
  }

  function renderMotoristas() {
    const tbody = document.getElementById('motoristas-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const { perfil } = window.api.getSession();
    const isAdminOrMaster = perfil === 'ADMIN' || perfil === 'MASTER';

    motoristasCache.forEach((m) => {
      const tr = document.createElement('tr');
      const veiculosList = Array.isArray(m.veiculos) && m.veiculos.length > 0
        ? m.veiculos.map((v) => `${v.placa} (${v.modelo})`).join(', ')
        : 'Nenhum';

      const statusBadge = m.ativo
        ? '<span class="badge badge-ativo">Ativo</span>'
        : '<span class="badge badge-inativo">Inativo</span>';

      tr.innerHTML = `
        <td>${m.nome}</td>
        <td>${m.cpf}</td>
        <td>${m.num_cnh} (Venc: ${formatDate(m.vencimento_cnh)})</td>
        <td>${veiculosList}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="actions" data-motorista-actions="${m.id}"></div>
        </td>
      `;

      const actionsEl = tr.querySelector(`[data-motorista-actions="${m.id}"]`);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-secondary btn-sm';
      editBtn.textContent = 'Editar';
      editBtn.disabled = m.ativo === false;
      editBtn.addEventListener('click', () => preencherFormularioMotorista(m));
      actionsEl.appendChild(editBtn);

      if (m.ativo) {
        const baixaBtn = document.createElement('button');
        baixaBtn.type = 'button';
        baixaBtn.className = 'btn-danger btn-sm';
        baixaBtn.textContent = 'Dar Baixa';
        baixaBtn.addEventListener('click', () => darBaixaMotorista(m.id));
        actionsEl.appendChild(baixaBtn);
      } else if (isAdminOrMaster) {
        const reativarBtn = document.createElement('button');
        reativarBtn.type = 'button';
        reativarBtn.className = 'btn-success btn-sm';
        reativarBtn.textContent = 'Reativar';
        reativarBtn.addEventListener('click', () => reativarMotoristaDireto(m.id));
        actionsEl.appendChild(reativarBtn);
      } else {
        const solicitarBtn = document.createElement('button');
        solicitarBtn.type = 'button';
        solicitarBtn.className = 'btn-warning btn-sm';
        solicitarBtn.textContent = 'Solicitar Reativação';
        solicitarBtn.addEventListener('click', () => solicitarReativacaoMotorista(m.id));
        actionsEl.appendChild(solicitarBtn);
      }

      tbody.appendChild(tr);
    });
  }

  function preencherFormularioMotorista(m) {
    document.getElementById('motorista-id').value = m.id;
    document.getElementById('motorista-nome').value = m.nome;
    document.getElementById('motorista-cpf').value = m.cpf;
    document.getElementById('motorista-cnh').value = m.num_cnh;
    document.getElementById('motorista-vencimento').value = m.vencimento_cnh
      ? new Date(m.vencimento_cnh).toISOString().slice(0, 10)
      : '';
    document.getElementById('motorista-form-title').textContent = `Editar Motorista #${m.id}`;
    document.getElementById('motorista-cancel-btn').classList.remove('hidden');
  }

  function resetFormularioMotorista() {
    document.getElementById('motorista-form').reset();
    document.getElementById('motorista-id').value = '';
    document.getElementById('motorista-form-title').textContent = 'Gerenciar Motoristas';
    document.getElementById('motorista-cancel-btn').classList.add('hidden');
  }

  async function carregarMotoristas() {
    try {
      motoristasCache = await window.api.get('/motoristas');
      atualizarSelectResponsaveis();
      renderMotoristas();
    } catch (err) {
      showDashboardMessage(err.message || 'Erro ao carregar motoristas.', true);
    }
  }

  async function darBaixaMotorista(id) {
    try {
      await window.api.patch(`/motoristas/${id}/baixa`);
      showDashboardMessage('Motorista inativado com sucesso.');
      await carregarMotoristas();
      if (window.carregarVeiculos) await window.carregarVeiculos();
    } catch (err) {
      showDashboardMessage(err.message, true);
    }
  }

  async function reativarMotoristaDireto(id) {
    try {
      await window.api.patch(`/motoristas/${id}/reativar`);
      showDashboardMessage('Motorista reativado com sucesso.');
      await carregarMotoristas();
    } catch (err) {
      showDashboardMessage(err.message, true);
    }
  }

  async function solicitarReativacaoMotorista(id) {
    const motivo = window.prompt('Informe o motivo da solicitação de reativação (mín. 3 caracteres):');
    if (!motivo) return;
    try {
      await window.api.post('/reativacoes', {
        tipo_entidade: 'MOTORISTA',
        entidade_id: id,
        motivo,
      });
      showDashboardMessage('Solicitação de reativação enviada com sucesso.');
    } catch (err) {
      showDashboardMessage(err.message, true);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const session = window.api.requireAuth();
    if (!session) return;

    const form = document.getElementById('motorista-form');
    const cancelBtn = document.getElementById('motorista-cancel-btn');

    cancelBtn.addEventListener('click', resetFormularioMotorista);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('motorista-id').value;
      const payload = {
        nome: document.getElementById('motorista-nome').value.trim(),
        cpf: document.getElementById('motorista-cpf').value.trim(),
        num_cnh: document.getElementById('motorista-cnh').value.trim(),
        vencimento_cnh: document.getElementById('motorista-vencimento').value,
      };

      try {
        if (id) {
          await window.api.put(`/motoristas/${id}`, payload);
          showDashboardMessage('Motorista atualizado com sucesso.');
        } else {
          await window.api.post('/motoristas', payload);
          showDashboardMessage('Motorista cadastrado com sucesso.');
        }
        resetFormularioMotorista();
        await carregarMotoristas();
        if (window.carregarVeiculos) await window.carregarVeiculos();
      } catch (err) {
        showDashboardMessage(err.message, true);
      }
    });

    carregarMotoristas();
  });

  window.carregarMotoristas = carregarMotoristas;
  window.showDashboardMessage = showDashboardMessage;
})();
