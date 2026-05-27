/* FinançasPro — app.js v3.0 */
'use strict';

// ══════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════
const CONFIG = {
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbx4v-zbJtaraPD578ScMOYnLTupDW7XAdXoBxPacDnPbk0FrCc4KuXy9sGLIHLu7hdXNQ/exec',
};


// ══════════════════════════════════════════════════
// LISTA DE BANCOS PARA SELEÇÃO VISUAL
// ══════════════════════════════════════════════════
const BANCOS_LISTA = [
  { nome:'Nubank',         cor:'#820AD1', emoji:'💜' },
  { nome:'Itaú',           cor:'#EC7000', emoji:'🟠' },
  { nome:'Bradesco',       cor:'#CC092F', emoji:'🔴' },
  { nome:'Santander',      cor:'#EC0000', emoji:'🔴' },
  { nome:'Banco do Brasil',cor:'#F8C300', emoji:'🟡' },
  { nome:'Caixa',          cor:'#005CA9', emoji:'🔵' },
  { nome:'Inter',          cor:'#FF7A00', emoji:'🟠' },
  { nome:'Sicredi',        cor:'#00813A', emoji:'🟢' },
  { nome:'Sicoob',         cor:'#007A3D', emoji:'🟢' },
  { nome:'C6 Bank',        cor:'#222222', emoji:'⚫' },
  { nome:'Next',           cor:'#00CF72', emoji:'🟢' },
  { nome:'PicPay',         cor:'#21C25E', emoji:'🟢' },
  { nome:'Mercado Pago',   cor:'#009EE3', emoji:'🔵' },
  { nome:'XP',             cor:'#000000', emoji:'⚫' },
  { nome:'Pan',            cor:'#004A97', emoji:'🔵' },
  { nome:'Amazon',         cor:'#FF9900', emoji:'🟠' },
  { nome:'Outro',          cor:'#2D6A4F', emoji:'💳' },
];

// ══════════════════════════════════════════════════
// CORES DOS BANCOS — automático por nome
// ══════════════════════════════════════════════════
const BANCO_CORES = {
  'nubank':       { bg: '#820AD1', text: '#fff' },
  'nu ':          { bg: '#820AD1', text: '#fff' },
  'inter':        { bg: '#FF7A00', text: '#fff' },
  'banco inter':  { bg: '#FF7A00', text: '#fff' },
  'itau':         { bg: '#EC7000', text: '#fff' },
  'itaú':         { bg: '#EC7000', text: '#fff' },
  'bradesco':     { bg: '#CC092F', text: '#fff' },
  'santander':    { bg: '#EC0000', text: '#fff' },
  'bb ':          { bg: '#F8C300', text: '#333' },
  'banco do brasil': { bg: '#F8C300', text: '#333' },
  'brasil':       { bg: '#F8C300', text: '#333' },
  'caixa':        { bg: '#005CA9', text: '#fff' },
  'sicredi':      { bg: '#00813A', text: '#fff' },
  'sicoob':       { bg: '#007A3D', text: '#fff' },
  'c6':           { bg: '#222222', text: '#fff' },
  'c6 bank':      { bg: '#222222', text: '#fff' },
  'original':     { bg: '#008542', text: '#fff' },
  'pan':          { bg: '#004A97', text: '#fff' },
  'next':         { bg: '#00CF72', text: '#fff' },
  'xp':           { bg: '#000000', text: '#fff' },
  'mercado pago': { bg: '#009EE3', text: '#fff' },
  'picpay':       { bg: '#21C25E', text: '#fff' },
  'amazon':       { bg: '#FF9900', text: '#fff' },
};

function getCorBanco(nome) {
  const n = (nome || '').toLowerCase();
  for (const [key, val] of Object.entries(BANCO_CORES)) {
    if (n.includes(key)) return val;
  }
  return { bg: '#2D6A4F', text: '#fff' };
}

// ══════════════════════════════════════════════════
// CATEGORIAS
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

// Caixinhas — categorias por grupo
const CAIXINHAS = [
  { key:'necessidades', label:'Necessidades',          pct:50, cor:'#C0392B', icon:'🏠',
    cats:['Moradia','Alimentação','Transporte','Saúde','Seguros','Impostos','Empréstimos','Cuidados Pessoais','Pet','Jurídico'] },
  { key:'doacao',       label:'Doação / Contribuição', pct:10, cor:'#D4AF37', icon:'❤️',
    cats:['Doações','Igreja/Religião','Presentes'] },
  { key:'educacao',     label:'Educação',              pct:10, cor:'#52B788', icon:'📚',
    cats:['Educação'] },
  { key:'lazer',        label:'Lazer',                 pct:10, cor:'#F0CB5E', icon:'🎬',
    cats:['Entretenimento'] },
  { key:'invest_longo', label:'Invest. Longo Prazo',   pct:10, cor:'#1B7A3E', icon:'💹',
    cats:['Investimentos Longo Prazo'] },
  { key:'invest_curto', label:'Invest. Curto Prazo',   pct:10, cor:'#A07820', icon:'📈',
    cats:['Investimentos Curto Prazo'] },
];

const CHART_COLORS = ['#2D6A4F','#D4AF37','#52B788','#F0CB5E','#1B4332','#A07820','#95D5B2','#E8DFC8','#1B7A3E','#C0392B'];
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

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
  'Quem controla o dinheiro, controla o destino. 🧭',
  'Um orçamento não é sobre limitação — é sobre intenção. 🎯',
  'A riqueza começa com consciência. Você já tem isso! ✨',
  'Cada categoria organizada é uma vitória. 📂',
  'Finanças saudáveis = vida com menos estresse. 🧘',
  'O segredo dos ricos? Saber para onde vai cada real. 🔑',
  'Você não precisa ganhar mais — precisa gerir melhor. ⚡',
  'Reserva de emergência: a melhor compra que você pode fazer. 🛡️',
  'Doação é investimento em abundância. Continue contribuindo! ❤️',
  'Educação financeira vale mais que qualquer curso. 📚',
  'Seu futuro agradece cada real que você economiza hoje. 🌅',
  'Disciplina financeira hoje = liberdade financeira amanhã. 🔓',
  'Pequenos ajustes no orçamento geram grandes mudanças no ano. 📅',
  'Cartão de crédito é ferramenta — use com consciência! 💳',
  'Você está investindo no seu futuro — isso é poderoso! 💹',
  'Consistência supera intensidade nas finanças. Continue! 🏆',
  'Cada despesa registrada é um insight sobre você mesmo. 💡',
  'O FinançasPro te mostra o caminho — você escolhe percorrê-lo. 🗺️',
  'Finanças não são sobre perfeição, são sobre progresso. 📈',
  'Você começou. Isso já é mais que a maioria faz. Parabéns! 🦉',
];

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
  charts: {},
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
    const res  = await fetch(`${CONFIG.SHEETS_URL}?action=checkAccess&email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.authorized) {
      state.user = { email, name: payload.name, picture: payload.picture };
      initApp();
    } else { showAccessDenied(); }
  } catch(e) {
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
  state.user = null; state.lancamentos = []; state.cartoes = [];
  destroyAllCharts();
  $('loginScreen').style.display = 'flex';
  $('mainApp').style.display     = 'none';
  $('loginLoading').style.display  = 'none';
  $('googleBtnWrap').style.display = 'flex';
  $('accessDenied').style.display  = 'none';
}

// ══════════════════════════════════════════════════
// INIT
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
  loadFromSheets();
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
  } catch(e) {}
}
function saveLocal() {
  localStorage.setItem('fp_lancamentos', JSON.stringify(state.lancamentos));
  localStorage.setItem('fp_cartoes',     JSON.stringify(state.cartoes));
}
// ══════════════════════════════════════════════════
// COMUNICAÇÃO COM SHEETS — via JSONP (resolve CORS)
// ══════════════════════════════════════════════════
function sheetsGET(params) {
  return new Promise((resolve, reject) => {
    const cbName = '_fp_cb_' + Date.now();
    const url = CONFIG.SHEETS_URL + '?' + params + '&callback=' + cbName;
    console.log('[Sheets] GET:', url.substring(0,120));
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout — verifique se a URL do Apps Script está correta e reimplantada com Nova Versão'));
    }, 15000);
    window[cbName] = function(data) {
      cleanup();
      console.log('[Sheets] Resposta OK:', JSON.stringify(data).substring(0,100));
      resolve(data);
    };
    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    script.onerror = (e) => {
      cleanup();
      console.error('[Sheets] Erro script:', e);
      reject(new Error('Erro ao carregar script do Apps Script — verifique a URL'));
    };
    script.src = url;
    document.head.appendChild(script);
  });
}

function sheetsPOST(body) {
  return new Promise((resolve) => {
    // POST via no-cors — não lemos a resposta mas os dados chegam ao Sheets
    fetch(CONFIG.SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(body),
    }).then(() => resolve({ success: true }))
      .catch(() => resolve({ success: false }));
  });
}

async function loadFromSheets() {
  if (!state.user) return;
  try {
    const params = 'action=getData&email=' + encodeURIComponent(state.user.email);
    const data = await sheetsGET(params);
    if (data && data.lancamentos) {
      state.lancamentos = data.lancamentos;
      if (data.cartoes && data.cartoes.length > 0) {
        state.cartoes = data.cartoes;
      } else if (state.cartoes.length > 0) {
        state.cartoes.forEach(c => saveCartaoSheets(c));
      }
      saveLocal();
      renderAll();
      localStorage.setItem('fp_ultimo_sync', new Date().toISOString());
    }
  } catch(e) { console.warn('loadFromSheets:', e.message); }
}

async function saveCartaoSheets(cartao) {
  if (!state.user || !CONFIG.SHEETS_URL.startsWith('https')) return;
  await sheetsPOST({ action:'saveCartao', email: state.user.email, cartao });
}

async function deleteCartaoSheets(id) {
  if (!state.user || !CONFIG.SHEETS_URL.startsWith('https')) return;
  await sheetsPOST({ action:'deleteCartao', email: state.user.email, cartaoId: id });
}

async function saveToSheets(lancamento) {
  if (!state.user || !CONFIG.SHEETS_URL.startsWith('https')) return;
  await sheetsPOST({ action:'saveData', email: state.user.email, lancamento });
}

// placeholder para compatibilidade com código legado
async function saveToSheetsLegacy(lancamento) {
  if (!state.user || !CONFIG.SHEETS_URL.startsWith('https')) return;
  try {
    await fetch(CONFIG.SHEETS_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ action:'saveData', email: state.user.email, lancamento }),
    });
  } catch(e) { console.warn('saveToSheets:', e); }
}


// ══════════════════════════════════════════════════
// MÊS
// ══════════════════════════════════════════════════
function updateMonthLabel() {
  $('monthLabel').textContent = `${MONTHS[state.currentMonth]} ${state.currentYear}`;
}
function prevMonth() {
  if (state.currentMonth===0){state.currentMonth=11;state.currentYear--;}
  else state.currentMonth--;
  updateMonthLabel(); renderAll();
}
function nextMonth() {
  if (state.currentMonth===11){state.currentMonth=0;state.currentYear++;}
  else state.currentMonth++;
  updateMonthLabel(); renderAll();
}
function getLancamentosMes(m=state.currentMonth, y=state.currentYear) {
  return state.lancamentos.filter(l=>{
    const d=new Date(l.data+'T12:00:00');
    return d.getMonth()===m && d.getFullYear()===y;
  });
}
function getLancamentosAno(y=state.currentYear) {
  return state.lancamentos.filter(l=>{
    const d=new Date(l.data+'T12:00:00');
    return d.getFullYear()===y;
  });
}

// ══════════════════════════════════════════════════
// RENDER ALL
// ══════════════════════════════════════════════════
function renderAll() {
  renderDashboard();
  renderLancamentos();
  renderCartoes();
  const active = document.querySelector('.tab-content[style*="block"]');
  if (active) {
    const id = active.id;
    if (id==='tab-relatorios')   renderRelatorio();
    if (id==='tab-comparativo')  renderComparativo();
    if (id==='tab-caixinhas')    renderCaixinhas();
    if (id==='tab-dre')          renderDRE();
    if (id==='tab-analise-cartao') renderAnaliseCartao();
  }
}

function destroyAllCharts() {
  Object.values(state.charts).forEach(c => { try{c.destroy();}catch(e){} });
  state.charts = {};
}
function destroyChart(key) {
  if (state.charts[key]) { try{state.charts[key].destroy();}catch(e){} delete state.charts[key]; }
}

// ══════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════
function fmt(val) {
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(val||0);
}
function formatDate(str) {
  if (!str) return '';
  return new Date(str+'T12:00:00').toLocaleDateString('pt-BR');
}
function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function darkenHex(hex,amt) {
  const n=parseInt(hex.replace('#',''),16);
  const r=Math.max(0,(n>>16)-amt), g=Math.max(0,((n>>8)&0xff)-amt), b=Math.max(0,(n&0xff)-amt);
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
}
function sumBy(items,tipo) {
  return items.filter(l=>l.tipo===tipo).reduce((s,l)=>s+parseFloat(l.valor||0),0);
}
function getCatTotals(items) {
  return items.reduce((acc,l)=>{
    acc[l.categoria]=(acc[l.categoria]||0)+parseFloat(l.valor||0);
    return acc;
  },{});
}

// ══════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════
function renderDashboard() {
  const items   = getLancamentosMes();
  const receita = sumBy(items,'receita');
  const despesa = sumBy(items,'despesa');
  const saldo   = receita-despesa;
  const taxa    = receita>0?Math.round((saldo/receita)*100):0;

  $('totalReceita').textContent = fmt(receita);
  $('totalDespesa').textContent = fmt(despesa);
  $('totalSaldo').textContent   = fmt(saldo);
  $('taxaEconomia').textContent = `${taxa}%`;

  const despesas = items.filter(l=>l.tipo==='despesa');
  const maiorItem = [...despesas].sort((a,b)=>b.valor-a.valor)[0];
  $('maiorGasto').textContent = maiorItem?`${maiorItem.descricao} · ${fmt(maiorItem.valor)}`:'—';

  const cartaoItems = despesas.filter(l=>l.pagamento&&l.pagamento.includes('Crédito'));
  $('gastoCartao').textContent = fmt(cartaoItems.reduce((s,l)=>s+parseFloat(l.valor||0),0));

  const principalCartao = [...cartaoItems].sort((a,b)=>b.valor-a.valor)[0];
  $('principalCartao').textContent = principalCartao?`${principalCartao.descricao} · ${fmt(principalCartao.valor)}`:'—';

  const byCat  = getCatTotals(despesas);
  const topCat = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
  $('maiorCategoria').textContent = topCat?`${topCat[0]} · ${fmt(topCat[1])}`:'—';

  renderCatChart(byCat,despesa);
  renderMensalChart();
  renderCatTable(byCat,despesa);
}

function renderCatChart(byCat,total) {
  destroyChart('catChart');
  const sorted=Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(!sorted.length) return;
  const ctx=$('chartCategoria').getContext('2d');
  state.charts['catChart']=new Chart(ctx,{
    type:'doughnut',
    data:{ labels:sorted.map(e=>e[0]), datasets:[{ data:sorted.map(e=>e[1]), backgroundColor:CHART_COLORS, borderWidth:2, borderColor:'#FAF6EE', hoverOffset:6 }] },
    options:{ responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{ position:'bottom', labels:{color:'#555',font:{family:'Sora',size:11},boxWidth:12,padding:10} },
        tooltip:{ callbacks:{ label:ctx=>` ${fmt(ctx.raw)} (${total>0?Math.round(ctx.raw/total*100):0}%)` } } },
      cutout:'62%' },
  });
}

function renderMensalChart() {
  destroyChart('mensalChart');
  const labels=[],receitas=[],despesas=[];
  for(let i=5;i>=0;i--){
    let m=state.currentMonth-i, y=state.currentYear;
    while(m<0){m+=12;y--;}
    labels.push(`${MONTHS[m]}/${String(y).slice(2)}`);
    const it=getLancamentosMes(m,y);
    receitas.push(sumBy(it,'receita'));
    despesas.push(sumBy(it,'despesa'));
  }
  const ctx=$('chartMensal').getContext('2d');
  state.charts['mensalChart']=new Chart(ctx,{
    type:'bar',
    data:{ labels, datasets:[
      {label:'Receita',data:receitas,backgroundColor:'rgba(27,122,62,0.75)',borderRadius:6,borderSkipped:false},
      {label:'Despesa',data:despesas,backgroundColor:'rgba(192,57,43,0.65)',borderRadius:6,borderSkipped:false},
    ]},
    options:{ responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{labels:{color:'#555',font:{family:'Sora',size:11}}}, tooltip:{callbacks:{label:ctx=>` ${fmt(ctx.raw)}`}} },
      scales:{ x:{ticks:{color:'#555',font:{family:'Sora',size:11}},grid:{color:'rgba(0,0,0,0.04)'}},
               y:{ticks:{color:'#555',font:{family:'Sora',size:11},callback:v=>`R$${(v/1000).toFixed(0)}k`},grid:{color:'rgba(0,0,0,0.06)'}} } },
  });
}

function renderCatTable(byCat,total) {
  const tbody=document.querySelector('#tabelaCategorias tbody');
  const sorted=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  tbody.innerHTML=sorted.map(([cat,val])=>`
    <tr>
      <td>${CAT_ICONS[cat]||'📦'} ${cat}</td>
      <td style="font-weight:700;color:var(--vermelho);">${fmt(val)}</td>
      <td style="color:var(--texto-medio);">${total>0?Math.round(val/total*100):0}%</td>
    </tr>`).join('')||`<tr><td colspan="3" style="color:var(--texto-medio);text-align:center;padding:20px;">Nenhuma despesa neste mês</td></tr>`;
}

// ══════════════════════════════════════════════════
// LANÇAMENTOS
// ══════════════════════════════════════════════════
function renderLancamentos() {
  let items=getLancamentosMes();
  const tipo=$('filterTipo').value, cat=$('filterCategoria').value;
  if(tipo) items=items.filter(l=>l.tipo===tipo);
  if(cat)  items=items.filter(l=>l.categoria===cat);
  items.sort((a,b)=>new Date(b.data)-new Date(a.data));

  const el=$('lancamentosLista');
  if(!items.length){
    el.innerHTML=`<div style="text-align:center;padding:52px 20px;color:var(--texto-medio);">
      <div style="font-size:2.5rem;margin-bottom:14px;">📝</div>
      <p style="font-weight:600;margin-bottom:6px;">Nenhum lançamento neste mês</p>
      <p style="font-size:0.85rem;">Clique em "+ Novo Lançamento" para começar.</p></div>`;
    return;
  }
  el.innerHTML=items.map(l=>`
    <div class="lancamento-item">
      <div class="lanc-icon ${l.tipo}">${CAT_ICONS[l.categoria]||(l.tipo==='receita'?'💰':'💸')}</div>
      <div class="lanc-info">
        <div class="lanc-desc">${escHtml(l.descricao)}</div>
        <div class="lanc-meta">
          <span class="lanc-badge">${escHtml(l.categoria)}</span>
          ${l.pagamento?`<span class="lanc-badge">${escHtml(l.pagamento)}</span>`:''}
          <span>${formatDate(l.data)}</span>
          ${l.recorrente?'<span class="lanc-badge recorrente">🔄 Recorrente</span>':''}
          ${l.parcelado?`<span class="lanc-badge parcelado">💳 ${l.parcelaAtual}/${l.nParcelas} parcelas</span>`:''}
          ${l.parcelado&&l.jurosReais>0?`<span class="lanc-badge juros">⚠️ Juros: ${fmt(l.jurosReais)}</span>`:''}
        </div>
      </div>
      <div class="lanc-val ${l.tipo}">${l.tipo==='receita'?'+':'-'}${fmt(l.valor)}</div>
      <div class="lanc-actions">
        <button class="btn-icon" onclick="editLancamento('${l.id}')" title="Editar">✏️</button>
        <button class="btn-icon" onclick="deleteLancamento('${l.id}')" title="Excluir">🗑️</button>
      </div>
    </div>`).join('');
}

function populateCatFilter() {
  const sel=$('filterCategoria');
  const all=[...CATEGORIAS_DESPESA,...CATEGORIAS_RECEITA];
  sel.innerHTML='<option value="">Todas as categorias</option>'+all.map(c=>`<option value="${c}">${c}</option>`).join('');
}

// ══════════════════════════════════════════════════
// MODAL LANÇAMENTO
// ══════════════════════════════════════════════════
function openModal(edit=null) {
  state.editId = edit ? edit.id : null;
  $('modalTitle').textContent = edit ? 'Editar Lançamento' : 'Novo Lançamento';
  const today = new Date().toISOString().split('T')[0];
  $('fTipo').value      = edit ? edit.tipo                        : 'despesa';
  $('fDesc').value      = edit ? edit.descricao                   : '';
  $('fValor').value     = edit ? edit.valor                       : '';
  $('fData').value      = edit ? edit.data                        : today;
  $('fPagamento').value = edit ? (edit.pagamento || '🏦 PIX')    : '🏦 PIX';
  $('fObs').value       = edit ? (edit.obs || '')                 : '';
  $('fRecorrente').checked = edit ? !!edit.recorrente             : false;

  // Campos de parcelamento
  const isParcelado = edit && edit.parcelado;
  if ($('fParcelado'))      $('fParcelado').checked = !!isParcelado;
  if ($('parcelamentoCampos')) $('parcelamentoCampos').style.display = isParcelado ? 'block' : 'none';
  if ($('fValorTotal'))     $('fValorTotal').value     = isParcelado ? edit.valorTotal    : '';
  if ($('fParcelas'))       $('fParcelas').value        = isParcelado ? edit.nParcelas     : '';
  if ($('fParcelaAtual'))   $('fParcelaAtual').value    = isParcelado ? edit.parcelaAtual  : '1';
  if ($('fJurosReais'))     $('fJurosReais').value      = isParcelado ? edit.jurosReais    : '';
  if ($('parcelamentoPreview')) $('parcelamentoPreview').style.display = 'none';

  updateCategorias();
  if (edit) $('fCategoria').value = edit.categoria;
  toggleCartaoRow();
  if (isParcelado) calcularParcelamento();
  $('modal').style.display = 'flex';
}
function closeModal(){$('modal').style.display='none';}

function toggleCartaoRow() {
  const show = $('fPagamento').value.includes('Crédito');
  $('cartaoRow').style.display = show ? 'flex' : 'none';
  $('parcelamentoRow').style.display = show ? 'block' : 'none';
  if (!show) {
    $('fParcelado').checked = false;
    $('parcelamentoCampos').style.display = 'none';
  }
  if (show) {
    $('fCartao').innerHTML = state.cartoes.length
      ? state.cartoes.map(c => `<option value="${c.id}">${escHtml(c.nome)}</option>`).join('')
      : '<option value="">Nenhum cartão cadastrado</option>';
  }
}

function toggleParcelamento() {
  const ativo = $('fParcelado').checked;
  $('parcelamentoCampos').style.display = ativo ? 'block' : 'none';
  if (!ativo) {
    $('parcelamentoPreview').style.display = 'none';
    // Restaura valor original se havia sido alterado
    $('fValorTotal').value = '';
    $('fParcelas').value = '';
    $('fParcelaAtual').value = '1';
    $('fJurosReais').value = '';
  }
}

function calcularParcelamento() {
  const valorTotal  = parseFloat($('fValorTotal')?.value) || 0;
  const nParcelas   = parseInt($('fParcelas')?.value)    || 0;
  const parcelaAtual = parseInt($('fParcelaAtual')?.value) || 1;
  const jurosReais  = parseFloat($('fJurosReais')?.value) || 0;
  const preview     = $('parcelamentoPreview');
  if (!preview) return;

  if (!valorTotal || !nParcelas) {
    preview.style.display = 'none';
    return;
  }

  const valorComJuros   = valorTotal + jurosReais;
  const valorParcela    = valorComJuros / nParcelas;
  const pctJuros        = jurosReais > 0 ? ((jurosReais / valorTotal) * 100).toFixed(2) : 0;
  const pctJurosMensal  = jurosReais > 0 ? ((Math.pow(1 + (jurosReais/valorTotal), 1/nParcelas) - 1) * 100).toFixed(2) : 0;
  const jaParcelasoPagas = parcelaAtual - 1;
  const totalJaParcelasoPago = jaParcelasoPagas * valorParcela;
  const totalRestante   = valorComJuros - totalJaParcelasoPago;

  // Atualiza o campo valor da parcela automaticamente
  $('fValor').value = valorParcela.toFixed(2);

  preview.style.display = 'flex';
  preview.style.flexDirection = 'column';
  preview.style.gap = '6px';
  preview.innerHTML = `
    <div class="parcel-destaque">
      <span class="parcel-label">💳 Valor desta parcela (${parcelaAtual}/${nParcelas})</span>
      <span class="parcel-val">${fmt(valorParcela)}</span>
    </div>
    <div class="parcel-linha">
      <span class="parcel-label">Valor original da compra</span>
      <span class="parcel-val">${fmt(valorTotal)}</span>
    </div>
    <div class="parcel-linha">
      <span class="parcel-label">Total com juros</span>
      <span class="parcel-val">${fmt(valorComJuros)}</span>
    </div>
    ${jurosReais > 0 ? `
    <div class="parcel-linha">
      <span class="parcel-label">Total em juros (R$)</span>
      <span class="parcel-val vermelho">${fmt(jurosReais)}</span>
    </div>
    <div class="parcel-linha">
      <span class="parcel-label">% de juros total</span>
      <span class="parcel-val vermelho">${pctJuros}%</span>
    </div>
    <div class="parcel-linha">
      <span class="parcel-label">% de juros ao mês (aprox.)</span>
      <span class="parcel-val dourado">${pctJurosMensal}% a.m.</span>
    </div>` : ''}
    <div class="parcel-linha">
      <span class="parcel-label">Parcelas restantes</span>
      <span class="parcel-val">${nParcelas - parcelaAtual + 1} de ${nParcelas}</span>
    </div>
    <div class="parcel-linha">
      <span class="parcel-label">Saldo devedor restante</span>
      <span class="parcel-val vermelho">${fmt(totalRestante)}</span>
    </div>
  `;
}
function updateCategorias() {
  const cats=$('fTipo').value==='receita'?CATEGORIAS_RECEITA:CATEGORIAS_DESPESA;
  $('fCategoria').innerHTML=cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function saveLancamento() {
  const tipo=$('fTipo').value, desc=$('fDesc').value.trim();
  const valor=parseFloat($('fValor').value), cat=$('fCategoria').value;
  const data=$('fData').value, pag=$('fPagamento').value;
  const obs=$('fObs').value.trim(), rec=$('fRecorrente').checked;
  if(!desc||isNaN(valor)||valor<=0||!data||!cat){
    alert('Preencha todos os campos obrigatórios.');return;
  }
  // Dados de parcelamento
  const parcelado = $('fParcelado')?.checked && pag.includes('Crédito');
  const parcelInfo = parcelado ? {
    parcelado:    true,
    valorTotal:   parseFloat($('fValorTotal')?.value) || valor,
    nParcelas:    parseInt($('fParcelas')?.value)     || 1,
    parcelaAtual: parseInt($('fParcelaAtual')?.value) || 1,
    jurosReais:   parseFloat($('fJurosReais')?.value) || 0,
    pctJuros:     parseFloat($('fJurosReais')?.value) > 0
      ? (((parseFloat($('fJurosReais')?.value) || 0) / (parseFloat($('fValorTotal')?.value) || valor)) * 100).toFixed(2)
      : 0,
  } : { parcelado: false };

  const cartaoId = pag.includes('Crédito') ? ($('fCartao').value || '') : '';

  if(state.editId){
    const idx=state.lancamentos.findIndex(l=>l.id===state.editId);
    if(idx!==-1){
      state.lancamentos[idx]={...state.lancamentos[idx],tipo,descricao:desc,valor,categoria:cat,data,pagamento:pag,obs,recorrente:rec,cartaoId,...parcelInfo};
      saveToSheets(state.lancamentos[idx]);
    }
  } else {
    const novo={
      id:'l_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      tipo,descricao:desc,valor,categoria:cat,data,pagamento:pag,obs,recorrente:rec,
      cartaoId,...parcelInfo,
    };
    state.lancamentos.push(novo);
    saveToSheets(novo);
  }
  saveLocal(); closeModal(); renderAll();
}
function editLancamento(id){const l=state.lancamentos.find(l=>l.id===id);if(l)openModal(l);}
function deleteLancamento(id){
  if(!confirm('Excluir este lançamento?'))return;
  state.lancamentos=state.lancamentos.filter(l=>l.id!==id);
  saveLocal();renderAll();
}

// ══════════════════════════════════════════════════
// CARTÕES — cores automáticas por banco
// ══════════════════════════════════════════════════
function renderCartoes() {
  const el=$('cartoesList');
  if(!state.cartoes.length){
    el.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:52px 20px;color:var(--texto-medio);">
      <div style="font-size:2.5rem;margin-bottom:14px;">💳</div>
      <p style="font-weight:600;margin-bottom:6px;">Nenhum cartão cadastrado</p>
      <p style="font-size:0.85rem;">Clique em "+ Novo Cartão" para adicionar.</p></div>`;
    return;
  }
  const mes=getLancamentosMes();
  el.innerHTML=state.cartoes.map(c=>{
    const fat=mes.filter(l=>l.cartaoId===c.id);
    const total=fat.reduce((s,l)=>s+parseFloat(l.valor||0),0);
    const pct=c.limite>0?Math.min(100,Math.round(total/c.limite*100)):0;
    // Cor automática por banco, ou cor customizada
    const corAuto=getCorBanco(c.nome);
    const bg=c.corCustom?c.cor:corAuto.bg;
    const bgEsc=darkenHex(bg,30);
    return `
      <div class="cartao-card" style="background:linear-gradient(135deg,${bg},${bgEsc});">
        <div class="cartao-nome">${escHtml(c.nome)}</div>
        <div class="cartao-limite">Limite: ${fmt(c.limite||0)}</div>
        <div class="cartao-fatura">Fecha dia ${c.fechamento||'—'} · Vence dia ${c.vencimento||'—'}</div>
        <div class="cartao-gasto">${fmt(total)}</div>
        <div class="cartao-bar-track"><div class="cartao-bar-fill" style="width:${pct}%;"></div></div>
        <div class="cartao-footer">
          <span>${pct}% do limite utilizado</span>
          <div style="display:flex;gap:6px;">
            <button onclick="editCartao('${c.id}')"
              style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;cursor:pointer;border-radius:6px;padding:3px 8px;font-size:0.75rem;"
              title="Editar cartão">✏️ Editar</button>
            <button onclick="deleteCartao('${c.id}')"
              style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.8);cursor:pointer;border-radius:6px;padding:3px 8px;font-size:0.75rem;"
              title="Remover cartão">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// Banco selecionado no modal
let _bancoSelecionado = null;

let _editCartaoId = null;

function openCardModal(edit = null) {
  _bancoSelecionado = null;
  _editCartaoId = edit ? edit.id : null;

  // Preenche campos
  $('cNome').value      = edit ? edit.nome      : '';
  $('cLimite').value    = edit ? edit.limite     : '';
  $('cFechamento').value= edit ? edit.fechamento : '';
  $('cVencimento').value= edit ? edit.vencimento : '';
  $('cCor').value       = edit ? (edit.cor || '#2D6A4F') : '#2D6A4F';
  $('cCorCustom').checked = edit ? !!edit.corCustom : false;
  $('cCorRow').style.display = (edit && edit.corCustom) ? 'flex' : 'none';

  // Título do modal
  document.querySelector('#cardModal .modal-header h3').textContent =
    edit ? 'Editar Cartão' : 'Novo Cartão de Crédito';

  // Gera grid de bancos
  const grid = $('bancoGrid');
  if (grid) grid.innerHTML = BANCOS_LISTA.map((b,i) => `
    <button type="button" class="banco-btn" onclick="selecionarBanco(${i})" id="banco-btn-${i}">
      <div class="banco-btn-cor" style="background:${b.cor};"></div>
      <div class="banco-btn-label">${b.nome}</div>
    </button>`).join('');

  // Se editando, seleciona o banco correspondente
  if (edit) {
    const idx = BANCOS_LISTA.findIndex(b =>
      edit.nome.toLowerCase().includes(b.nome.toLowerCase()) ||
      b.nome.toLowerCase().includes(edit.nome.toLowerCase())
    );
    if (idx >= 0) {
      _bancoSelecionado = BANCOS_LISTA[idx];
      setTimeout(() => {
        document.querySelectorAll('.banco-btn').forEach((btn,i) =>
          btn.classList.toggle('selected', i === idx));
      }, 50);
    }
  }

  atualizarPreview();
  $('cardModal').style.display='flex';
}

function editCartao(id) {
  const c = state.cartoes.find(c => c.id === id);
  if (c) openCardModal(c);
}

function selecionarBanco(idx) {
  _bancoSelecionado = BANCOS_LISTA[idx];
  document.querySelectorAll('.banco-btn').forEach((btn,i) => {
    btn.classList.toggle('selected', i === idx);
  });
  if (!$('cNome').value.trim() && _bancoSelecionado.nome !== 'Outro') {
    $('cNome').value = _bancoSelecionado.nome;
  }
  atualizarPreview();
}

function atualizarPreview() {
  const preview = $('cardPreview');
  const nameEl  = $('cardPreviewName');
  const limEl   = $('cardPreviewLimit');
  if (!preview) return;
  const corCustom = $('cCorCustom')?.checked;
  const cor = corCustom ? $('cCor').value : (_bancoSelecionado ? _bancoSelecionado.cor : '#2D6A4F');
  const corEsc = darkenHex(cor, 30);
  preview.style.background = `linear-gradient(135deg, ${cor}, ${corEsc})`;
  const nome = $('cNome').value.trim() || (_bancoSelecionado ? _bancoSelecionado.nome : 'Meu Cartão');
  const limite = parseFloat($('cLimite').value) || 0;
  if (nameEl) nameEl.textContent = nome;
  if (limEl)  limEl.textContent  = `Limite: ${fmt(limite)}`;
}

function closeCardModal() { $('cardModal').style.display='none'; }

function toggleCorCustom() {
  $('cCorRow').style.display = $('cCorCustom').checked ? 'flex' : 'none';
  atualizarPreview();
}

function saveCard() {
  const nomeInput  = $('cNome').value.trim();
  const nome       = nomeInput || (_bancoSelecionado ? _bancoSelecionado.nome : '');
  const limite     = parseFloat($('cLimite').value) || 0;
  const fechamento = parseInt($('cFechamento').value) || 15;
  const vencimento = parseInt($('cVencimento').value) || 22;
  const corCustom  = $('cCorCustom').checked;
  const cor = corCustom
    ? $('cCor').value
    : (_bancoSelecionado ? _bancoSelecionado.cor : (state.cartoes.find(c=>c.id===_editCartaoId)?.cor || '#2D6A4F'));

  if (!nome) { alert('Selecione o banco ou informe o nome do cartão.'); return; }

  if (_editCartaoId) {
    // EDIÇÃO — atualiza cartão existente
    const idx = state.cartoes.findIndex(c => c.id === _editCartaoId);
    if (idx !== -1) {
      state.cartoes[idx] = { ...state.cartoes[idx], nome, limite, fechamento, vencimento, cor, corCustom };
      saveLocal();
      saveCartaoSheets(state.cartoes[idx]);
    }
  } else {
    // NOVO cartão
    const novoCartao = { id:'c_'+Date.now(), nome, limite, fechamento, vencimento, cor, corCustom };
    state.cartoes.push(novoCartao);
    saveLocal();
    saveCartaoSheets(novoCartao);
  }

  closeCardModal();
  renderCartoes();
}

// Atualiza preview ao digitar limite
function onLimiteInput() { atualizarPreview(); }

function deleteCartao(id){
  if(!confirm('Remover este cartão?'))return;
  state.cartoes=state.cartoes.filter(c=>c.id!==id);
  saveLocal();
  deleteCartaoSheets(id);
  renderCartoes();
}

// ══════════════════════════════════════════════════
// RELATÓRIO MENSAL
// ══════════════════════════════════════════════════
function renderRelatorio() {
  const items=getLancamentosMes();
  const receita=sumBy(items,'receita'), despesa=sumBy(items,'despesa');
  const saldo=receita-despesa, taxa=receita>0?Math.round((saldo/receita)*100):0;
  const despesas=items.filter(l=>l.tipo==='despesa');
  const byCat=getCatTotals(despesas), byRec=getCatTotals(items.filter(l=>l.tipo==='receita'));
  const top5=[...despesas].sort((a,b)=>b.valor-a.valor).slice(0,5);
  const saldoCor=saldo>=0?'var(--verde-positivo)':'var(--vermelho)';
  const taxaStatus=taxa>=20
    ?`🎯 Taxa de economia <strong style="color:var(--verde-positivo);">${taxa}%</strong> — acima da meta de 20%!`
    :taxa>0?`📊 Taxa de economia: <strong>${taxa}%</strong>. Meta: 20%.`
    :`⚠️ Despesas superaram as receitas neste mês.`;

  $('relatorioContent').innerHTML=`
    <p class="rel-section-title">📊 Resumo — ${MONTHS_FULL[state.currentMonth]}/${state.currentYear}</p>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
      <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid var(--verde-positivo);padding:16px;text-align:center;">
        <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:var(--texto-medio);margin-bottom:8px;">💰 Receita Total</div>
        <div style="font-size:1.25rem;font-weight:800;color:var(--verde-positivo);">${fmt(receita)}</div>
        <div style="font-size:0.7rem;color:var(--texto-medio);margin-top:4px;">${MONTHS_FULL[state.currentMonth]}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid var(--vermelho);padding:16px;text-align:center;">
        <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:var(--texto-medio);margin-bottom:8px;">💸 Total Despesas</div>
        <div style="font-size:1.25rem;font-weight:800;color:var(--vermelho);">${fmt(despesa)}</div>
        <div style="font-size:0.7rem;color:var(--texto-medio);margin-top:4px;">${MONTHS_FULL[state.currentMonth]}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid ${saldo>=0?'var(--verde-medio)':'var(--vermelho)'};padding:16px;text-align:center;">
        <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:var(--texto-medio);margin-bottom:8px;">🏦 Saldo do Mês</div>
        <div style="font-size:1.25rem;font-weight:800;color:${saldo>=0?'var(--verde-medio)':'var(--vermelho)'};">${fmt(saldo)}</div>
        <div style="font-size:0.7rem;color:var(--texto-medio);margin-top:4px;">${saldo>=0?'✅ Positivo':'⚠️ Negativo'}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid ${taxa>=20?'var(--dourado)':'var(--bege-escuro)'};padding:16px;text-align:center;">
        <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;color:var(--texto-medio);margin-bottom:8px;">🎯 Taxa de Economia</div>
        <div style="font-size:1.25rem;font-weight:800;color:${taxa>=20?'var(--dourado-escuro)':'var(--texto-escuro)'};">${taxa}%</div>
        <div style="font-size:0.7rem;color:${taxa>=20?'var(--verde-positivo)':'var(--texto-medio)'};margin-top:4px;">${taxa>=20?'Meta atingida!':'Meta: 20%'}</div>
      </div>
    </div>

    <p class="rel-section-title">🔴 Top 5 Maiores Despesas</p>
    <ul class="rel-list">${top5.length
      ?top5.map(l=>`<li><span>${CAT_ICONS[l.categoria]||'📦'} ${escHtml(l.descricao)} <small style="color:var(--texto-medio);">(${l.categoria})</small></span><span class="rel-amount despesa">${fmt(l.valor)}</span></li>`).join('')
      :'<li><span style="color:var(--texto-medio);">Nenhuma despesa registrada.</span></li>'}</ul>
    <p class="rel-section-title">📂 Despesas por Categoria</p>
    <ul class="rel-list">${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<li><span>${CAT_ICONS[c]||'📦'} ${c}</span><span class="rel-amount despesa">${fmt(v)}</span></li>`).join('')||'<li><span style="color:var(--texto-medio);">—</span></li>'}</ul>
    <p class="rel-section-title">💰 Receitas por Categoria</p>
    <ul class="rel-list">${Object.entries(byRec).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<li><span>${CAT_ICONS[c]||'💚'} ${c}</span><span class="rel-amount receita">${fmt(v)}</span></li>`).join('')||'<li><span style="color:var(--texto-medio);">—</span></li>'}</ul>`;
}

// ══════════════════════════════════════════════════
// COMPARATIVO MENSAL
// ══════════════════════════════════════════════════
function renderComparativo() {
  const el=$('comparativoContent');
  const rows=[];
  for(let i=11;i>=0;i--){
    let m=state.currentMonth-i, y=state.currentYear;
    while(m<0){m+=12;y--;}
    const it=getLancamentosMes(m,y);
    const rec=sumBy(it,'receita'), desp=sumBy(it,'despesa'), saldo=rec-desp;
    const taxa=rec>0?Math.round((saldo/rec)*100):0;
    rows.push({mes:`${MONTHS[m]}/${String(y).slice(2)}`,rec,desp,saldo,taxa});
  }
    renderComparativoSummary(rows);
  el.innerHTML=`
    <div class="table-box" style="max-width:100%;">
      <h3 class="chart-title">📅 Comparativo — Últimos 12 Meses</h3>
      <table class="data-table">
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Saldo</th><th>Economia</th></tr></thead>
        <tbody>
          ${rows.map(r=>`
            <tr>
              <td style="font-weight:600;">${r.mes}</td>
              <td style="color:var(--verde-positivo);font-weight:700;">${fmt(r.rec)}</td>
              <td style="color:var(--vermelho);font-weight:700;">${fmt(r.desp)}</td>
              <td style="font-weight:700;color:${r.saldo>=0?'var(--verde-medio)':'var(--vermelho)'};">${fmt(r.saldo)}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="flex:1;height:6px;background:var(--bege-escuro);border-radius:50px;overflow:hidden;">
                    <div style="width:${Math.min(100,Math.max(0,r.taxa))}%;height:100%;background:${r.taxa>=20?'var(--verde-medio)':'var(--dourado)'};border-radius:50px;"></div>
                  </div>
                  <span style="font-size:0.78rem;font-weight:700;color:${r.taxa>=20?'var(--verde-medio)':'var(--texto-medio)'};">${r.taxa}%</span>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  // Gráfico de linha
  destroyChart('compChart');
  setTimeout(()=>{
    const canvas=$('chartComparativo');
    if(!canvas)return;
    state.charts['compChart']=new Chart(canvas.getContext('2d'),{
      type:'line',
      data:{
        labels:rows.map(r=>r.mes),
        datasets:[
          {label:'Receita',data:rows.map(r=>r.rec),borderColor:'#1B7A3E',backgroundColor:'rgba(27,122,62,0.08)',tension:0.4,pointRadius:4,fill:true},
          {label:'Despesa',data:rows.map(r=>r.desp),borderColor:'#C0392B',backgroundColor:'rgba(192,57,43,0.06)',tension:0.4,pointRadius:4,fill:true},
          {label:'Saldo',data:rows.map(r=>r.saldo),borderColor:'#D4AF37',backgroundColor:'transparent',tension:0.4,pointRadius:4,borderDash:[5,3]},
        ]
      },
      options:{responsive:true,maintainAspectRatio:true,
        plugins:{legend:{labels:{color:'#555',font:{family:'Sora',size:11}}},tooltip:{callbacks:{label:ctx=>` ${fmt(ctx.raw)}`}}},
        scales:{x:{ticks:{color:'#555',font:{family:'Sora',size:11}},grid:{color:'rgba(0,0,0,0.04)'}},
                y:{ticks:{color:'#555',font:{family:'Sora',size:11},callback:v=>`R$${(v/1000).toFixed(1)}k`},grid:{color:'rgba(0,0,0,0.05)'}}}},
    });
  },100);
}

// ══════════════════════════════════════════════════
// DRE — Demonstrativo de Resultado
// ══════════════════════════════════════════════════
function renderDRE() {
  const items=getLancamentosMes();
  const receita=sumBy(items,'receita'), despesa=sumBy(items,'despesa'), lucro=receita-despesa;
  const despesas=items.filter(l=>l.tipo==='despesa');
  const byCat=getCatTotals(despesas);
  const margin=receita>0?((lucro/receita)*100).toFixed(1):0;

  $('dreContent').innerHTML=`
    <div class="relatorio-box" style="max-width:680px;">
      <p class="rel-section-title">📋 DRE — ${MONTHS_FULL[state.currentMonth]}/${state.currentYear}</p>

      <div style="background:var(--bege-claro);border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bege-escuro);">
          <span style="font-weight:700;color:var(--verde-escuro);">(+) RECEITAS TOTAIS</span>
          <span style="font-weight:800;color:var(--verde-positivo);">${fmt(receita)}</span>
        </div>
        ${Object.entries(getCatTotals(items.filter(l=>l.tipo==='receita'))).map(([c,v])=>`
        <div style="display:flex;justify-content:space-between;padding:4px 0 4px 16px;font-size:0.85rem;color:var(--texto-medio);">
          <span>${CAT_ICONS[c]||'💚'} ${c}</span><span>${fmt(v)}</span>
        </div>`).join('')}
      </div>

      <div style="background:var(--bege-claro);border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bege-escuro);">
          <span style="font-weight:700;color:var(--verde-escuro);">(-) DESPESAS TOTAIS</span>
          <span style="font-weight:800;color:var(--vermelho);">${fmt(despesa)}</span>
        </div>
        ${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`
        <div style="display:flex;justify-content:space-between;padding:4px 0 4px 16px;font-size:0.85rem;color:var(--texto-medio);">
          <span>${CAT_ICONS[c]||'📦'} ${c}</span><span>${fmt(v)}</span>
        </div>`).join('')}
      </div>

      <div style="background:${lucro>=0?'rgba(27,122,62,0.08)':'rgba(192,57,43,0.08)'};border:2px solid ${lucro>=0?'var(--verde-medio)':'var(--vermelho)'};border-radius:10px;padding:16px 20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;font-size:1rem;color:var(--verde-escuro);">(=) RESULTADO LÍQUIDO</span>
          <span style="font-weight:800;font-size:1.2rem;color:${lucro>=0?'var(--verde-positivo)':'var(--vermelho)'};">${fmt(lucro)}</span>
        </div>
        <div style="margin-top:8px;font-size:0.82rem;color:var(--texto-medio);">
          Margem líquida: <strong style="color:${margin>=20?'var(--verde-medio)':'var(--texto-escuro)'};">${margin}%</strong>
          ${margin>=20?' ✅ Acima da meta':margin>0?' ⚠️ Abaixo da meta de 20%':' 🔴 Resultado negativo'}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════
// MÉTODO DAS CAIXINHAS
// ══════════════════════════════════════════════════
function renderCaixinhas() {
  const receita=sumBy(getLancamentosMes(),'receita');
  const despesas=getLancamentosMes().filter(l=>l.tipo==='despesa');
  const byCat=getCatTotals(despesas);

  const el=$('caixinhasContent');
  const totalDespesa=Object.values(byCat).reduce((s,v)=>s+v,0);

  const receitaInput=$('caixinhaReceita');
  const base=receitaInput&&receitaInput.value?parseFloat(receitaInput.value):receita;

  el.innerHTML=`
    <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);padding:20px;margin-bottom:20px;max-width:600px;">
      <p style="font-size:0.82rem;color:var(--texto-medio);margin-bottom:8px;font-weight:600;">BASE DE CÁLCULO (Receita Líquida)</p>
      <div style="display:flex;gap:10px;align-items:center;">
        <input type="number" id="caixinhaReceita" value="${base||''}" placeholder="Digite sua receita líquida..."
          oninput="renderCaixinhas()"
          style="flex:1;padding:10px 14px;border:1.5px solid var(--bege-escuro);border-radius:9px;font-family:Sora,sans-serif;font-size:0.95rem;background:var(--bege-claro);" />
        <span style="font-size:0.82rem;color:var(--texto-medio);">${receita>0?`Receita do mês: ${fmt(receita)}`:'Sem receita no mês'}</span>
      </div>
    </div>

    <div class="caixinhas-grid">
      ${CAIXINHAS.map(cx=>{
        const alocado=(base||0)*(cx.pct/100);
        const gasto=cx.cats.reduce((s,c)=>s+(byCat[c]||0),0);
        const diff=alocado-gasto;
        const pct=alocado>0?Math.min(100,Math.round(gasto/alocado*100)):0;
        const ok=gasto<=alocado;
        return `
          <div class="caixinha-card" style="border-top:4px solid ${cx.cor};">
            <div class="caixinha-header">
              <span class="caixinha-icon" style="background:${cx.cor}20;">${cx.icon}</span>
              <div>
                <div class="caixinha-nome">${cx.label}</div>
                <div class="caixinha-pct">${cx.pct}% da receita</div>
              </div>
            </div>
            <div class="caixinha-vals">
              <div><span style="font-size:0.72rem;color:var(--texto-medio);">ALOCADO</span><div style="font-weight:800;color:var(--verde-escuro);">${fmt(alocado)}</div></div>
              <div><span style="font-size:0.72rem;color:var(--texto-medio);">GASTO</span><div style="font-weight:800;color:${ok?'var(--texto-escuro)':'var(--vermelho)'};">${fmt(gasto)}</div></div>
              <div><span style="font-size:0.72rem;color:var(--texto-medio);">${ok?'SOBRA':'EXCESSO'}</span><div style="font-weight:800;color:${ok?'var(--verde-medio)':'var(--vermelho)'};">${fmt(Math.abs(diff))}</div></div>
            </div>
            <div style="height:8px;background:var(--bege-escuro);border-radius:50px;overflow:hidden;margin:12px 0 6px;">
              <div style="width:${pct}%;height:100%;background:${ok?cx.cor:'var(--vermelho)'};border-radius:50px;transition:width .4s;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--texto-medio);">
              <span>${pct}% utilizado</span>
              <span style="color:${ok?'var(--verde-medio)':'var(--vermelho)'};font-weight:600">${ok?'✅ Dentro do limite':'⚠️ Acima do limite'}</span>
            </div>
          </div>`;
      }).join('')}
    </div>

    <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);padding:20px;margin-top:20px;max-width:600px;">
      <p style="font-weight:700;color:var(--verde-escuro);margin-bottom:12px;">📊 Resumo Geral das Caixinhas</p>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bege);">
        <span style="color:var(--texto-medio);">Total alocado pelo método</span>
        <span style="font-weight:700;">${fmt(base||0)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bege);">
        <span style="color:var(--texto-medio);">Total gasto no mês</span>
        <span style="font-weight:700;color:var(--vermelho);">${fmt(totalDespesa)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;">
        <span style="color:var(--texto-medio);">Diferença</span>
        <span style="font-weight:800;color:${(base||0)-totalDespesa>=0?'var(--verde-medio)':'var(--vermelho)'};">${fmt((base||0)-totalDespesa)}</span>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════
// ANÁLISE POR CARTÃO
// ══════════════════════════════════════════════════
function renderAnaliseCartao() {
  const el=$('analiseCartaoContent');
  if(!state.cartoes.length){
    el.innerHTML=`<div style="text-align:center;padding:48px;color:var(--texto-medio);">
      <div style="font-size:2rem;margin-bottom:12px;">💳</div>
      <p>Nenhum cartão cadastrado. Vá em Cartões para adicionar.</p></div>`;
    return;
  }

  const ano=state.currentYear;
  let html='';

  state.cartoes.forEach((c,idx)=>{
    const cor=getCorBanco(c.nome);
    const bg=c.corCustom?c.cor:cor.bg;

    // Dados mensais do ano
    const meses=[];
    let totalAno=0;
    for(let m=0;m<12;m++){
      const it=getLancamentosMes(m,ano).filter(l=>l.cartaoId===c.id);
      const total=it.reduce((s,l)=>s+parseFloat(l.valor||0),0);
      const byCat=getCatTotals(it);
      meses.push({m,total,byCat,items:it});
      totalAno+=total;
    }

    const mesMaior=meses.reduce((a,b)=>b.total>a.total?b:a);
    const mediaMensal=totalAno/12;
    const itMes=getLancamentosMes().filter(l=>l.cartaoId===c.id);
    const byCatMes=getCatTotals(itMes);
    const topCatMes=Object.entries(byCatMes).sort((a,b)=>b[1]-a[1])[0];

    html+=`
      <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:24px;">
        <div style="background:linear-gradient(135deg,${bg},${darkenHex(bg,30)});padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:#fff;">${escHtml(c.nome)}</div>
            <div style="font-size:0.78rem;color:rgba(255,255,255,0.75);">Limite: ${fmt(c.limite||0)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.75);">Total ${ano}</div>
            <div style="font-size:1.4rem;font-weight:800;color:#fff;">${fmt(totalAno)}</div>
          </div>
        </div>
        <div style="padding:20px 24px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
            <div style="background:var(--bege-claro);border-radius:10px;padding:14px;text-align:center;">
              <div style="font-size:0.7rem;color:var(--texto-medio);margin-bottom:4px;">MÊS ATUAL</div>
              <div style="font-weight:800;color:var(--vermelho);">${fmt(itMes.reduce((s,l)=>s+parseFloat(l.valor||0),0))}</div>
            </div>
            <div style="background:var(--bege-claro);border-radius:10px;padding:14px;text-align:center;">
              <div style="font-size:0.7rem;color:var(--texto-medio);margin-bottom:4px;">MÉDIA MENSAL</div>
              <div style="font-weight:800;color:var(--verde-medio);">${fmt(mediaMensal)}</div>
            </div>
            <div style="background:var(--bege-claro);border-radius:10px;padding:14px;text-align:center;">
              <div style="font-size:0.7rem;color:var(--texto-medio);margin-bottom:4px;">MAIOR MÊS</div>
              <div style="font-weight:800;color:var(--dourado-escuro);">${MONTHS[mesMaior.m]} ${fmt(mesMaior.total)}</div>
            </div>
          </div>

          <p style="font-size:0.78rem;font-weight:700;color:var(--texto-medio);text-transform:uppercase;margin-bottom:10px;">Gastos mensais ${ano}</p>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:16px;">
            ${meses.map(({m,total})=>{
              const pct=mediaMensal>0?Math.min(100,Math.round(total/mediaMensal*50)):0;
              return `<div style="text-align:center;">
                <div style="height:48px;display:flex;align-items:flex-end;justify-content:center;">
                  <div style="width:24px;height:${Math.max(4,pct)}%;min-height:4px;background:${m===state.currentMonth?bg:'var(--bege-escuro)'};border-radius:4px 4px 0 0;transition:height .3s;"></div>
                </div>
                <div style="font-size:0.62rem;color:var(--texto-medio);margin-top:2px;">${MONTHS[m]}</div>
                <div style="font-size:0.65rem;font-weight:700;color:${total>0?'var(--texto-escuro)':'var(--texto-medio)'};">${total>0?`R$${(total/1000).toFixed(1)}k`:'-'}</div>
              </div>`;
            }).join('')}
          </div>

          ${topCatMes?`
          <p style="font-size:0.78rem;font-weight:700;color:var(--texto-medio);text-transform:uppercase;margin-bottom:8px;">Principal categoria este mês</p>
          <div style="display:flex;align-items:center;gap:10px;background:var(--bege-claro);border-radius:10px;padding:12px 16px;">
            <span style="font-size:1.3rem;">${CAT_ICONS[topCatMes[0]]||'📦'}</span>
            <div><div style="font-weight:700;">${topCatMes[0]}</div><div style="font-size:0.8rem;color:var(--texto-medio);">${fmt(topCatMes[1])}</div></div>
          </div>`:''}
        </div>
      </div>`;
  });

  el.innerHTML=html;
}

// ══════════════════════════════════════════════════
// FLUXO DE CAIXA
// ══════════════════════════════════════════════════
function renderFluxo() {
  const el = $('fluxoContent');
  const ano = state.currentYear;

  // Monta dados por dia do mês atual
  const itensMes = getLancamentosMes();
  itensMes.sort((a,b) => new Date(a.data) - new Date(b.data));

  // Agrupa por data
  const porDia = {};
  itensMes.forEach(l => {
    if (!porDia[l.data]) porDia[l.data] = { entradas:[], saidas:[] };
    if (l.tipo === 'receita') porDia[l.data].entradas.push(l);
    else porDia[l.data].saidas.push(l);
  });

  // Calcula saldo acumulado
  let saldoAcum = 0;
  const diasOrdenados = Object.keys(porDia).sort();

  // Totais do mês
  const totalEntradas = sumBy(itensMes, 'receita');
  const totalSaidas   = sumBy(itensMes, 'despesa');
  const saldoMes      = totalEntradas - totalSaidas;

  // Cards de resumo do mês
  const resumo = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
      <div class="kpi-card kpi-receita">
        <div class="kpi-label">Total Entradas</div>
        <div class="kpi-val">${fmt(totalEntradas)}</div>
        <div class="kpi-sub">${MONTHS[state.currentMonth]}/${state.currentYear}</div>
      </div>
      <div class="kpi-card kpi-despesa">
        <div class="kpi-label">Total Saídas</div>
        <div class="kpi-val">${fmt(totalSaidas)}</div>
        <div class="kpi-sub">${MONTHS[state.currentMonth]}/${state.currentYear}</div>
      </div>
      <div class="kpi-card ${saldoMes >= 0 ? 'kpi-saldo' : 'kpi-despesa'}">
        <div class="kpi-label">Saldo do Mês</div>
        <div class="kpi-val">${fmt(saldoMes)}</div>
        <div class="kpi-sub">${saldoMes >= 0 ? '✅ Positivo' : '⚠️ Negativo'}</div>
      </div>
    </div>`;

  // Tabela diária
  let tabelaRows = '';
  if (!diasOrdenados.length) {
    tabelaRows = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--texto-medio);">Nenhum lançamento neste mês</td></tr>`;
  } else {
    diasOrdenados.forEach(dia => {
      const { entradas, saidas } = porDia[dia];
      const entTotal = entradas.reduce((s,l) => s + parseFloat(l.valor||0), 0);
      const saiTotal = saidas.reduce((s,l) => s + parseFloat(l.valor||0), 0);
      saldoAcum += entTotal - saiTotal;

      // Linha de data
      tabelaRows += `
        <tr style="background:var(--bege);">
          <td colspan="5" style="font-weight:700;font-size:0.8rem;color:var(--verde-escuro);padding:8px 14px;">
            📅 ${formatDate(dia)}
          </td>
        </tr>`;

      // Entradas do dia
      entradas.forEach(l => {
        tabelaRows += `
          <tr>
            <td style="padding-left:24px;">${CAT_ICONS[l.categoria]||'💚'} ${escHtml(l.descricao)}</td>
            <td style="color:var(--texto-medio);font-size:0.8rem;">${escHtml(l.categoria)}</td>
            <td style="color:var(--verde-positivo);font-weight:700;">+${fmt(l.valor)}</td>
            <td>—</td>
            <td></td>
          </tr>`;
      });

      // Saídas do dia
      saidas.forEach(l => {
        tabelaRows += `
          <tr>
            <td style="padding-left:24px;">${CAT_ICONS[l.categoria]||'📦'} ${escHtml(l.descricao)}</td>
            <td style="color:var(--texto-medio);font-size:0.8rem;">${escHtml(l.categoria)}</td>
            <td>—</td>
            <td style="color:var(--vermelho);font-weight:700;">-${fmt(l.valor)}</td>
            <td></td>
          </tr>`;
      });

      // Subtotal do dia
      const saldoDia = entTotal - saiTotal;
      tabelaRows += `
        <tr class="fluxo-total">
          <td colspan="2" style="font-size:0.78rem;color:var(--texto-medio);">Saldo do dia</td>
          <td style="color:var(--verde-positivo);">${entTotal > 0 ? fmt(entTotal) : '—'}</td>
          <td style="color:var(--vermelho);">${saiTotal > 0 ? fmt(saiTotal) : '—'}</td>
          <td class="${saldoAcum >= 0 ? 'fluxo-saldo-positivo' : 'fluxo-saldo-negativo'}">${fmt(saldoAcum)}</td>
        </tr>`;
    });
  }

  // Tabela anual — resumo por mês
  let tabelaAnual = '';
  let saldoAnualAcum = 0;
  for (let m = 0; m < 12; m++) {
    const it = getLancamentosMes(m, ano);
    const ent = sumBy(it, 'receita');
    const sai = sumBy(it, 'despesa');
    const sal = ent - sai;
    saldoAnualAcum += sal;
    const isAtual = m === state.currentMonth;
    tabelaAnual += `
      <tr class="${isAtual ? 'comp-row-atual' : ''}">
        <td style="font-weight:${isAtual?'700':'400'};">${MONTHS[m]}${isAtual?' ◀':''}</td>
        <td style="color:var(--verde-positivo);font-weight:600;">${ent > 0 ? fmt(ent) : '—'}</td>
        <td style="color:var(--vermelho);font-weight:600;">${sai > 0 ? fmt(sai) : '—'}</td>
        <td class="${sal >= 0 ? 'fluxo-saldo-positivo' : 'fluxo-saldo-negativo'}">${fmt(sal)}</td>
        <td class="${saldoAnualAcum >= 0 ? 'fluxo-saldo-positivo' : 'fluxo-saldo-negativo'}">${fmt(saldoAnualAcum)}</td>
      </tr>`;
  }

  el.innerHTML = `
    ${resumo}

    <div class="table-box" style="margin-bottom:20px;">
      <h3 class="chart-title">📊 Movimentação Diária — ${MONTHS[state.currentMonth]}/${state.currentYear}</h3>
      <div style="overflow-x:auto;">
        <table class="fluxo-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>${tabelaRows}</tbody>
          <tfoot>
            <tr class="fluxo-total">
              <td colspan="2"><strong>TOTAL DO MÊS</strong></td>
              <td class="fluxo-saldo-positivo">${fmt(totalEntradas)}</td>
              <td class="fluxo-saldo-negativo">${fmt(totalSaidas)}</td>
              <td class="${saldoMes >= 0 ? 'fluxo-saldo-positivo' : 'fluxo-saldo-negativo'}">${fmt(saldoMes)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="table-box">
      <h3 class="chart-title">📅 Fluxo Anual — ${ano}</h3>
      <div style="overflow-x:auto;">
        <table class="fluxo-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Saldo Mês</th>
              <th>Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>${tabelaAnual}</tbody>
        </table>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════
// COMPARATIVO MELHORADO — com cards de análise
// ══════════════════════════════════════════════════
function renderComparativoSummary(rows) {
  const comReceita = rows.filter(r => r.rec > 0);
  const melhorMes  = [...rows].sort((a,b) => b.saldo - a.saldo)[0];
  const piorMes    = [...rows].filter(r => r.rec > 0 || r.desp > 0).sort((a,b) => a.saldo - b.saldo)[0];
  const mediaRec   = comReceita.length ? comReceita.reduce((s,r) => s+r.rec,0) / comReceita.length : 0;
  const mediaDesp  = comReceita.length ? comReceita.reduce((s,r) => s+r.desp,0) / comReceita.length : 0;
  const totalEco   = rows.reduce((s,r) => s + Math.max(0, r.saldo), 0);

  const el = $('compSummary');
  if (!el) return;
  el.innerHTML = `
    <div class="comp-summary-card">
      <div class="comp-summary-label">Média Receita/mês</div>
      <div class="comp-summary-val" style="color:var(--verde-positivo);">${fmt(mediaRec)}</div>
      <div class="comp-summary-sub">últimos 12 meses</div>
    </div>
    <div class="comp-summary-card">
      <div class="comp-summary-label">Média Despesa/mês</div>
      <div class="comp-summary-val" style="color:var(--vermelho);">${fmt(mediaDesp)}</div>
      <div class="comp-summary-sub">últimos 12 meses</div>
    </div>
    <div class="comp-summary-card">
      <div class="comp-summary-label">Melhor Mês</div>
      <div class="comp-summary-val" style="color:var(--verde-medio);">${melhorMes ? melhorMes.mes : '—'}</div>
      <div class="comp-summary-sub">${melhorMes ? fmt(melhorMes.saldo) + ' de saldo' : ''}</div>
    </div>
    <div class="comp-summary-card">
      <div class="comp-summary-label">Total Economizado</div>
      <div class="comp-summary-val" style="color:var(--dourado-escuro);">${fmt(totalEco)}</div>
      <div class="comp-summary-sub">soma dos saldos positivos</div>
    </div>`;
}

// ══════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════
const TAB_TITLES = {
  dashboard:'Dashboard', lancamentos:'Lançamentos', cartoes:'Cartões de Crédito',
  relatorios:'Relatório Mensal', comparativo:'Comparativo Mensal',
  dre:'DRE — Resultado', caixinhas:'Método das Caixinhas',
  'analise-cartao':'Análise por Cartão', fluxo:'Fluxo de Caixa',
  'sobre-caixinhas':'As 6 Caixinhas Explicadas',
  comece:'Comece Aqui 🚀', configuracoes:'Configurações',
  termos:'Termos de Uso e Privacidade',
};

// ══════════════════════════════════════════════════
// CONFIGURAÇÕES
// ══════════════════════════════════════════════════
function getConfig() {
  try { return JSON.parse(localStorage.getItem('fp_config')||'{}'); } catch(e) { return {}; }
}
function saveConfig(cfg) { localStorage.setItem('fp_config', JSON.stringify(cfg)); }
function salvarConfig() {
  const cfg = getConfig();
  cfg.finnAtivo = $('toggleFinn') ? $('toggleFinn').checked : true;
  saveConfig(cfg);
}

// ══════════════════════════════════════════════════
// SINCRONIZAÇÃO
// ══════════════════════════════════════════════════
function setSyncStatus(status, msg) {
  const el = $('configSyncStatus');
  if (!el) return;
  const map = {
    ok:      { text:'✅ Conectado',      cls:'status-ok' },
    erro:    { text:'❌ Sem conexão',     cls:'status-erro' },
    sincronizando: { text:'🔄 Sincronizando...', cls:'status-sync' },
    pendente:{ text:'⏳ Não verificado', cls:'status-pendente' },
  };
  const s = map[status] || map.pendente;
  el.textContent = msg || s.text;
  el.className = 'config-val config-status-badge ' + s.cls;
}

function setUltimoSync() {
  const el = $('configUltimoSync');
  if (el) el.textContent = new Date().toLocaleString('pt-BR');
  localStorage.setItem('fp_ultimo_sync', new Date().toISOString());
}

function addSyncLog(msg, tipo = 'info') {
  const log = $('syncLog');
  if (!log) return;
  log.style.display = 'block';
  const cores = { info:'var(--texto-medio)', ok:'var(--verde-positivo)', erro:'var(--vermelho)', warn:'var(--dourado-escuro)' };
  const line = document.createElement('div');
  line.style.cssText = `font-size:0.78rem;padding:3px 0;color:${cores[tipo]||cores.info};border-bottom:1px solid var(--bege);`;
  line.textContent = `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`;
  log.insertBefore(line, log.firstChild);
  if (log.children.length > 8) log.removeChild(log.lastChild);
}

async function testarConexao() {
  setSyncStatus('sincronizando', '🔄 Testando...');
  addSyncLog('Iniciando teste de conexão...', 'info');
  try {
    const params = 'action=checkAccess&email=' + encodeURIComponent(state.user.email);
    const data = await sheetsGET(params);
    if (data && data.authorized !== undefined) {
      setSyncStatus('ok');
      addSyncLog('Conexão com Google Sheets: OK ✅', 'ok');
      addSyncLog('E-mail autorizado: ' + state.user.email, 'ok');
    } else {
      setSyncStatus('erro');
      addSyncLog('Resposta inesperada: ' + JSON.stringify(data).slice(0,80), 'warn');
    }
  } catch(e) {
    setSyncStatus('erro');
    addSyncLog('Erro de conexão: ' + e.message, 'erro');
    addSyncLog('Verifique se a URL do Apps Script está correta e reimplantada.', 'warn');
  }
}

async function sincronizarAgora() {
  setSyncStatus('sincronizando', '🔄 Sincronizando...');
  addSyncLog('Baixando dados do Google Sheets...', 'info');
  try {
    const params = 'action=getData&email=' + encodeURIComponent(state.user.email);
    const data = await sheetsGET(params);
    if (data && data.lancamentos) {
      const antesL = state.lancamentos.length;
      const antesC = state.cartoes.length;
      state.lancamentos = data.lancamentos;
      if (data.cartoes && data.cartoes.length > 0) {
        state.cartoes = data.cartoes;
      } else if (state.cartoes.length > 0) {
        addSyncLog('Cartões locais detectados — enviando para Sheets...', 'info');
        state.cartoes.forEach(c => saveCartaoSheets(c));
      }
      saveLocal();
      renderAll();
      setSyncStatus('ok');
      setUltimoSync();
      addSyncLog(`✅ ${data.lancamentos.length} lançamentos (antes: ${antesL})`, 'ok');
      addSyncLog(`✅ ${state.cartoes.length} cartões (antes: ${antesC})`, 'ok');
      renderConfiguracoes();
    } else {
      setSyncStatus('erro');
      addSyncLog('Sheets não retornou dados: ' + JSON.stringify(data).slice(0,80), 'warn');
    }
  } catch(e) {
    setSyncStatus('erro');
    addSyncLog('Erro ao sincronizar: ' + e.message, 'erro');
  }
}

async function enviarParaSheets() {
  if (!state.lancamentos.length && !state.cartoes.length) {
    addSyncLog('Nenhum dado local para enviar.', 'warn');
    return;
  }
  setSyncStatus('sincronizando', '🔄 Enviando...');
  addSyncLog(`Enviando ${state.lancamentos.length} lançamentos e ${state.cartoes.length} cartões...`, 'info');
  // Envia lançamentos
  for (const lanc of state.lancamentos) {
    await sheetsPOST({ action:'saveData', email: state.user.email, lancamento: lanc });
  }
  // Envia cartões
  for (const c of state.cartoes) {
    await saveCartaoSheets(c);
  }
  setSyncStatus('ok');
  setUltimoSync();
  addSyncLog(`✅ Envio concluído — ${state.lancamentos.length} lançamentos, ${state.cartoes.length} cartões`, 'ok');
}

function renderConfiguracoes() {
  if ($('configEmail')) $('configEmail').textContent = state.user?.email || '—';
  if ($('configNome'))  $('configNome').textContent  = state.user?.name  || '—';
  if ($('configTotalLanc'))    $('configTotalLanc').textContent    = state.lancamentos.length;
  if ($('configTotalCartoes')) $('configTotalCartoes').textContent = state.cartoes.length;
  const cfg = getConfig();
  const toggle = $('toggleFinn');
  if (toggle) toggle.checked = cfg.finnAtivo !== false;
  // Último sync
  const ultimo = localStorage.getItem('fp_ultimo_sync');
  const ultimoEl = $('configUltimoSync');
  if (ultimoEl && ultimo) ultimoEl.textContent = new Date(ultimo).toLocaleString('pt-BR');
  // Limpar log ao abrir
  const log = $('syncLog');
  if (log) { log.style.display = 'none'; log.innerHTML = ''; }
  setSyncStatus('pendente');
}

// ══════════════════════════════════════════════════
// EXPORTAÇÃO CSV / GOOGLE DRIVE
// ══════════════════════════════════════════════════
function exportarCSV(tipo = 'lancamentos') {
  let csv = '', nome = '';

  if (tipo === 'lancamentos') {
    nome = `financaspro_lancamentos_${MONTHS[state.currentMonth]}${state.currentYear}.csv`;
    const items = getLancamentosMes();
    csv = 'Data,Tipo,Descrição,Categoria,Valor,Pagamento,Parcelado,Parcela,Total Parcelas,Juros R$,% Juros,Observação\n';
    items.forEach(l => {
      csv += [
        l.data, l.tipo, '"'+escHtml(l.descricao)+'"', l.categoria,
        parseFloat(l.valor||0).toFixed(2).replace('.',','),
        '"'+(l.pagamento||'')+'"',
        l.parcelado ? 'Sim' : 'Não',
        l.parcelado ? (l.parcelaAtual||1) : '',
        l.parcelado ? (l.nParcelas||1) : '',
        l.parcelado ? (parseFloat(l.jurosReais||0).toFixed(2).replace('.',',')) : '',
        l.parcelado ? (l.pctJuros||0)+'%' : '',
        '"'+(l.obs||'')+'"',
      ].join(';') + '\n';
    });
  }

  if (tipo === 'anual') {
    nome = `financaspro_anual_${state.currentYear}.csv`;
    csv = 'Mês,Receitas,Despesas,Saldo,Taxa Economia%\n';
    for (let m = 0; m < 12; m++) {
      const it = getLancamentosMes(m, state.currentYear);
      const rec  = sumBy(it, 'receita');
      const desp = sumBy(it, 'despesa');
      const sal  = rec - desp;
      const taxa = rec > 0 ? ((sal/rec)*100).toFixed(1) : 0;
      csv += `${MONTHS[m]}/${state.currentYear};${rec.toFixed(2).replace('.',',')};${desp.toFixed(2).replace('.',',')};${sal.toFixed(2).replace('.',',')};${taxa}%\n`;
    }
  }

  if (tipo === 'cartoes') {
    nome = `financaspro_cartoes_${MONTHS[state.currentMonth]}${state.currentYear}.csv`;
    csv = 'Cartão,Limite,Fechamento,Vencimento,Fatura do Mês,% Utilizado\n';
    const mes = getLancamentosMes();
    state.cartoes.forEach(c => {
      const fat   = mes.filter(l => l.cartaoId === c.id).reduce((s,l) => s+parseFloat(l.valor||0), 0);
      const pct   = c.limite > 0 ? ((fat/c.limite)*100).toFixed(1) : 0;
      csv += `"${c.nome}";${(c.limite||0).toFixed(2).replace('.',',')};${c.fechamento||''};${c.vencimento||''};${fat.toFixed(2).replace('.',',')};${pct}%\n`;
    });
  }

  // Download
  const BOM = '\uFEFF'; // BOM para Excel reconhecer UTF-8
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
}

function abrirNoGoogleSheets() {
  // Abre a planilha financeira do usuário direto
  const sheetsUrl = 'https://docs.google.com/spreadsheets/';
  window.open(sheetsUrl, '_blank');
}

function exportarDados() {
  const data = { lancamentos: state.lancamentos, cartoes: state.cartoes, exportadoEm: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `financaspro_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}
function limparDados() {
  if (!confirm('⚠️ Isso apagará todos os dados locais. Os dados no Google Sheets não serão afetados. Continuar?')) return;
  localStorage.removeItem('fp_lancamentos');
  localStorage.removeItem('fp_cartoes');
  state.lancamentos = []; state.cartoes = [];
  renderAll();
  alert('Dados locais limpos!');
}

// ══════════════════════════════════════════════════
// TRANSIÇÃO FINN
// ══════════════════════════════════════════════════
function showFinnTransition(callback) {
  const cfg = getConfig();
  if (cfg.finnAtivo === false) { if (callback) callback(); return; }
  const msg = FINN_MSGS[Math.floor(Math.random() * FINN_MSGS.length)];
  const el = $('finnTransition');
  const msgEl = $('finnTransitionMsg');
  if (!el || !msgEl) { if (callback) callback(); return; }
  msgEl.textContent = msg;
  el.style.display = 'flex';
  el.style.opacity = '0';
  setTimeout(() => { el.style.opacity = '1'; }, 10);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.display = 'none';
      if (callback) callback();
    }, 400);
  }, 2200);
}

function switchTab(tab) {
  if (tab !== 'dashboard') {
    showFinnTransition(() => _doSwitchTab(tab));
  } else {
    _doSwitchTab(tab);
  }
  closeSidebar();
}

function _doSwitchTab(tab) {
  $('topbarTitle').textContent = TAB_TITLES[tab] || tab;
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const tabEl = $('tab-' + tab);
  if (tabEl) tabEl.style.display = 'block';
  document.querySelector('[data-tab="' + tab + '"]')?.classList.add('active');
  if (tab === 'relatorios')     renderRelatorio();
  if (tab === 'comparativo')    renderComparativo();
  if (tab === 'dre')            renderDRE();
  if (tab === 'caixinhas')      renderCaixinhas();
  if (tab === 'analise-cartao') renderAnaliseCartao();
  if (tab === 'fluxo')          renderFluxo();
  if (tab === 'configuracoes')  renderConfiguracoes();
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
// FINN POPUP (canto inferior)
// ══════════════════════════════════════════════════
function showFinn() {
  const el = $('finn');
  const msg = FINN_MSGS[Math.floor(Math.random() * FINN_MSGS.length)];
  if ($('finnMsg')) $('finnMsg').textContent = msg;
  if (el) el.style.display = 'flex';
  setTimeout(closeFinn, 3200);
}
function closeFinn() {
  const el = $('finn');
  if (el) el.style.display = 'none';
}

// ══════════════════════════════════════════════════
// INIT DOM
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const fData = $('fData');
  if (fData) fData.value = today;
  const modal     = $('modal');
  const cardModal = $('cardModal');
  if (modal)     modal.addEventListener('click',     e => { if (e.target === modal)     closeModal(); });
  if (cardModal) cardModal.addEventListener('click', e => { if (e.target === cardModal) closeCardModal(); });
});
