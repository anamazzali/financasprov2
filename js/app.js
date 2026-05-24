/* FinançasPro — app.js v3.0 */
'use strict';

// ══════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════
const CONFIG = {
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbx4v-zbJtaraPD578ScMOYnLTupDW7XAdXoBxPacDnPbk0FrCc4KuXy9sGLIHLu7hdXNQ/exec',
};

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
  { key:'necessidades', label:'Necessidades',        pct:50, cor:'#2D6A4F', icon:'🏠',
    cats:['Moradia','Alimentação','Transporte','Saúde','Seguros','Impostos','Empréstimos'] },
  { key:'doacao',       label:'Doação / Contribuição', pct:10, cor:'#D4AF37', icon:'❤️',
    cats:['Doações','Igreja/Religião','Presentes'] },
  { key:'educacao',     label:'Educação',             pct:10, cor:'#52B788', icon:'📚',
    cats:['Educação'] },
  { key:'lazer',        label:'Lazer',                pct:10, cor:'#F0CB5E', icon:'🎬',
    cats:['Entretenimento','Cuidados Pessoais','Pet'] },
  { key:'invest_longo', label:'Invest. Longo Prazo',  pct:10, cor:'#1B7A3E', icon:'💹',
    cats:['Investimentos Longo Prazo'] },
  { key:'invest_curto', label:'Invest. Curto Prazo',  pct:10, cor:'#A07820', icon:'📈',
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
async function loadFromSheets() {
  if (!state.user) return;
  try {
    const res  = await fetch(`${CONFIG.SHEETS_URL}?action=getData&email=${encodeURIComponent(state.user.email)}`);
    const data = await res.json();
    if (data.lancamentos) {
      state.lancamentos = data.lancamentos;
      if (data.cartoes) state.cartoes = data.cartoes;
      saveLocal(); renderAll();
    }
  } catch(e) {}
}
async function saveToSheets(lancamento) {
  if (!state.user || !CONFIG.SHEETS_URL.startsWith('https')) return;
  try {
    await fetch(CONFIG.SHEETS_URL, {
      method:'POST',
      body: JSON.stringify({ action:'saveData', email: state.user.email, lancamento }),
    });
  } catch(e) {}
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
  state.editId=edit?edit.id:null;
  $('modalTitle').textContent=edit?'Editar Lançamento':'Novo Lançamento';
  const today=new Date().toISOString().split('T')[0];
  $('fTipo').value=edit?edit.tipo:'despesa';
  $('fDesc').value=edit?edit.descricao:'';
  $('fValor').value=edit?edit.valor:'';
  $('fData').value=edit?edit.data:today;
  $('fPagamento').value=edit?(edit.pagamento||'🏦 PIX'):'🏦 PIX';
  $('fObs').value=edit?(edit.obs||''):'';
  $('fRecorrente').checked=edit?!!edit.recorrente:false;
  updateCategorias();
  if(edit) $('fCategoria').value=edit.categoria;
  toggleCartaoRow();
  $('modal').style.display='flex';
}
function closeModal(){$('modal').style.display='none';}

function toggleCartaoRow() {
  const show=$('fPagamento').value.includes('Crédito');
  $('cartaoRow').style.display=show?'flex':'none';
  if(show){
    $('fCartao').innerHTML=state.cartoes.length
      ?state.cartoes.map(c=>`<option value="${c.id}">${escHtml(c.nome)}</option>`).join('')
      :'<option value="">Nenhum cartão cadastrado</option>';
  }
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
  if(state.editId){
    const idx=state.lancamentos.findIndex(l=>l.id===state.editId);
    if(idx!==-1) state.lancamentos[idx]={...state.lancamentos[idx],tipo,descricao:desc,valor,categoria:cat,data,pagamento:pag,obs,recorrente:rec};
  } else {
    const novo={
      id:'l_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      tipo,descricao:desc,valor,categoria:cat,data,pagamento:pag,obs,recorrente:rec,
      cartaoId:pag.includes('Crédito')?($('fCartao').value||''):'',
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
          <button onclick="deleteCartao('${c.id}')" style="background:none;border:none;color:rgba(255,255,255,0.75);cursor:pointer;" title="Remover">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function openCardModal(){
  $('cNome').value='';$('cLimite').value='';
  $('cFechamento').value='';$('cVencimento').value='';
  $('cCor').value='#2D6A4F';$('cCorCustom').checked=false;
  $('cCorRow').style.display='none';
  $('cardModal').style.display='flex';
}
function closeCardModal(){$('cardModal').style.display='none';}
function toggleCorCustom(){
  $('cCorRow').style.display=$('cCorCustom').checked?'flex':'none';
}
function saveCard(){
  const nome=$('cNome').value.trim();
  const limite=parseFloat($('cLimite').value)||0;
  const fechamento=parseInt($('cFechamento').value)||15;
  const vencimento=parseInt($('cVencimento').value)||22;
  const corCustom=$('cCorCustom').checked;
  const cor=corCustom?$('cCor').value:getCorBanco(nome).bg;
  if(!nome){alert('Informe o nome do cartão.');return;}
  state.cartoes.push({id:'c_'+Date.now(),nome,limite,fechamento,vencimento,cor,corCustom});
  saveLocal();closeCardModal();renderCartoes();
}
function deleteCartao(id){
  if(!confirm('Remover este cartão?'))return;
  state.cartoes=state.cartoes.filter(c=>c.id!==id);
  saveLocal();renderCartoes();
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
    <p class="rel-text">Receitas: <strong style="color:var(--verde-positivo);">${fmt(receita)}</strong> &nbsp;|&nbsp; Despesas: <strong style="color:var(--vermelho);">${fmt(despesa)}</strong> &nbsp;|&nbsp; Saldo: <strong style="color:${saldoCor};">${fmt(saldo)}</strong></p>
    <p class="rel-text">${taxaStatus}</p>
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
// TABS
// ══════════════════════════════════════════════════
const TAB_TITLES = {
  dashboard:'Dashboard', lancamentos:'Lançamentos', cartoes:'Cartões de Crédito',
  relatorios:'Relatório Mensal', comparativo:'Comparativo Mensal',
  dre:'DRE — Resultado', caixinhas:'Método das Caixinhas', 'analise-cartao':'Análise por Cartão',
};

function switchTab(tab) {
  $('topbarTitle').textContent=TAB_TITLES[tab]||tab;
  document.querySelectorAll('.tab-content').forEach(el=>el.style.display='none');
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  $(`tab-${tab}`).style.display='block';
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
  if(tab==='relatorios')     renderRelatorio();
  if(tab==='comparativo')    renderComparativo();
  if(tab==='dre')            renderDRE();
  if(tab==='caixinhas')      renderCaixinhas();
  if(tab==='analise-cartao') renderAnaliseCartao();
  closeSidebar();
  if(Math.random()<0.3) showFinn();
}

function toggleSidebar(){$('sidebar').classList.toggle('open');$('sidebarOverlay').classList.toggle('open');}
function closeSidebar(){$('sidebar').classList.remove('open');$('sidebarOverlay').classList.remove('open');}

function showFinn(){
  $('finnMsg').textContent=FINN_MSGS[Math.floor(Math.random()*FINN_MSGS.length)];
  $('finn').style.display='flex';
  setTimeout(closeFinn,3200);
}
function closeFinn(){const el=$('finn');if(el)el.style.display='none';}

document.addEventListener('DOMContentLoaded',()=>{
  const today=new Date().toISOString().split('T')[0];
  const fData=$('fData');if(fData)fData.value=today;
  $('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal();});
  $('cardModal').addEventListener('click',e=>{if(e.target===$('cardModal'))closeCardModal();});
});
