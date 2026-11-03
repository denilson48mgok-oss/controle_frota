(function () {
  let veiculosCache = [];

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10).split('-').reverse().join('/');
  }

  function formatCurrency(val) {
    const num = Number(val);
    if (!Number.isFinite(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcularPreviaIpvaLocal() {
    const placa = document.getElementById('veiculo-placa').value.trim();
    const valorVenal = Number(document.getElementById('veiculo-valor-venal').value);
    const previaInput = document.getElementById('veiculo-previa-ipva');
    if (!previaInput) return;

    const digits = placa.replace(/\D/g, '');
    if (!digits) {
      previaInput.value = '';
      return;
    }

    const lastDigit = Number(digits[digits.length - 1]);
    const targetMonth = lastDigit === 0 ? 9 : lastDigit - 1;
    const now = new Date();
    let dataIpva = new Date(Date.UTC(now.getUTCFullYear(), targetMonth, 15));
    if (dataIpva <= now) {
      dataIpva = new Date(Date.UTC(now.getUTCFullYear() + 1, targetMonth, 15));
    }

    const valorIpva = valorVenal > 0 ? valorVenal * 0.04 : 0;
    previaInput.value = `${formatCurrency(valorIpva)} - Venc: ${formatDate(dataIpva.toISOString())}`;
  }

  function renderVeiculos() {
    const tbody = document.getElementById('veiculos-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const { perfil } = window.api.getSession();
    const isAdminOrMaster = perfil === 'ADMIN' || perfil === 'MASTER';

    veiculosCache.forEach((v) => {
      const tr = document.createElement('tr');
      const responsavelNome = v.responsavel ? `${v.responsavel.nome}` : 'Sem responsável';
      const statusBadge = v.ativo
        ? '<span class="badge badge-ativo">Ativo</span>'
        : '<span class="badge badge-inativo">Inativo</span>';

      const ipvaInfo = `${formatDate(v.data_ipva)} (${formatCurrency(v.valor_ipva)})`;

      tr.innerHTML = `
        <td><strong>${v.placa}</strong></td>
        <td>${v.marca} ${v.modelo} (${v.ano_modelo})</td>
        <td>${responsavelNome}</td>
        <td>${statusBadge}</td>
        <td>${ipvaInfo}</td>
        <td>
          <div class="actions" data-veiculo-actions="${v.id}"></div>
        </td>
      `;

      const actionsEl = tr.querySelector(`[data-veiculo-actions="${v.id}"]`);

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-secondary btn-sm';
      editBtn.textContent = 'Editar';
      editBtn.disabled = v.ativo === false;
      editBtn.addEventListener('click', () => preencherFormularioVeiculo(v));
      actionsEl.appendChild(editBtn);

      if (v.ativo) {
        const baixaBtn = document.createElement('button');
        baixaBtn.type = 'button';
        baixaBtn.className = 'btn-danger btn-sm';
        baixaBtn.textContent = 'Dar Baixa';
        baixaBtn.addEventListener('click', () => darBaixaVeiculo(v.id));
        actionsEl.appendChild(baixaBtn);
      } else if (isAdminOrMaster) {
        const reativarBtn = document.createElement('button');
        reativarBtn.type = 'button';
        reativarBtn.className = 'btn-success btn-sm';
        reativarBtn.textContent = 'Reativar';
        reativarBtn.addEventListener('click', () => reativarVeiculoDireto(v.id));
        actionsEl.appendChild(reativarBtn);
      } else {
        const solicitarBtn = document.createElement('button');
        solicitarBtn.type = 'button';
        solicitarBtn.className = 'btn-warning btn-sm';
        solicitarBtn.textContent = 'Solicitar Reativação';
        solicitarBtn.addEventListener('click', () => solicitarReativacaoVeiculo(v.id));
        actionsEl.appendChild(solicitarBtn);
      }

      tbody.appendChild(tr);
    });
  }

  function preencherFormularioVeiculo(v) {
    document.getElementById('veiculo-id').value = v.id;
    document.getElementById('veiculo-marca').value = v.marca;
    document.getElementById('veiculo-modelo').value = v.modelo;
    document.getElementById('veiculo-placa').value = v.placa;
    document.getElementById('veiculo-chassi').value = v.chassi;
    document.getElementById('veiculo-renavam').value = v.renavam;
    document.getElementById('veiculo-ano').value = v.ano_modelo;
    document.getElementById('veiculo-responsavel').value = v.responsavel_id ? String(v.responsavel_id) : '';
    document.getElementById('veiculo-form-title').textContent = `Editar Veículo #${v.id} (${v.placa})`;
    document.getElementById('veiculo-cancel-btn').classList.remove('hidden');
    calcularPreviaIpvaLocal();
  }

  function resetFormularioVeiculo() {
    document.getElementById('veiculo-form').reset();
    document.getElementById('veiculo-id').value = '';
    document.getElementById('veiculo-form-title').textContent = 'Gerenciar Veículos';
    document.getElementById('veiculo-cancel-btn').classList.add('hidden');
  }

  async function carregarVeiculos() {
    try {
      veiculosCache = await window.api.get('/veiculos');
      renderVeiculos();
    } catch (err) {
      window.showDashboardMessage(err.message || 'Erro ao carregar veículos.', true);
    }
  }

  async function darBaixaVeiculo(id) {
    try {
      await window.api.patch(`/veiculos/${id}/baixa`);
      window.showDashboardMessage('Veículo inativado com sucesso.');
      await carregarVeiculos();
      if (window.carregarMotoristas) await window.carregarMotoristas();
    } catch (err) {
      window.showDashboardMessage(err.message, true);
    }
  }

  async function reativarVeiculoDireto(id) {
    try {
      await window.api.patch(`/veiculos/${id}/reativar`);
      window.showDashboardMessage('Veículo reativado com sucesso.');
      await carregarVeiculos();
      if (window.carregarMotoristas) await window.carregarMotoristas();
    } catch (err) {
      window.showDashboardMessage(err.message, true);
    }
  }

  async function solicitarReativacaoVeiculo(id) {
    const motivo = window.prompt('Informe o motivo da solicitação de reativação (mín. 3 caracteres):');
    if (!motivo) return;
    try {
      await window.api.post('/reativacoes', {
        tipo_entidade: 'VEICULO',
        entidade_id: id,
        motivo,
      });
      window.showDashboardMessage('Solicitação de reativação enviada com sucesso.');
    } catch (err) {
      window.showDashboardMessage(err.message, true);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const session = window.api.requireAuth();
    if (!session) return;

    const userInfo = document.getElementById('user-info');
    if (userInfo && session.usuario) {
      userInfo.textContent = `${session.usuario.nome} (${session.perfil})`;
    }

    const adminLink = document.getElementById('admin-link');
    if (adminLink && (session.perfil === 'ADMIN' || session.perfil === 'MASTER')) {
      adminLink.classList.remove('hidden');
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.api.clearSession();
        window.location.href = 'index.html';
      });
    }

    document.getElementById('veiculo-placa').addEventListener('input', calcularPreviaIpvaLocal);
    document.getElementById('veiculo-valor-venal').addEventListener('input', calcularPreviaIpvaLocal);
    document.getElementById('veiculo-cancel-btn').addEventListener('click', resetFormularioVeiculo);

    document.getElementById('veiculo-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('veiculo-id').value;
      const responsavelVal = document.getElementById('veiculo-responsavel').value;
      const codigoFipe = document.getElementById('veiculo-fipe').value.trim();
      const valorVenalVal = document.getElementById('veiculo-valor-venal').value;

      const payload = {
        marca: document.getElementById('veiculo-marca').value.trim(),
        modelo: document.getElementById('veiculo-modelo').value.trim(),
        placa: document.getElementById('veiculo-placa').value.trim(),
        chassi: document.getElementById('veiculo-chassi').value.trim(),
        renavam: document.getElementById('veiculo-renavam').value.trim(),
        ano_modelo: Number(document.getElementById('veiculo-ano').value),
        responsavel_id: responsavelVal ? Number(responsavelVal) : null,
      };

      if (codigoFipe) payload.codigo_fipe = codigoFipe;
      if (valorVenalVal && Number(valorVenalVal) > 0) payload.valor_venal = Number(valorVenalVal);

      try {
        if (id) {
          await window.api.put(`/veiculos/${id}`, payload);
          window.showDashboardMessage('Veículo atualizado com sucesso.');
        } else {
          await window.api.post('/veiculos', payload);
          window.showDashboardMessage('Veículo cadastrado com sucesso.');
        }
        resetFormularioVeiculo();
        await carregarVeiculos();
        if (window.carregarMotoristas) await window.carregarMotoristas();
      } catch (err) {
        window.showDashboardMessage(err.message, true);
      }
    });

    carregarVeiculos();
  });

  window.carregarVeiculos = carregarVeiculos;
})();
