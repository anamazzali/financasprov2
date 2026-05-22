/* FinançasPro — app.js v2.0 */
'use strict';

// ══════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════
const CONFIG = {
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbx4v-zbJtaraPD578ScMOYnLTupDW7XAdXoBxPacDnPbk0FrCc4KuXy9sGLIHLu7hdXNQ/exec',
  // Exemplo: 'https://script.google.com/macros/s/XXXXXX/exec'
};

// ══════════════════════════════════════════════════
// DADOS
// ══════════════════════════════════════════════════
const CATEGORIAS_DESPESA = [
  'Moradia','Educação','Transporte','Seguros','Alimentação','Pet',
  'Cuidados Pessoais','Entretenimento',
  'Investimentos Curto Prazo','Investimentos Longo Prazo',
  'Empréstimos','Igreja/Religião','Impostos',
  'Presentes','Doações','Jurídico','Saúde',
];

const CATEGORIAS_RECEITA = [
  'Salário','Renda Extra','Freelance','Investimentos',
  'Vale Alimentação','Vale Transporte','Outros',
];

const CAT_ICONS = {
  'Moradia':'🏠','Educação':'📚','Transporte':'🚗','Seguros':'🛡️',
  'Alimentação':'🍽️','Pet':'🐾','Cuidados Pessoais':'💆',
  'Entretenimento':'🎬','Investimentos Curto Prazo':'📈',
  'Investimentos Longo Prazo':'💹','Empréstimos':'🏦',
  'Igreja/Religião':'🙏','Impostos':'🧾','Presentes':'🎁',
  'Doações':'❤️','Jurídico':'⚖️','Saúde':'💊',
  'Salário':'💼','Renda Extra':'💰','Freelance':'💻',
  'Investimentos':'📊','Vale Alimentação':'🍱','Vale Transporte':'🚌',
  'Outros':'🔹',
};

// Paleta dos gráficos — usando a paleta PlanilhaProfissional
const CHART_COLORS = [
  '#2D6A4F','#D4AF37','#52B788','#F0CB5E',
  '#1B4332','#A07820','#95D5B2','#E8DFC8',
  '#1B7A3E','#C0392B',
];

const FINN_MSGS = [
  'Cada real economizado é um passo para a liberdade financeira! 🚀',
  'Você está no controle! Continue assim. 💪',
  'Registrar é o primeiro passo para gastar melhor. 📝',
  'Saldo positivo é saldo feliz! 😊',
  'Meta de 20% de economia: você consegue! 🎯',
  'Pequenos gastos diários somam muito no mês. Atenção! 🔍',
  'Investir é pagar ao seu eu do futuro. 🌱',
  'Organizando hoje para colher amanhã. 🌟',
  'Boa decisão financeira é prática, não sorte. 💡',
  'Seu dinheiro trabalha para você quando você o controla. 💎',
];

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// ══════════════════════════════════════════════════
// ESTADO
// ══════════════════════════════════════════════════
const state = {
  user: null,
  lancamentos: [],
  cartoes: [],
  currentMonth: new Date().getMonth(),
  currentYear:  new Date().getFullYear(),
  editId: null,
  chartCategoria: null,
  chartMensal:    null,
};

const $ = id => document.getElementById(id);

// ══════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════
function handleCredentialResponse(response) {
  $('loginLoading').style.display  = 'flex';
  $('googleBtnWrap').style.display = 'none';
  $('accessDenied').style.display  = 'none';

  const payload = parseJwt(response.credential);
  checkAccess(payload.email, payload);
}

function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(atob(base64));
}

async function checkAccess(email, payload) {
  try {
    const url = `${CONFIG.SHEETS_URL}?action=checkAccess&email=${encodeURIComponent(email)}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.authorized) {
      state.user = { email, name: payload.name, picture: payload.picture };
      initApp();
    } else {
      showAccessDenied();
    }
  } catch (e) {
    // Modo offline/dev: permite entrada para testar
    console.warn('Sheets offline, modo local:', e);
    state.user = { email, name: payload.name, picture: payload.picture };
    initApp();
  }
}

function showAccessDenied() {
  $('loginLoading').style.display  = 'none';
  $('googleBtnWrap').style.display = 'flex';
  $('accessDenied').style.display  = 'flex';
}

function logout() {
  if (!confirm('Deseja sair do FinançasPro?')) return;
  state.user = null;
  state.lancamentos = [];
  state.cartoes = [];
  destroyCharts();
  $('loginScreen').style.display = 'flex';
  $('mainApp').style.display     = 'none';
  $('loginLoading').style.display  = 'none';
  $('googleBtnWrap').style.display = 'flex';
  $('accessDenied').style.display  = 'none';
}

// ══════════════════════════════════════════════════
// INIT APP
// ══════════════════════════════════════════════════
function initApp() {
  $('loginScreen').style.display = 'none';
  $('mainApp').style.display     = 'flex';

  $('userName').textContent  = state.user.name;
  $('userEmail').textContent = state.user.email;
  if (state.user.picture) $('userAvatar').src = state.user.picture;

  loadLocal();
  updateMonthLabel();
  populateCatFilter();
  updateCategorias();
  renderAll();

  // Carrega do Sheets em background
  loadFromSheets();

  // Finn depois de 1s
  setTimeout(showFinn, 1200);
}

// ══════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════
function loadLocal() {
  try {
    const l = localStorage.getItem('fp_lancamentos');
    const c = localStorage.getItem('fp_cartoes');
    if (l) state.lancamentos = JSON.parse(l);
    if (c) state.cartoes     = JSON.parse(c);
  } catch(e) { console.warn('loadLocal:', e); }
}

function saveLocal() {
  localStorage.setItem('fp_lancamentos', JSON.stringify(state.lancamentos));
  localStorage.setItem('fp_cartoes',     JSON.stringify(state.cartoes));
}

async function loadFromSheets() {
  if (!state.user) return;
  try {
    const url  = `${CONFIG.SHEETS_URL}?action=getData&email=${encodeURIComponent(state.user.email)}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.lancamentos) {
      state.lancamentos = data.lancamentos;
      if (data.cartoes) state.cartoes = data.cartoes;
      saveLocal();
      renderAll();
    }
  } catch(e) { /* usa local */ }
}

async function saveToSheets(lancamento) {
  if (!state.user || !CONFIG.SHEETS_URL.startsWith('https')) return;
  try {
    await fetch(CONFIG.SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ action:'saveData', email: state.user.email, lancamento }),
    });
  } catch(e) { /* salvo local */ }
}

// ══════════════════════════════════════════════════
// MÊS
// ══════════════════════════════════════════════════
function updateMonthLabel() {
  $('monthLabel').textContent = `${MONTHS[state.currentMonth]} ${state.currentYear}`;
}

function prevMonth() {
  if (state.currentMonth === 0) { state.currentMonth = 11; state.currentYear--; }
  else state.currentMonth--;
  updateMonthLabel(); renderAll();
}

function nextMonth() {
  if (state.currentMonth === 11) { state.currentMonth = 0; state.currentYear++; }
  else state.currentMonth++;
  updateMonthLabel(); renderAll();
}

function getLancamentosMes(m = state.currentMonth, y = state.currentYear) {
  return state.lancamentos.filter(l => {
    const d = new Date(l.data + 'T12:00:00');
    return d.getMonth() === m && d.getFullYear() === y;
  });
}

// ══════════════════════════════════════════════════
// RENDER ALL
// ══════════════════════════════════════════════════
function renderAll() {
  renderDashboard();
  renderLancamentos();
  renderCartoes();
  // Relatório só renderiza quando tab ativa
  if ($('tab-relatorios').style.display !== 'none') renderRelatorio();
}

function destroyCharts() {
  if (state.chartCategoria) { state.chartCategoria.destroy(); state.chartCategoria = null; }
  if (state.chartMensal)    { state.chartMensal.destroy();    state.chartMensal    = null; }
}

// ══════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════
function renderDashboard() {
  const items   = getLancamentosMes();
  const receita = sumBy(items, 'receita');
  const despesa = sumBy(items, 'despesa');
  const saldo   = receita - despesa;
  const taxa    = receita > 0 ? Math.round((saldo / receita) * 100) : 0;

  $('totalReceita').textContent = fmt(receita);
  $('totalDespesa').textContent = fmt(despesa);
  $('totalSaldo').textContent   = fmt(saldo);
  $('taxaEconomia').textContent = `${taxa}%`;

  // Insights
  const despesas    = items.filter(l => l.tipo === 'despesa');
  const sorted      = [...despesas].sort((a,b) => b.valor - a.valor);
  const maiorItem   = sorted[0];

  $('maiorGasto').textContent = maiorItem
    ? `${maiorItem.descricao} · ${fmt(maiorItem.valor)}`
    : '—';

  const cartaoItems     = despesas.filter(l => l.pagamento && l.pagamento.includes('Crédito'));
  const totalCartao     = cartaoItems.reduce((s,l) => s + parseFloat(l.valor||0), 0);
  $('gastoCartao').textContent = fmt(totalCartao);

  const principalCartao = [...cartaoItems].sort((a,b) => b.valor - a.valor)[0];
  $('principalCartao').textContent = principalCartao
    ? `${principalCartao.descricao} · ${fmt(principalCartao.valor)}`
    : '—';

  const byCat   = getCatTotals(despesas);
  const topCat  = Object.entries(byCat).sort((a,b) => b[1]-a[1])[0];
  $('maiorCategoria').textContent = topCat
    ? `${topCat[0]} · ${fmt(topCat[1])}`
    : '—';

  renderCatChart(byCat, despesa);
  renderMensalChart();
  renderCatTable(byCat, despesa);
}

function sumBy(items, tipo) {
  return items
    .filter(l => l.tipo === tipo)
    .reduce((s,l) => s + parseFloat(l.valor||0), 0);
}

function getCatTotals(items) {
  return items.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + parseFloat(l.valor||0);
    return acc;
  }, {});
}

function renderCatChart(byCat, total) {
  destroyChart('categoria');
  const sorted = Object.entries(byCat).sort((a,b) => b[1]-a[1]).slice(0,8);
  if (!sorted.length) return;

  const ctx = $('chartCategoria').getContext('2d');
  state.chartCategoria = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sorted.map(e => e[0]),
      datasets: [{
        data: sorted.map(e => e[1]),
        backgroundColor: CHART_COLORS,
        borderWidth: 2,
        borderColor: '#FAF6EE',
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color:'#555555', font:{ family:'Sora', size:11 }, boxWidth:12, padding:10 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${fmt(ctx.raw)} (${total>0 ? Math.round(ctx.raw/total*100):0}%)`,
          },
        },
      },
      cutout: '62%',
    },
  });
}

function renderMensalChart() {
  destroyChart('mensal');
  const labels = [], receitas = [], despesas = [];

  for (let i = 5; i >= 0; i--) {
    let m = state.currentMonth - i;
    let y = state.currentYear;
    while (m < 0) { m += 12; y--; }
    labels.push(`${MONTHS[m]}/${String(y).slice(2)}`);
    const items = getLancamentosMes(m, y);
    receitas.push(sumBy(items, 'receita'));
    despesas.push(sumBy(items, 'despesa'));
  }

  const ctx = $('chartMensal').getContext('2d');
  state.chartMensal = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label:'Receita', data: receitas, backgroundColor:'rgba(27,122,62,0.75)', borderRadius:6, borderSkipped:false },
        { label:'Despesa', data: despesas, backgroundColor:'rgba(192,57,43,0.65)',  borderRadius:6, borderSkipped:false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color:'#555555', font:{ family:'Sora', size:11 } } },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } },
      },
      scales: {
        x: { ticks:{ color:'#555555', font:{ family:'Sora', size:11 } }, grid:{ color:'rgba(0,0,0,0.04)' } },
        y: { ticks:{ color:'#555555', font:{ family:'Sora', size:11 }, callback: v => `R$${(v/1000).toFixed(0)}k` }, grid:{ color:'rgba(0,0,0,0.06)' } },
      },
    },
  });
}

function destroyChart(tipo) {
  if (tipo === 'categoria' && state.chartCategoria) { state.chartCategoria.destroy(); state.chartCategoria = null; }
  if (tipo === 'mensal'    && state.chartMensal)    { state.chartMensal.destroy();    state.chartMensal    = null; }
}

function renderCatTable(byCat, total) {
  const tbody  = document.querySelector('#tabelaCategorias tbody');
  const sorted = Object.entries(byCat).sort((a,b) => b[1]-a[1]);
  tbody.innerHTML = sorted.map(([cat, val]) => `
    <tr>
      <td>${CAT_ICONS[cat]||'📦'} ${cat}</td>
      <td style="font-weight:700;color:var(--vermelho);">${fmt(val)}</td>
      <td style="color:var(--texto-medio);">${total>0 ? Math.round(val/total*100):0}%</td>
    </tr>
  `).join('') || `<tr><td colspan="3" style="color:var(--texto-medio);text-align:center;padding:20px;">Nenhuma despesa neste mês</td></tr>`;
}

// ══════════════════════════════════════════════════
// LANÇAMENTOS
// ══════════════════════════════════════════════════
function renderLancamentos() {
  let items = getLancamentosMes();
  const tipo = $('filterTipo').value;
  const cat  = $('filterCategoria').value;
  if (tipo) items = items.filter(l => l.tipo === tipo);
  if (cat)  items = items.filter(l => l.categoria === cat);
  items.sort((a,b) => new Date(b.data) - new Date(a.data));

  const el = $('lancamentosLista');
  if (!items.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:52px 20px;color:var(--texto-medio);">
        <div style="font-size:2.5rem;margin-bottom:14px;">📝</div>
        <p style="font-weight:600;margin-bottom:6px;">Nenhum lançamento neste mês</p>
        <p style="font-size:0.85rem;">Clique em "+ Novo Lançamento" para começar.</p>
      </div>`;
    return;
  }

  el.innerHTML = items.map(l => `
    <div class="lancamento-item">
      <div class="lanc-icon ${l.tipo}">${CAT_ICONS[l.categoria] || (l.tipo==='receita'?'💰':'💸')}</div>
      <div class="lanc-info">
        <div class="lanc-desc">${escHtml(l.descricao)}</div>
        <div class="lanc-meta">
          <span class="lanc-badge">${escHtml(l.categoria)}</span>
          ${l.pagamento ? `<span class="lanc-badge">${escHtml(l.pagamento)}</span>` : ''}
          <span>${formatDate(l.data)}</span>
          ${l.recorrente ? '<span class="lanc-badge recorrente">🔄 Recorrente</span>' : ''}
        </div>
      </div>
      <div class="lanc-val ${l.tipo}">${l.tipo==='receita'?'+':'-'}${fmt(l.valor)}</div>
      <div class="lanc-actions">
        <button class="btn-icon" onclick="editLancamento('${l.id}')" title="Editar">✏️</button>
        <button class="btn-icon" onclick="deleteLancamento('${l.id}')" title="Excluir">🗑️</button>
      </div>
    </div>
  `).join('');
}

function populateCatFilter() {
  const sel  = $('filterCategoria');
  const all  = [...CATEGORIAS_DESPESA, ...CATEGORIAS_RECEITA];
  sel.innerHTML = '<option value="">Todas as categorias</option>'
    + all.map(c => `<option value="${c}">${c}</option>`).join('');
}

// ══════════════════════════════════════════════════
// MODAL LANÇAMENTO
// ══════════════════════════════════════════════════
function openModal(edit = null) {
  state.editId = edit ? edit.id : null;
  $('modalTitle').textContent = edit ? 'Editar Lançamento' : 'Novo Lançamento';

  const today = new Date().toISOString().split('T')[0];
  $('fTipo').value       = edit ? edit.tipo        : 'despesa';
  $('fDesc').value       = edit ? edit.descricao   : '';
  $('fValor').value      = edit ? edit.valor       : '';
  $('fData').value       = edit ? edit.data        : today;
  $('fPagamento').value  = edit ? (edit.pagamento||'🏦 PIX') : '🏦 PIX';
  $('fObs').value        = edit ? (edit.obs||'')   : '';
  $('fRecorrente').checked = edit ? !!edit.recorrente : false;

  updateCategorias();
  if (edit) $('fCategoria').value = edit.categoria;
  toggleCartaoRow();
  $('modal').style.display = 'flex';
}

function closeModal() { $('modal').style.display = 'none'; }

function toggleCartaoRow() {
  const show = $('fPagamento').value.includes('Crédito');
  $('cartaoRow').style.display = show ? 'flex' : 'none';
  if (show) {
    $('fCartao').innerHTML = state.cartoes.length
      ? state.cartoes.map(c => `<option value="${c.id}">${escHtml(c.nome)}</option>`).join('')
      : '<option value="">Nenhum cartão cadastrado</option>';
  }
}

function updateCategorias() {
  const cats = $('fTipo').value === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  $('fCategoria').innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function saveLancamento() {
  const tipo  = $('fTipo').value;
  const desc  = $('fDesc').value.trim();
  const valor = parseFloat($('fValor').value);
  const cat   = $('fCategoria').value;
  const data  = $('fData').value;
  const pag   = $('fPagamento').value;
  const obs   = $('fObs').value.trim();
  const rec   = $('fRecorrente').checked;

  if (!desc || isNaN(valor) || valor <= 0 || !data || !cat) {
    alert('Preencha todos os campos obrigatórios: descrição, valor, data e categoria.');
    return;
  }

  if (state.editId) {
    const idx = state.lancamentos.findIndex(l => l.id === state.editId);
    if (idx !== -1) {
      state.lancamentos[idx] = {
        ...state.lancamentos[idx],
        tipo, descricao:desc, valor, categoria:cat, data, pagamento:pag, obs, recorrente:rec,
      };
    }
  } else {
    const novo = {
      id: 'l_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      tipo, descricao:desc, valor, categoria:cat, data,
      pagamento:pag, obs, recorrente:rec,
      cartaoId: pag.includes('Crédito') ? ($('fCartao').value||'') : '',
    };
    state.lancamentos.push(novo);
    saveToSheets(novo);
  }

  saveLocal();
  closeModal();
  renderAll();
}

function editLancamento(id) {
  const l = state.lancamentos.find(l => l.id === id);
  if (l) openModal(l);
}

function deleteLancamento(id) {
  if (!confirm('Excluir este lançamento?')) return;
  state.lancamentos = state.lancamentos.filter(l => l.id !== id);
  saveLocal();
  renderAll();
}

// ══════════════════════════════════════════════════
// CARTÕES
// ══════════════════════════════════════════════════
function renderCartoes() {
  const el = $('cartoesList');
  if (!state.cartoes.length) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:52px 20px;color:var(--texto-medio);">
        <div style="font-size:2.5rem;margin-bottom:14px;">💳</div>
        <p style="font-weight:600;margin-bottom:6px;">Nenhum cartão cadastrado</p>
        <p style="font-size:0.85rem;">Clique em "+ Novo Cartão" para adicionar.</p>
      </div>`;
    return;
  }

  const mes = getLancamentosMes();
  el.innerHTML = state.cartoes.map(c => {
    const fat    = mes.filter(l => l.cartaoId === c.id);
    const total  = fat.reduce((s,l) => s + parseFloat(l.valor||0), 0);
    const pct    = c.limite > 0 ? Math.min(100, Math.round(total/c.limite*100)) : 0;
    const cor    = c.cor || '#2D6A4F';
    const corEsc = darkenHex(cor, 35);
    return `
      <div class="cartao-card" style="background:linear-gradient(135deg,${cor},${corEsc});">
        <div class="cartao-nome">${escHtml(c.nome)}</div>
        <div class="cartao-limite">Limite: ${fmt(c.limite||0)}</div>
        <div class="cartao-fatura">Fecha dia ${c.fechamento||'—'} · Vence dia ${c.vencimento||'—'}</div>
        <div class="cartao-gasto">${fmt(total)}</div>
        <div class="cartao-bar-track"><div class="cartao-bar-fill" style="width:${pct}%;"></div></div>
        <div class="cartao-footer">
          <span>${pct}% do limite utilizado</span>
          <button onclick="deleteCartao('${c.id}')" style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:0.85rem;" title="Remover">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function openCardModal()  { $('cardModal').style.display = 'flex'; }
function closeCardModal() { $('cardModal').style.display = 'none'; }

function saveCard() {
  const nome       = $('cNome').value.trim();
  const limite     = parseFloat($('cLimite').value)     || 0;
  const fechamento = parseInt($('cFechamento').value)   || 15;
  const vencimento = parseInt($('cVencimento').value)   || 22;
  const cor        = $('cCor').value;
  if (!nome) { alert('Informe o nome do cartão.'); return; }
  state.cartoes.push({ id:'c_'+Date.now(), nome, limite, fechamento, vencimento, cor });
  saveLocal();
  closeCardModal();
  renderCartoes();
}

function deleteCartao(id) {
  if (!confirm('Remover este cartão?')) return;
  state.cartoes = state.cartoes.filter(c => c.id !== id);
  saveLocal();
  renderCartoes();
}

// ══════════════════════════════════════════════════
// RELATÓRIO
// ══════════════════════════════════════════════════
function renderRelatorio() {
  const items   = getLancamentosMes();
  const receita = sumBy(items, 'receita');
  const despesa = sumBy(items, 'despesa');
  const saldo   = receita - despesa;
  const taxa    = receita > 0 ? Math.round((saldo/receita)*100) : 0;

  const despesas    = items.filter(l => l.tipo === 'despesa');
  const byCat       = getCatTotals(despesas);
  const byReceita   = getCatTotals(items.filter(l => l.tipo === 'receita'));
  const top5        = [...despesas].sort((a,b) => b.valor-a.valor).slice(0,5);

  const saldoCor   = saldo >= 0 ? 'var(--verde-positivo)' : 'var(--vermelho)';
  const taxaStatus = taxa >= 20
    ? `🎯 Taxa de economia de <strong style="color:var(--verde-positivo);">${taxa}%</strong> — acima da meta de 20%!`
    : taxa > 0
      ? `📊 Taxa de economia: <strong>${taxa}%</strong>. Meta: 20%.`
      : `⚠️ Despesas superaram as receitas neste mês.`;

  $('relatorioContent').innerHTML = `
    <p class="rel-section-title">📊 Resumo — ${MONTHS[state.currentMonth]}/${state.currentYear}</p>
    <p class="rel-text">Receitas: <strong style="color:var(--verde-positivo);">${fmt(receita)}</strong> &nbsp;|&nbsp; Despesas: <strong style="color:var(--vermelho);">${fmt(despesa)}</strong> &nbsp;|&nbsp; Saldo: <strong style="color:${saldoCor};">${fmt(saldo)}</strong></p>
    <p class="rel-text">${taxaStatus}</p>

    <p class="rel-section-title">🔴 Top 5 Maiores Despesas</p>
    <ul class="rel-list">
      ${top5.length
        ? top5.map(l => `<li><span>${CAT_ICONS[l.categoria]||'📦'} ${escHtml(l.descricao)} <small style="color:var(--texto-medio);">(${l.categoria})</small></span><span class="rel-amount despesa">${fmt(l.valor)}</span></li>`).join('')
        : '<li><span style="color:var(--texto-medio);">Nenhuma despesa registrada.</span></li>'}
    </ul>

    <p class="rel-section-title">📂 Despesas por Categoria</p>
    <ul class="rel-list">
      ${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v]) =>
        `<li><span>${CAT_ICONS[c]||'📦'} ${c}</span><span class="rel-amount despesa">${fmt(v)}</span></li>`
      ).join('') || '<li><span style="color:var(--texto-medio);">—</span></li>'}
    </ul>

    <p class="rel-section-title">💰 Receitas por Categoria</p>
    <ul class="rel-list">
      ${Object.entries(byReceita).sort((a,b)=>b[1]-a[1]).map(([c,v]) =>
        `<li><span>${CAT_ICONS[c]||'💚'} ${c}</span><span class="rel-amount receita">${fmt(v)}</span></li>`
      ).join('') || '<li><span style="color:var(--texto-medio);">—</span></li>'}
    </ul>
  `;
}

// ══════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════
const TAB_TITLES = {
  dashboard: 'Dashboard', lancamentos: 'Lançamentos',
  cartoes: 'Cartões de Crédito', relatorios: 'Relatórios',
};

function switchTab(tab) {
  $('topbarTitle').textContent = TAB_TITLES[tab] || tab;
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  $(`tab-${tab}`).style.display = 'block';
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
  if (tab === 'relatorios') renderRelatorio();
  closeSidebar();
  if (Math.random() < 0.35) showFinn();
}

// ══════════════════════════════════════════════════
// SIDEBAR MOBILE
// ══════════════════════════════════════════════════
function toggleSidebar() {
  $('sidebar').classList.toggle('open');
  $('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebarOverlay').classList.remove('open');
}

// ══════════════════════════════════════════════════
// FINN
// ══════════════════════════════════════════════════
function showFinn() {
  $('finnMsg').textContent = FINN_MSGS[Math.floor(Math.random() * FINN_MSGS.length)];
  $('finn').style.display = 'flex';
  setTimeout(closeFinn, 3000);
}
function closeFinn() {
  const el = $('finn');
  if (el) el.style.display = 'none';
}

// ══════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════
function fmt(val) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(val||0);
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('pt-BR');
}

function escHtml(str) {
  return String(str||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function darkenHex(hex, amt) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
}

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Data padrão = hoje
  const today = new Date().toISOString().split('T')[0];
  const fData = $('fData');
  if (fData) fData.value = today;

  // Fechar modais no overlay
  $('modal').addEventListener('click',     e => { if (e.target === $('modal'))     closeModal(); });
  $('cardModal').addEventListener('click', e => { if (e.target === $('cardModal')) closeCardModal(); });
});
