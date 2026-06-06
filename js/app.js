/* FinançasProV2 — app.js v3.0 */
'use strict';

// ══════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════
const CONFIG = {
  // URL do Apps Script — autorização + webhook Hotmart (não muda)
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbx4v-zbJtaraPD578ScMOYnLTupDW7XAdXoBxPacDnPbk0FrCc4KuXy9sGLIHLu7hdXNQ/exec',
  // Google Client ID — mesmo do Google Sign-In (cole o seu)
  GOOGLE_CLIENT_ID: '415111664058-jgshiqlt2qbidcd5frdrg59omjelkg2u.apps.googleusercontent.com',
};

// APIs do Google usadas para gravar/ler na planilha DA CLIENTE
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API  = 'https://www.googleapis.com/drive/v3/files';
// Escopos necessários para criar e editar a planilha da cliente
const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');


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
// Categorias padrão (fallback)
const _CATS_DESP_DEFAULT = [
  'Moradia','Educação','Transporte','Seguros','Alimentação','Pet',
  'Cuidados Pessoais','Entretenimento',
  'Investimentos Curto Prazo','Investimentos Longo Prazo',
  'Empréstimos','Igreja/Religião','Impostos',
  'Presentes','Doações','Jurídico','Saúde',
];
const _CATS_REC_DEFAULT = [
  'Salário','Renda Extra','Freelance','Investimentos',
  'Vale Alimentação','Vale Transporte','Outros',
];
// Carrega do localStorage (permite edição pelo usuário)
function getCatDespesa() {
  try { const s=localStorage.getItem('fp_cats_despesa'); return s?JSON.parse(s):_CATS_DESP_DEFAULT; } catch(e){return _CATS_DESP_DEFAULT;}
}
function getCatReceita() {
  try { const s=localStorage.getItem('fp_cats_receita'); return s?JSON.parse(s):_CATS_REC_DEFAULT; } catch(e){return _CATS_REC_DEFAULT;}
}
function saveCats(despesa, receita) {
  localStorage.setItem('fp_cats_despesa', JSON.stringify(despesa));
  localStorage.setItem('fp_cats_receita', JSON.stringify(receita));
}
// Mantém as constantes para compatibilidade com restante do código
let CATEGORIAS_DESPESA = getCatDespesa();
let CATEGORIAS_RECEITA = getCatReceita();
function reloadCats() {
  CATEGORIAS_DESPESA = getCatDespesa();
  CATEGORIAS_RECEITA = getCatReceita();
}
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
const _CAIXINHAS_DEFAULT = [
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
function getCaixinhas() {
  try { const s=localStorage.getItem('fp_caixinhas'); return s?JSON.parse(s):JSON.parse(JSON.stringify(_CAIXINHAS_DEFAULT)); }
  catch(e) { return JSON.parse(JSON.stringify(_CAIXINHAS_DEFAULT)); }
}
function saveCaixinhasConfig(arr) { localStorage.setItem('fp_caixinhas', JSON.stringify(arr)); }
let CAIXINHAS = getCaixinhas();

// ── Edição de caixinhas ──────────────────────────────────────────────────────
function openCaixinhasEdit() {
  const cx = getCaixinhas();
  const rows = cx.map((c,i) => `
    <div class="cxedit-row">
      <span class="cxedit-icon">${c.icon}</span>
      <div class="cxedit-fields">
        <input type="text" class="cxedit-nome" data-idx="${i}" value="${escHtml(c.label)}" placeholder="Nome" />
        <div style="display:flex;align-items:center;gap:6px;">
          <input type="number" class="cxedit-pct" data-idx="${i}" value="${c.pct}" min="1" max="100" style="width:70px;" />
          <span style="font-size:0.8rem;color:var(--texto-medio);">%</span>
          <input type="color" class="cxedit-cor" data-idx="${i}" value="${c.cor}" style="width:40px;height:32px;border:none;cursor:pointer;border-radius:6px;" />
        </div>
      </div>
    </div>`).join('');
  const el = $('cxEditContent');
  if (el) el.innerHTML = rows;
  $('cxEditModal').style.display = 'flex';
}
function closeCaixinhasEdit() { $('cxEditModal').style.display='none'; }
function saveCaixinhasEdit() {
  const cx = getCaixinhas();
  document.querySelectorAll('.cxedit-row').forEach((row, i) => {
    const nomeEl = row.querySelector('.cxedit-nome');
    const pctEl  = row.querySelector('.cxedit-pct');
    const corEl  = row.querySelector('.cxedit-cor');
    if (nomeEl && pctEl && corEl && cx[i]) {
      cx[i].label = nomeEl.value.trim() || cx[i].label;
      cx[i].pct   = parseInt(pctEl.value) || cx[i].pct;
      cx[i].cor   = corEl.value;
    }
  });
  saveCaixinhasConfig(cx);
  CAIXINHAS = getCaixinhas();
  closeCaixinhasEdit();
  renderCaixinhas();
}
function resetCaixinhas() {
  if (!confirm('Restaurar as caixinhas para os valores padrão?')) return;
  localStorage.removeItem('fp_caixinhas');
  CAIXINHAS = getCaixinhas();
  closeCaixinhasEdit();
  renderCaixinhas();
}

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
  'Seu dinheiro precisa de direção, não de sorte. 🧭',
  'Pequenos hábitos criam grandes patrimônios. 🌱',
  'Controle hoje. Liberdade amanhã. 🔓',
  'Cada real tem uma missão. 🎯',
  'Organizar as finanças é cuidar da sua paz. 🕊️',
  'O orçamento é o mapa da tranquilidade. 🗺️',
  'Quem planeja, vive com mais leveza. 😌',
  'Sua disciplina vale mais que sua renda. 💪',
  'Prosperidade começa na organização. 🌟',
  'Gastar menos é abrir espaço para sonhos. 💭',
  'Seu futuro agradece cada escolha consciente. 🌅',
  'Dinheiro bem cuidado trabalha por você. 💹',
  'Toda conquista começa no planejamento. 🏆',
  'Economia inteligente também é autocuidado. 💆',
  'Liberdade financeira nasce das pequenas decisões. 🦋',
  'O equilíbrio financeiro transforma vidas. ⚖️',
  'Planejar é dar valor ao seu esforço. 🙌',
  'Mais controle. Menos preocupação. 😊',
  'Sua meta financeira começa agora. 🚀',
  'Não é sobre ganhar mais. É sobre administrar melhor. 🧠',
  'Organização financeira é poder silencioso. 💎',
  'Quem controla os gastos controla o futuro. 🔑',
  'Seu orçamento pode mudar sua história. 📖',
  'Cada economia aproxima um objetivo. 🎯',
  'Dinheiro consciente, vida equilibrada. ⚖️',
  'Priorize sonhos, não impulsos. ✨',
  'Crescimento financeiro é construção diária. 🏗️',
  'Seu bolso merece atenção inteligente. 💡',
  'Prosperar é um processo, não um acaso. 📈',
  'O hábito de planejar vale ouro. 🥇',
  'Mais clareza financeira, mais qualidade de vida. 🌈',
  'Seu patrimônio começa nos detalhes. 🔍',
  'Controle financeiro é liberdade em parcelas diárias. 🗓️',
  'Faça o dinheiro seguir seus objetivos. 🎯',
  'Organização hoje, estabilidade amanhã. 🏡',
  'A disciplina financeira abre portas invisíveis. 🚪',
  'Planejamento transforma metas em realidade. 🌟',
  'Sua vida muda quando suas finanças mudam. 🦋',
  'Dinheiro alinhado, mente tranquila. 🧘',
  'Economizar é investir em você mesmo. 💚',
  'Toda escolha financeira desenha seu futuro. ✏️',
  'O sucesso financeiro começa no básico. 🧱',
  'Inteligência financeira é uma habilidade de vida. 🎓',
  'Menos desperdício. Mais propósito. 🌿',
  'Cuidar do orçamento é cuidar da liberdade. 🕊️',
  'Sua constância vale mais que a pressa. 🐢',
  'Finanças organizadas geram oportunidades. 🚪',
  'O controle financeiro fortalece sonhos. 💪',
  'Seu futuro financeiro começa nas decisões de hoje. ⏰',
  'Equilíbrio financeiro é qualidade de vida. 🌈',
];

// ══════════════════════════════════════════════════
// ESTADO
// ══════════════════════════════════════════════════
const state = {
  user:         null,
  lancamentos:  [],
  cartoes:      [],
  currentMonth: new Date().getMonth(),
  currentYear:  new Date().getFullYear(),
  editId:       null,
  charts:       {},
  // v3.0 — planilha da cliente no Google Drive dela
  sheetsId:     null,   // ID da planilha no Drive da cliente
  accessToken:  null,   // Token OAuth para Sheets API
  tokenExpiry:  0,      // Timestamp de expiração do token
  tokenClient:  null,   // google.accounts.oauth2 client
  _credJwt:     null,   // JWT do Google Sign-In (guardado para re-auth)
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
  state._credJwt = payload; // guarda para re-auth se necessário
  checkAccess(payload.email, payload);
}

function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(atob(base64));
}

async function checkAccess(email, payload) {
  try {
    // Verifica autorização — continua via planilha de clientes do admin
    const res  = await fetch(`${CONFIG.SHEETS_URL}?action=checkAccess&email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.authorized) {
      state.user     = { email, name: payload.name, picture: payload.picture };
      state.sheetsId = data.sheetsId || null; // sheetsId salvo de login anterior
      // Inicializa o cliente OAuth para Sheets API
      _inicializarTokenClient();
      initApp();
    } else {
      showAccessDenied();
    }
  } catch(e) {
    console.warn('Servidor offline, modo local:', e);
    state.user = { email, name: payload.name, picture: payload.picture };
    _inicializarTokenClient();
    initApp();
  }
}

function _inicializarTokenClient() {
  if (!window.google || !google.accounts || !google.accounts.oauth2) return;
  state.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope:     OAUTH_SCOPES,
    prompt:    '',
    callback:  (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        state.accessToken = tokenResponse.access_token;
        state.tokenExpiry = Date.now() + (tokenResponse.expires_in - 60) * 1000;
        localStorage.setItem('fp_token_expiry', state.tokenExpiry);
        sessionStorage.setItem('fp_access_token', state.accessToken);
        sessionStorage.setItem('fp_token_expiry', String(state.tokenExpiry));
        console.log('[Auth] Token OAuth obtido — Sheets API disponível');
        // Nota: setupSheetsCliente() é chamado apenas em ações explícitas (Enviar/Sincronizar)
        // para evitar que loadFromSheets() sobrescreva dados locais não sincronizados
      }
    },
  });
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
  localStorage.removeItem('fp_user');
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
  localStorage.setItem('fp_user', JSON.stringify(state.user));
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
  setTimeout(showFinn, 1200);
  // Obtém token OAuth automaticamente após login para sincronização automática.
  // Se o usuário já autorizou antes: silencioso (sem popup).
  // Se é a primeira vez: abre popup do Google UMA vez (durante o login, não durante o uso).
  setTimeout(async () => {
    if (!state.tokenClient) _inicializarTokenClient();
    const ok = await garantirToken(true);
    if (ok && state.sheetsId) {
      // Se já tem planilha configurada e tem dados locais, sobe automaticamente
      if (state.lancamentos.length > 0 || state.cartoes.length > 0) {
        await _syncParaSheetsCliente();
      }
    } else if (ok && !state.sheetsId) {
      // Cria planilha se não existir ainda
      await setupSheetsCliente();
    }
  }, 3000);
  // Primeira visita — abre Comece Aqui automaticamente
  if (!localStorage.getItem('fp_visitou')) {
    localStorage.setItem('fp_visitou', '1');
    setTimeout(() => switchTab('comece'), 400);
  }
}

// ══════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// STORAGE LOCAL
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
// COMUNICAÇÃO COM APPS SCRIPT — só para auth e admin
// ══════════════════════════════════════════════════
function sheetsGET(params) {
  return new Promise((resolve, reject) => {
    const cbName = '_fp_cb_' + Date.now();
    const url = CONFIG.SHEETS_URL + '?' + params + '&callback=' + cbName;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout — verifique a URL do Apps Script'));
    }, 15000);
    window[cbName] = function(data) { cleanup(); resolve(data); };
    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    script.onerror = (e) => { cleanup(); reject(new Error('Erro ao carregar script')); };
    script.src = url;
    document.head.appendChild(script);
  });
}

function sheetsPOST(body) {
  return fetch(CONFIG.SHEETS_URL, {
    method: 'POST',
    mode:   'no-cors',
    body:   JSON.stringify(body),
  }).then(() => ({ success: true })).catch(() => ({ success: false }));
}

// ══════════════════════════════════════════════════
// OAUTH — token para Sheets API da cliente
// ══════════════════════════════════════════════════
// garantirToken(forcarPopup=false)
// false = retorna false imediatamente se não houver token em cache (sem popup)
// true  = abre popup do Google para o usuário autorizar (só em ações explícitas)
async function garantirToken(forcarPopup = false) {
  if (state.accessToken && Date.now() < state.tokenExpiry) return true;
  // Tenta restaurar da sessionStorage — persiste enquanto a aba estiver aberta (sem popup)
  const sessToken  = sessionStorage.getItem('fp_access_token');
  const sessExpiry = parseInt(sessionStorage.getItem('fp_token_expiry') || '0');
  if (sessToken && Date.now() < sessExpiry) {
    state.accessToken = sessToken;
    state.tokenExpiry = sessExpiry;
    return true;
  }
  if (!forcarPopup || !state.tokenClient) return false;
  return new Promise((resolve) => {
    const prev = state.tokenClient.callback;
    state.tokenClient.callback = (resp) => {
      state.tokenClient.callback = prev;
      if (resp && resp.access_token) {
        state.accessToken = resp.access_token;
        state.tokenExpiry = Date.now() + (resp.expires_in - 60) * 1000;
        sessionStorage.setItem('fp_access_token', state.accessToken);
        sessionStorage.setItem('fp_token_expiry', String(state.tokenExpiry));
        resolve(true);
      } else { resolve(false); }
    };
    state.tokenClient.requestAccessToken();
  });
}

// ══════════════════════════════════════════════════
// SHEETS API — lê/grava na planilha DA CLIENTE
// ══════════════════════════════════════════════════

// Cabeçalhos das abas
const CAB_LANC  = ['ID','Tipo','Descrição','Valor','Categoria','Data','Observação','Pagamento','Recorrente','CartaoID'];
const CAB_CART  = ['ID','Nome','Limite','Fechamento','Vencimento','Cor','CorCustom'];

async function fpSheetsEscrever(aba, valores) {
  if (!state.sheetsId) { addSyncLog('sheetsId não configurado.', 'error'); return false; }
  if (!state.accessToken || Date.now() >= state.tokenExpiry) {
    addSyncLog('Token OAuth expirado. Clique em "Enviar" novamente para reautorizar.', 'warn');
    return false;
  }
  try {
    const range = encodeURIComponent(`'${aba}'!A1`);
    const res = await fetch(
      `${SHEETS_API}/${state.sheetsId}/values/${range}?valueInputOption=RAW`,
      {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ values: valores }),
      }
    );
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errData = await res.json();
        if (errData.error) errMsg = errData.error.message || errMsg;
      } catch(_) {}
      addSyncLog(`Erro ao gravar aba "${aba}": ${errMsg}`, 'error');
      // Se a aba não existe (404/400), tenta criar e repetir
      if (res.status === 400 || res.status === 404) {
        addSyncLog('Tentando criar aba "' + aba + '"...', 'info');
        const criou = await _criarAba(aba);
        if (criou) return fpSheetsEscrever(aba, valores);
      }
      return false;
    }
    return true;
  } catch(e) {
    addSyncLog('Erro de rede ao gravar: ' + (e.message || e), 'error');
    return false;
  }
}

// Verifica quais abas existem e cria as que faltam
async function _garantirAbas(nomes) {
  if (!state.sheetsId || !state.accessToken || Date.now() >= state.tokenExpiry) return;
  try {
    const res = await fetch(
      `${SHEETS_API}/${state.sheetsId}?fields=sheets(properties(title))`,
      { headers: { 'Authorization': `Bearer ${state.accessToken}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    const existentes = (data.sheets || []).map(s => s.properties.title);
    for (const nome of nomes) {
      if (!existentes.includes(nome)) {
        addSyncLog(`Criando aba "${nome}"...`, 'info');
        await _criarAba(nome);
      }
    }
  } catch(e) { console.warn('_garantirAbas:', e); }
}

// Cria uma aba na planilha se não existir
async function _criarAba(titulo) {
  try {
    const res = await fetch(`${SHEETS_API}/${state.sheetsId}:batchUpdate`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: titulo } } }] }),
    });
    return res.ok;
  } catch(e) { return false; }
}

async function fpSheetsLer(aba) {
  if (!state.sheetsId || !await garantirToken()) return [];
  try {
    const range = encodeURIComponent(`'${aba}'!A:Z`);
    const res  = await fetch(
      `${SHEETS_API}/${state.sheetsId}/values/${range}`,
      { headers: { 'Authorization': `Bearer ${state.accessToken}` } }
    );
    const data = await res.json();
    return data.values || [];
  } catch(e) { console.warn('fpSheetsLer:', e); return []; }
}

// ══════════════════════════════════════════════════
// SETUP DA PLANILHA DA CLIENTE
// ══════════════════════════════════════════════════

async function criarPlanilhaCliente() {
  if (!await garantirToken()) return null;
  try {
    const nome = `FinançasPro — ${state.user.name || state.user.email}`;
    // Cria o arquivo
    const res = await fetch(SHEETS_API, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: { title: nome },
        sheets: [
          { properties: { title: '💰 Lançamentos' } },
          { properties: { title: '💳 Cartões' } },
        ]
      }),
    });
    const data = await res.json();
    if (!data.spreadsheetId) throw new Error('Falha ao criar planilha');
    const sid = data.spreadsheetId;

    // Escreve cabeçalhos
    await fetch(
      `${SHEETS_API}/${sid}/values:batchUpdate`,
      {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: [
            { range: "'💰 Lançamentos'!A1", values: [CAB_LANC] },
            { range: "'💳 Cartões'!A1",     values: [CAB_CART] },
          ]
        }),
      }
    );

    console.log('[Sheets] Planilha criada:', sid);
    return sid;
  } catch(e) { console.warn('criarPlanilhaCliente:', e); return null; }
}

async function setupSheetsCliente() {
  if (!state.user) return;

  // 1. Fonte de verdade primária: sheetsId que veio do servidor via checkAccess
  // 2. Fallback: localStorage do dispositivo atual (pode estar vazio em novo dispositivo)
  const localId = localStorage.getItem('fp_sheets_id_' + state.user.email);
  if (!state.sheetsId && localId) state.sheetsId = localId;

  // 3. Se ainda não encontrou ID, busca SILENCIOSAMENTE no Drive
  //    — isso resolve o cenário de novo dispositivo (celular, outro PC)
  //      onde o localStorage está vazio mas a planilha já existe no Drive
  if (!state.sheetsId) {
    addSyncLog('Verificando planilha existente no Drive...', 'info');
    const idExistente = await _buscarPlanilhaSilenciosa();
    if (idExistente) {
      state.sheetsId = idExistente;
      localStorage.setItem('fp_sheets_id_' + state.user.email, idExistente);
      // Atualiza o servidor com o ID encontrado (sincroniza para todos os dispositivos)
      await sheetsPOST({ action: 'saveSheetsId', email: state.user.email, sheetsId: idExistente });
      addSyncLog('✅ Planilha existente localizada e vinculada automaticamente.', 'ok');
    }
  }

  // 4. Só cria planilha nova se realmente não existe nenhuma
  if (!state.sheetsId) {
    addSyncLog('Criando sua planilha pessoal...', 'info');
    const novoId = await criarPlanilhaCliente();
    if (novoId) {
      state.sheetsId = novoId;
      localStorage.setItem('fp_sheets_id_' + state.user.email, novoId);
      await sheetsPOST({ action: 'saveSheetsId', email: state.user.email, sheetsId: novoId });
    }
  } else {
    // Garante que está salvo localmente no dispositivo atual
    localStorage.setItem('fp_sheets_id_' + state.user.email, state.sheetsId);
  }

  // Migração única (apenas na primeira vez após atualização)
  const jaMigrou = localStorage.getItem('fp_migrado_' + state.user.email);
  if (!jaMigrou) {
    await migrarDadosAntigos();
  }
  // loadFromSheets() NÃO é chamado aqui — evita sobrescrever dados locais não sincronizados.
  // Use o botão "Sincronizar ↓" para baixar dados do Sheets explicitamente.
}

// ──────────────────────────────────────────────────
// Busca silenciosa de planilha FinançasPro no Drive
// Não exibe popup, não gera log de erro visível.
// Retorna o ID da planilha mais recente ou null.
// ──────────────────────────────────────────────────
async function _buscarPlanilhaSilenciosa() {
  // Precisa de token mas sem forçar popup (false = silencioso)
  if (!await garantirToken(false)) return null;
  try {
    const q = encodeURIComponent(
      "name contains 'FinançasPro' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
    );
    const res = await fetch(
      `${DRIVE_API}?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc`,
      { headers: { 'Authorization': `Bearer ${state.accessToken}` } }
    );
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      console.log('[Drive] Planilha existente encontrada:', data.files[0].name, data.files[0].id);
      return data.files[0].id; // a mais recente
    }
    return null;
  } catch(e) {
    console.warn('[Drive] _buscarPlanilhaSilenciosa:', e);
    return null;
  }
}

// ══════════════════════════════════════════════════
// MIGRAÇÃO — importa dados antigos (v2 → v3) — roda UMA VEZ
// ══════════════════════════════════════════════════
async function migrarDadosAntigos() {
  addSyncLog('Verificando dados anteriores...', 'info');
  try {
    const params = 'action=getDadosMigracao&email=' + encodeURIComponent(state.user.email);
    const dados  = await sheetsGET(params);

    if (dados && dados.migrado && (dados.lancamentos.length > 0 || dados.cartoes.length > 0)) {
      addSyncLog(`Migrando ${dados.lancamentos.length} lançamentos e ${dados.cartoes.length} cartões...`, 'info');

      // Usa dados antigos como base (mescla com locais)
      const idsLocais = new Set(state.lancamentos.map(l => l.id));
      dados.lancamentos.forEach(l => { if (!idsLocais.has(l.id)) state.lancamentos.push(l); });

      const idsCartLocais = new Set(state.cartoes.map(c => c.id));
      dados.cartoes.forEach(c => { if (!idsCartLocais.has(c.id)) state.cartoes.push(c); });

      saveLocal();
      renderAll();

      // Grava na planilha da cliente
      await _syncParaSheetsCliente();
      addSyncLog('✅ Migração concluída com sucesso!', 'ok');
    } else {
      addSyncLog('Nenhum dado anterior encontrado.', 'info');
      // Se já tem dados locais, sincroniza para a planilha
      if (state.lancamentos.length > 0 || state.cartoes.length > 0) {
        await _syncParaSheetsCliente();
      }
    }
  } catch(e) {
    console.warn('migrarDadosAntigos:', e);
    addSyncLog('Migração offline — usando dados locais.', 'warn');
  }

  // Marca como migrado para não rodar novamente
  localStorage.setItem('fp_migrado_' + state.user.email, '1');
}

// ══════════════════════════════════════════════════
// SINCRONIZAÇÃO — lê e grava na planilha da cliente
// ══════════════════════════════════════════════════

async function _syncParaSheetsCliente() {
  if (!state.sheetsId) { addSyncLog('Planilha não configurada. Use "Buscar no Drive" primeiro.', 'warn'); return false; }
  if (!state.accessToken || Date.now() >= state.tokenExpiry) {
    addSyncLog('Sem token OAuth. Use o botão "Enviar ↑" em Configurações para reautorizar.', 'warn');
    return false;
  }

  // Garante que as abas existem antes de tentar escrever
  await _garantirAbas(['💰 Lançamentos', '💳 Cartões']);

  const rowsLanc = [CAB_LANC, ...state.lancamentos.map(l => [
    l.id||'', l.tipo||'', l.descricao||'', l.valor||0, l.categoria||'',
    l.data||'', l.obs||'', l.pagamento||'',
    l.recorrente ? 'TRUE' : 'FALSE', l.cartaoId||'',
  ])];
  const rowsCart = [CAB_CART, ...state.cartoes.map(c => [
    c.id||'', c.nome||'', c.limite||0, c.fechamento||15, c.vencimento||22,
    c.cor||'#2D6A4F', c.corCustom ? 'TRUE' : 'FALSE',
  ])];

  const okL = await fpSheetsEscrever('💰 Lançamentos', rowsLanc);
  const okC = await fpSheetsEscrever('💳 Cartões', rowsCart);
  return okL && okC;
}

async function loadFromSheets() {
  if (!state.user || !state.sheetsId) return;
  if (!await garantirToken()) return;
  try {
    // Lê lançamentos
    const rowsL = await fpSheetsLer('💰 Lançamentos');
    if (rowsL.length > 1) {
      state.lancamentos = rowsL.slice(1).filter(r => r[0]).map(r => ({
        id:         String(r[0]||''),
        tipo:       String(r[1]||''),
        descricao:  String(r[2]||''),
        valor:      parseFloat(r[3])||0,
        categoria:  String(r[4]||''),
        data:       String(r[5]||''),
        obs:        String(r[6]||''),
        pagamento:  String(r[7]||''),
        recorrente: String(r[8]||'').toUpperCase() === 'TRUE',
        cartaoId:   String(r[9]||''),
      }));
    } else if (rowsL.length === 1) {
      // Só o cabeçalho — planilha ainda vazia: mantém dados locais para não perder lançamentos não sincronizados
      addSyncLog('Planilha de lançamentos vazia — dados locais preservados. Use "Enviar ↑" para subir.', 'warn');
    }
    // Se rowsL.length === 0: possível erro de API/token — mantém dados locais
    // Lê cartões
    const rowsC = await fpSheetsLer('💳 Cartões');
    if (rowsC.length > 1) {
      state.cartoes = rowsC.slice(1).filter(r => r[0]).map(r => ({
        id:         String(r[0]||''),
        nome:       String(r[1]||''),
        limite:     parseFloat(r[2])||0,
        fechamento: parseInt(r[3])||15,
        vencimento: parseInt(r[4])||22,
        cor:        String(r[5]||'#2D6A4F'),
        corCustom:  String(r[6]||'').toUpperCase() === 'TRUE',
      }));
    } else if (rowsC.length === 1) {
      // Só o cabeçalho — planilha ainda vazia: mantém dados locais
    }
    // Se rowsC.length === 0: possível erro de API/token — mantém dados locais
    saveLocal();
    renderAll();
    localStorage.setItem('fp_ultimo_sync', new Date().toISOString());
  } catch(e) { console.warn('loadFromSheets:', e); }
}

async function saveCartaoSheets(cartao) {
  // Grava a planilha inteira de cartões (mais seguro que editar linha por linha)
  await _syncParaSheetsCliente();
}

async function deleteCartaoSheets(id) {
  await _syncParaSheetsCliente();
}

async function saveToSheets(lancamento) {
  // Grava a planilha inteira de lançamentos
  if (!state.sheetsId || !state.user) return;
  await _syncParaSheetsCliente();
}

// placeholder compatibilidade
async function saveToSheetsLegacy(lancamento) { await saveToSheets(lancamento); }


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
  const diretos = state.lancamentos.filter(l=>{
    const d=new Date(l.data+'T12:00:00');
    return d.getMonth()===m && d.getFullYear()===y;
  });

  // Gera parcelas futuras de lançamentos parcelados de outros meses
  const parcelas = [];
  state.lancamentos.forEach(l => {
    if (!l.parcelado || !l.nParcelas || !l.parcelaAtual) return;
    const dataBase = new Date(l.data+'T12:00:00');
    const mesBase  = dataBase.getMonth();
    const anoBase  = dataBase.getFullYear();
    // Para cada parcela restante após a atual
    for (let p = l.parcelaAtual + 1; p <= l.nParcelas; p++) {
      const diffMeses = (p - l.parcelaAtual);
      let mP = mesBase + diffMeses;
      let yP = anoBase;
      while (mP > 11) { mP -= 12; yP++; }
      if (mP === m && yP === y) {
        // Verifica se já existe lançamento desta parcela (evita duplicata)
        const jaExiste = diretos.some(d =>
          d.parcelado && d.parcelamentoOrigemId === l.id && d.parcelaAtual === p
        );
        if (!jaExiste) {
          parcelas.push({
            ...l,
            id: l.id + '_p' + p,
            parcelaAtual: p,
            data: `${yP}-${String(mP+1).padStart(2,'0')}-${String(dataBase.getDate()).padStart(2,'0')}`,
            parcelamentoOrigemId: l.id,
            cartaoId: l.cartaoId, // preservar explicitamente
            _gerado: true,
          });
        }
      }
    }
  });

  return [...diretos, ...parcelas];
}
function getLancamentosAno(y=state.currentYear) {
  return state.lancamentos.filter(l=>{
    const d=new Date(l.data+'T12:00:00');
    return d.getFullYear()===y;
  });
}

// ══════════════════════════════════════════════════
// SALDO ACUMULADO — TICKET ALIMENTAÇÃO
// O saldo acumula desde o primeiro lançamento:
//   +valor de cada receita "Vale Alimentação"
//   -valor de cada despesa  "Alimentação"
// até o mês/ano informados (inclusive).
// Saldo positivo = sobra carregada para o próximo mês.
// ══════════════════════════════════════════════════
function getSaldoValeAlim(mesAtual, anoAtual) {
  let saldo = 0;
  state.lancamentos.forEach(l => {
    const d = new Date(l.data + 'T12:00:00');
    const m = d.getMonth(), y = d.getFullYear();
    // Ignora lançamentos posteriores ao mês atual
    if (y > anoAtual || (y === anoAtual && m > mesAtual)) return;
    if (l.tipo === 'receita' && l.categoria === 'Vale Alimentação') {
      saldo += parseFloat(l.valor || 0);
    }
    if (l.tipo === 'despesa' && l.categoria === 'Alimentação') {
      saldo -= parseFloat(l.valor || 0);
    }
  });
  return saldo;
}

// ══════════════════════════════════════════════════
// SALDO ACUMULADO — TICKET TRANSPORTE
// O saldo acumula desde o primeiro lançamento:
//   +valor de cada receita "Vale Transporte"
//   -valor de cada despesa  "Transporte"
// até o mês/ano informados (inclusive).
// Saldo positivo = sobra carregada para o próximo mês.
// ══════════════════════════════════════════════════
function getSaldoValeTransp(mesAtual, anoAtual) {
  let saldo = 0;
  state.lancamentos.forEach(l => {
    const d = new Date(l.data + 'T12:00:00');
    const m = d.getMonth(), y = d.getFullYear();
    if (y > anoAtual || (y === anoAtual && m > mesAtual)) return;
    if (l.tipo === 'receita' && l.categoria === 'Vale Transporte') {
      saldo += parseFloat(l.valor || 0);
    }
    if (l.tipo === 'despesa' && l.categoria === 'Transporte') {
      saldo -= parseFloat(l.valor || 0);
    }
  });
  return saldo;
}

// ══════════════════════════════════════════════════
// RENDER ALL
// ══════════════════════════════════════════════════
function renderAll() {
  try { renderDashboard(); }    catch(e) { console.warn('renderDashboard:', e); }
  try { renderLancamentos(); }  catch(e) { console.warn('renderLancamentos:', e); }
  try { renderCartoes(); }      catch(e) { console.warn('renderCartoes:', e); }
  const active = document.querySelector('.tab-content[style*="block"]');
  if (active) {
    const id = active.id;
    try {
      if (id==='tab-relatorios')     renderRelatorio();
      if (id==='tab-comparativo')    renderComparativo();
      if (id==='tab-caixinhas')      renderCaixinhas();
      if (id==='tab-dre')            renderDRE();
      if (id==='tab-analise-cartao') renderAnaliseCartao();
      if (id==='tab-fluxo')          renderFluxo();
    } catch(e) { console.warn('renderTab:', e); }
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

  // KPI — Saldo acumulado do Ticket Alimentação
  const saldoVA = getSaldoValeAlim(state.currentMonth, state.currentYear);
  const elKpiVA = $('kpiSaldoTicket');
  if (elKpiVA) {
    elKpiVA.textContent = fmt(saldoVA);
    const card = elKpiVA.closest('.kpi-card');
    if (card) card.className = 'kpi-card ' + (saldoVA >= 0 ? 'kpi-saldo' : 'kpi-despesa');
    const sub = $('kpiSaldoTicketSub');
    if (sub) sub.textContent = saldoVA >= 0 ? '✅ Disponível p/ Alimentação' : '⚠️ Déficit Alimentação';
  }

  // KPI — Saldo acumulado do Ticket Transporte
  const saldoVT = getSaldoValeTransp(state.currentMonth, state.currentYear);
  const elKpiVT = $('kpiSaldoTransporte');
  if (elKpiVT) {
    elKpiVT.textContent = fmt(saldoVT);
    const cardT = elKpiVT.closest('.kpi-card');
    if (cardT) cardT.className = 'kpi-card ' + (saldoVT >= 0 ? 'kpi-saldo' : 'kpi-despesa');
    const subT = $('kpiSaldoTransporteSub');
    if (subT) subT.textContent = saldoVT >= 0 ? '✅ Disponível p/ Transporte' : '⚠️ Déficit Transporte';
  }

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
  renderRelatorioAnual();
}

// ══════════════════════════════════════════════════
// RELATÓRIO ANUAL — aparece abaixo do Dashboard
// ══════════════════════════════════════════════════
function renderRelatorioAnual() {
  const el = $('relatorioAnualContent');
  if (!el) return;
  const ano = state.currentYear;
  let totalRec = 0, totalDesp = 0;
  const catDesp = {}, catRec = {};

  // Acumula dados de Jan a Dez
  const rows = [];
  for (let m = 0; m < 12; m++) {
    const it  = getLancamentosMes(m, ano);
    const rec = sumBy(it, 'receita');
    const desp = sumBy(it, 'despesa');
    totalRec  += rec;
    totalDesp += desp;
    it.filter(l => l.tipo === 'despesa').forEach(l => {
      catDesp[l.categoria] = (catDesp[l.categoria] || 0) + parseFloat(l.valor || 0);
    });
    it.filter(l => l.tipo === 'receita').forEach(l => {
      catRec[l.categoria] = (catRec[l.categoria] || 0) + parseFloat(l.valor || 0);
    });
    rows.push({ mes: MONTHS[m], rec, desp, saldo: rec - desp });
  }

  const saldoAnual = totalRec - totalDesp;
  const taxaAnual  = totalRec > 0 ? Math.round((saldoAnual / totalRec) * 100) : 0;

  // Top 5 despesas por categoria
  const top5Desp = Object.entries(catDesp).sort((a, b) => b[1] - a[1]).slice(0, 5);
  // Top 5 receitas por categoria
  const top5Rec  = Object.entries(catRec).sort((a, b) => b[1] - a[1]).slice(0, 5);

  el.innerHTML = `
    <div style="margin-top:28px;border-top:2px solid var(--bege-escuro);padding-top:24px;">
      <h3 class="chart-title" style="font-size:1rem;margin-bottom:16px;">📅 Relatório Anual — ${ano}</h3>

      <!-- KPIs anuais -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid var(--verde-positivo);padding:14px;text-align:center;">
          <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;color:var(--texto-medio);margin-bottom:6px;">💰 Receita Anual</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--verde-positivo);">${fmt(totalRec)}</div>
        </div>
        <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid var(--vermelho);padding:14px;text-align:center;">
          <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;color:var(--texto-medio);margin-bottom:6px;">💸 Despesa Anual</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--vermelho);">${fmt(totalDesp)}</div>
        </div>
        <div style="background:#fff;border:1px solid var(--bege-escuro);border-radius:var(--radius);border-top:4px solid ${saldoAnual>=0?'var(--verde-medio)':'var(--vermelho)'};padding:14px;text-align:center;">
          <div style="font-size:0.65rem;font-weight:800;text-transform:uppercase;color:var(--texto-medio);margin-bottom:6px;">🏦 Saldo Anual</div>
          <div style="font-size:1.1rem;font-weight:800;color:${saldoAnual>=0?'var(--verde-medio)':'var(--vermelho)'};">${fmt(saldoAnual)}</div>
        </div>
      </div>

      <!-- Tabela Jan-Dez -->
      <div class="table-box" style="margin-bottom:20px;">
        <table class="data-table">
          <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Saldo</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr${r.mes === MONTHS[state.currentMonth] ? ' style="background:rgba(27,106,79,0.07);font-weight:700;"' : ''}>
                <td>${r.mes}${r.mes === MONTHS[state.currentMonth] ? ' ◀' : ''}</td>
                <td style="color:var(--verde-positivo);font-weight:600;">${r.rec > 0 ? fmt(r.rec) : '—'}</td>
                <td style="color:var(--vermelho);font-weight:600;">${r.desp > 0 ? fmt(r.desp) : '—'}</td>
                <td style="font-weight:700;color:${r.saldo >= 0 ? 'var(--verde-medio)' : 'var(--vermelho)'};">${fmt(r.saldo)}</td>
              </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr style="background:var(--bege);font-weight:800;">
              <td>TOTAL ${ano}</td>
              <td style="color:var(--verde-positivo);">${fmt(totalRec)}</td>
              <td style="color:var(--vermelho);">${fmt(totalDesp)}</td>
              <td style="color:${saldoAnual>=0?'var(--verde-medio)':'var(--vermelho)'};">${fmt(saldoAnual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Top 5 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="table-box">
          <h3 class="chart-title" style="font-size:0.85rem;">🔴 Top 5 Despesas por Categoria (${ano})</h3>
          <ul class="rel-list">${top5Desp.length
            ? top5Desp.map(([c,v]) => `<li><span>${CAT_ICONS[c]||'📦'} ${c}</span><span class="rel-amount despesa">${fmt(v)}</span></li>`).join('')
            : '<li><span style="color:var(--texto-medio);">—</span></li>'}</ul>
        </div>
        <div class="table-box">
          <h3 class="chart-title" style="font-size:0.85rem;">🟢 Top 5 Receitas por Categoria (${ano})</h3>
          <ul class="rel-list">${top5Rec.length
            ? top5Rec.map(([c,v]) => `<li><span>${CAT_ICONS[c]||'💚'} ${c}</span><span class="rel-amount receita">${fmt(v)}</span></li>`).join('')
            : '<li><span style="color:var(--texto-medio);">—</span></li>'}</ul>
        </div>
      </div>
    </div>`;
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
    options:{ responsive:true, maintainAspectRatio:false,
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
// GERENCIAMENTO DE CATEGORIAS
// ══════════════════════════════════════════════════
function openCatModal() {
  const d = getCatDespesa();
  const r = getCatReceita();
  const renderList = (cats, tipo) => cats.map((c,i) => `
    <div class="cat-item" id="cat-${tipo}-${i}">
      <span class="cat-item-nome">${escHtml(c)}</span>
      <div class="cat-item-actions">
        <button onclick="editCatItem('${tipo}',${i})" class="btn-cat-edit">✏️</button>
        <button onclick="removeCatItem('${tipo}',${i})" class="btn-cat-del">🗑️</button>
      </div>
    </div>`).join('');
  const el = $('catModalContent');
  if (el) el.innerHTML = `
    <div class="cat-section">
      <div class="cat-section-title">🔴 Categorias de Despesa</div>
      <div id="catListDesp">${renderList(d,'desp')}</div>
      <div class="cat-add-row">
        <input type="text" id="catNewDesp" placeholder="Nova categoria de despesa..." class="cat-input" />
        <button onclick="addCatItem('desp')" class="btn-cat-add">+ Adicionar</button>
      </div>
    </div>
    <div class="cat-section">
      <div class="cat-section-title">🟢 Categorias de Receita</div>
      <div id="catListRec">${renderList(r,'rec')}</div>
      <div class="cat-add-row">
        <input type="text" id="catNewRec" placeholder="Nova categoria de receita..." class="cat-input" />
        <button onclick="addCatItem('rec')" class="btn-cat-add">+ Adicionar</button>
      </div>
    </div>`;
  $('catModal').style.display = 'flex';
}
function closeCatModal() { $('catModal').style.display = 'none'; }

function addCatItem(tipo) {
  const inp = tipo==='desp' ? $('catNewDesp') : $('catNewRec');
  const nome = inp.value.trim();
  if (!nome) return;
  const d = getCatDespesa(), r = getCatReceita();
  if (tipo==='desp') { if (!d.includes(nome)) d.push(nome); saveCats(d,r); }
  else               { if (!r.includes(nome)) r.push(nome); saveCats(d,r); }
  reloadCats(); inp.value=''; openCatModal();
}
function removeCatItem(tipo, idx) {
  if (!confirm('Remover esta categoria?')) return;
  const d = getCatDespesa(), r = getCatReceita();
  if (tipo==='desp') { d.splice(idx,1); saveCats(d,r); }
  else               { r.splice(idx,1); saveCats(d,r); }
  reloadCats(); openCatModal();
}
function editCatItem(tipo, idx) {
  const d = getCatDespesa(), r = getCatReceita();
  const atual = tipo==='desp' ? d[idx] : r[idx];
  const novo = prompt('Novo nome para a categoria:', atual);
  if (!novo || novo.trim()===atual) return;
  if (tipo==='desp') { d[idx]=novo.trim(); saveCats(d,r); }
  else               { r[idx]=novo.trim(); saveCats(d,r); }
  reloadCats(); openCatModal();
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

  // View de tabela
  if (_lancViewTabela) { renderLancamentosTabela(items); return; }
  if ($('lancamentosTabela')) $('lancamentosTabela').style.display='none';
  if ($('lancamentosLista')) $('lancamentosLista').style.display='block';

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

// ══════════════════════════════════════════════════
// FEATURE 3 — TABELA DE LANÇAMENTOS
// ══════════════════════════════════════════════════
let _lancViewTabela = false;
function toggleLancView() {
  _lancViewTabela = !_lancViewTabela;
  const btn = $('btnViewToggle');
  if (btn) btn.textContent = _lancViewTabela ? '📋 Ver Cards' : '📊 Ver Tabela';
  renderLancamentos();
}

function renderLancamentosTabela(items) {
  const el = $('lancamentosTabela');
  if (!el) return;
  el.style.display = 'block';
  $('lancamentosLista').style.display = 'none';
  if (!items.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--texto-medio);">Nenhum lançamento neste mês</div>`;
    return;
  }
  el.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table lanc-tabela">
        <thead>
          <tr>
            <th>Tipo</th><th>Descrição</th><th>Categoria</th>
            <th>Valor</th><th>Data</th><th>Pagamento</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(l => `
            <tr class="lanc-tabela-row">
              <td><span class="tipo-badge ${l.tipo}">${l.tipo==='receita'?'💚 Receita':'🔴 Despesa'}</span></td>
              <td style="font-weight:600;">${escHtml(l.descricao)}</td>
              <td>${CAT_ICONS[l.categoria]||'📦'} ${escHtml(l.categoria)}</td>
              <td class="${l.tipo}" style="font-weight:700;">${l.tipo==='receita'?'+':'-'}${fmt(l.valor)}</td>
              <td style="white-space:nowrap;">${formatDate(l.data)}</td>
              <td style="font-size:0.8rem;color:var(--texto-medio);">${escHtml(l.pagamento||'—')}</td>
              <td style="white-space:nowrap;">
                <button class="btn-icon" onclick="editLancamento('${l.id}')" title="Editar">✏️</button>
                <button class="btn-icon" onclick="deleteLancamento('${l.id}')" title="Excluir">🗑️</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
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
  updateTipoColor();
  if (isParcelado) calcularParcelamento();
  // Aplica trava do Vale Alimentação ao abrir modal com item existente
  _aplicarTravaValeAlim();
  $('modal').style.display = 'flex';
}
function closeModal(){$('modal').style.display='none';}

function toggleCartaoRow() {
  const isCredito = $('fPagamento').value.includes('Crédito');
  const isReceita = $('fTipo').value === 'receita';
  const show = isCredito;
  $('cartaoRow').style.display = show ? 'flex' : 'none';
  // Parcelamento: só para despesas no cartão de crédito
  $('parcelamentoRow').style.display = (show && !isReceita) ? 'block' : 'none';
  if (!show || isReceita) {
    if ($('fParcelado')) $('fParcelado').checked = false;
    if ($('parcelamentoCampos')) $('parcelamentoCampos').style.display = 'none';
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
// FEATURE 1 — Cor dinâmica do seletor de tipo
function updateTipoColor() {
  const sel = $('fTipo');
  if (!sel) return;
  if (sel.value === 'receita') {
    sel.style.cssText = 'background:rgba(27,122,62,0.13);border-color:#52B788;color:#1B4332;font-weight:800;border-radius:9px;padding:10px 14px;';
  } else {
    sel.style.cssText = 'background:rgba(192,57,43,0.10);border-color:#C0392B;color:#C0392B;font-weight:800;border-radius:9px;padding:10px 14px;';
  }
}

function updateCategorias() {
  const cats=$('fTipo').value==='receita'?getCatReceita():getCatDespesa();
  $('fCategoria').innerHTML=cats.map(c=>`<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
  updateTipoColor();
  // toggleCartaoRow só quando o modal está aberto
  if ($('modal') && $('modal').style.display !== 'none') {
    toggleCartaoRow();
  }
  // Aplica trava do Ticket Alimentação após popular o select
  _aplicarTravaValeAlim();
}

// Trava automática: quando tipo=receita + categoria=Vale Alimentação OU Vale Transporte,
// o select de categoria fica desabilitado para evitar realocação indevida.
function _aplicarTravaValeAlim() {
  const fTipo = $('fTipo');
  const fCat  = $('fCategoria');
  if (!fTipo || !fCat) return;
  const isVA = fTipo.value === 'receita' && fCat.value === 'Vale Alimentação';
  const isVT = fTipo.value === 'receita' && fCat.value === 'Vale Transporte';
  fCat.disabled = isVA || isVT;
  const avisoAlim = $('avisoValeAlim');
  if (avisoAlim) avisoAlim.style.display = isVA ? 'flex' : 'none';
  const avisoTransp = $('avisoValeTransp');
  if (avisoTransp) avisoTransp.style.display = isVT ? 'flex' : 'none';
}
function saveLancamento() {
  const tipo=$('fTipo').value, desc=$('fDesc').value.trim();
  const valor=parseFloat($('fValor').value), cat=$('fCategoria').value;
  const data=$('fData').value, pag=$('fPagamento').value;
  const obs=$('fObs').value.trim(), rec=$('fRecorrente').checked;
  if(isNaN(valor)||valor<=0||!data||!cat){
    alert('Preencha os campos obrigatórios: Valor, Categoria e Data.');return;
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
  // Parcelas geradas automaticamente (_gerado) — excluir o lançamento origem
  const idReal = id.includes('_p') ? id.split('_p')[0] + (id.includes('_p') ? '' : '') : id;
  const lancamento = state.lancamentos.find(l => l.id === id || l.id === idReal);
  if (!lancamento) return;
  const isGerado = id.includes('_gerado') || lancamento._gerado;
  if (isGerado) {
    alert('Para excluir todas as parcelas, edite o lançamento original na aba Lançamentos.');
    return;
  }
  if(!confirm('Excluir este lançamento?' + (lancamento.parcelado ? '\n\nAtenção: isso remove TODAS as parcelas.' : ''))) return;
  state.lancamentos=state.lancamentos.filter(l=>l.id!==id);
  saveLocal();
  sheetsPOST({ action:'deleteData', email:state.user.email, lancamentoId:id });
  renderAll();
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
      options:{responsive:true,maintainAspectRatio:false,
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
  CAIXINHAS = getCaixinhas(); // sempre recarrega do localStorage
  const receita=sumBy(getLancamentosMes(),'receita');
  const despesas=getLancamentosMes().filter(l=>l.tipo==='despesa');
  const byCat=getCatTotals(despesas);

  const el=$('caixinhasContent');
  const totalDespesa=Object.values(byCat).reduce((s,v)=>s+v,0);
  const base = receita; // usa a receita real do mês automaticamente

  // FEATURE 6 — Resumo acima dos valores
  const resumoAcima = `
    <div style="background:var(--bege-claro);border:1px solid var(--bege-escuro);border-radius:var(--radius);padding:16px 20px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <p style="font-size:0.82rem;font-weight:800;color:var(--verde-escuro);margin:0;">📖 O Método das 6 Caixinhas</p>
        <button onclick="openCaixinhasEdit()" style="background:var(--verde-escuro);color:#fff;border:none;border-radius:8px;padding:5px 12px;font-size:0.75rem;cursor:pointer;font-family:Sora,sans-serif;">✏️ Editar Caixinhas</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${CAIXINHAS.map(cx=>`
          <div style="display:flex;align-items:center;gap:6px;background:#fff;border-left:4px solid ${cx.cor};border-radius:0 8px 8px 0;padding:6px 12px;font-size:0.78rem;">
            <span>${cx.icon}</span>
            <span style="font-weight:700;color:var(--verde-escuro);">${cx.pct}%</span>
            <span style="color:var(--texto-medio);">${escHtml(cx.label)}</span>
          </div>`).join('')}
      </div>
      ${receita>0?`<p style="font-size:0.78rem;color:var(--verde-medio);margin:10px 0 0;font-weight:600;">💰 Base automática: receita do mês = ${fmt(receita)}</p>`:'<p style="font-size:0.78rem;color:var(--texto-medio);margin:10px 0 0;">Lance suas receitas para ver os valores calculados automaticamente.</p>'}
    </div>`;

  el.innerHTML = resumoAcima + `
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

    // Dados mensais do ano — inclui parcelas geradas automaticamente
    const meses=[];
    let totalAno=0;
    for(let m=0;m<12;m++){
      const it=getLancamentosMes(m,ano).filter(l=>l.cartaoId===c.id || l.cartaoId===c.id);
      const total=it.reduce((s,l)=>s+parseFloat(l.valor||0),0);
      const byCat=getCatTotals(it);
      meses.push({m,total,byCat,items:it});
      totalAno+=total;
    }
    // Total real: soma todas as parcelas do cartão em todos os meses
    const totalParcelasCartao = state.lancamentos
      .filter(l=>l.cartaoId===c.id && l.parcelado)
      .reduce((s,l)=>s+parseFloat(l.valor||0)*(l.nParcelas||1),0);
    const totalNaoParcelado = state.lancamentos
      .filter(l=>l.cartaoId===c.id && !l.parcelado)
      .reduce((s,l)=>s+parseFloat(l.valor||0),0);

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
            <div style="font-size:0.68rem;color:rgba(255,255,255,0.6);">parcelas futuras incluídas</div>
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
// SI
// ══════════════════════════════════════════════════
// FUNÇÕES FALTANTES (completam o arquivo original)
// ══════════════════════════════════════════════════

// NAVEGAÇÃO
function switchTab(tab) {
  if ($('finnTransition')) showFinnTransition();
  document.querySelectorAll('.tab-content').forEach(function(el){ el.style.display='none'; });
  document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.remove('active'); });
  var tabEl = $('tab-'+tab);
  if (tabEl) tabEl.style.display = 'block';
  var navBtn = document.querySelector('.nav-item[data-tab="'+tab+'"]');
  if (navBtn) navBtn.classList.add('active');
  if ($('topbarTitle')) $('topbarTitle').textContent = TAB_TITLES[tab]||tab;
  closeSidebar();
  setTimeout(function(){
    if (tab==='relatorios')     renderRelatorio();
    if (tab==='comparativo')    renderComparativo();
    if (tab==='dre')            renderDRE();
    if (tab==='caixinhas')      renderCaixinhas();
    if (tab==='analise-cartao') renderAnaliseCartao();
    if (tab==='fluxo')          renderFluxo();
    if (tab==='configuracoes')  updateConfigPanel();
  }, 300);
}
function toggleSidebar(){ $('sidebar').classList.toggle('open'); $('sidebarOverlay').classList.toggle('open'); }
function closeSidebar(){   $('sidebar').classList.remove('open');  $('sidebarOverlay').classList.remove('open'); }

// FINN
function showFinn(){
  const cfg=getConfig(); if(cfg.finnAtivo===false) return;
  const msg=FINN_MSGS[Math.floor(Math.random()*FINN_MSGS.length)];
  if($('finnMsg')) $('finnMsg').textContent=msg;
  if($('finn'))    $('finn').style.display='flex';
  setTimeout(closeFinn,8000);
}
function closeFinn(){ if($('finn')) $('finn').style.display='none'; }
function showFinnTransition(){
  const ft=$('finnTransition'), ftm=$('finnTransitionMsg');
  if(!ft) return;
  if(ftm) ftm.textContent=FINN_MSGS[Math.floor(Math.random()*FINN_MSGS.length)];
  ft.style.display='flex';
  // Força repaint antes de adicionar a classe de transição
  ft.offsetHeight;
  ft.classList.add('finn-transition-in');
  setTimeout(function(){
    ft.classList.remove('finn-transition-in');
    setTimeout(function(){ ft.style.display='none'; }, 400);
  }, 1800);
}

// LOG SYNC
function addSyncLog(msg, tipo){
  tipo=tipo||'info';
  var log=$('syncLog'); if(!log) return;
  log.style.display='block';
  var cores={ok:'#1B7A3E',warn:'#A07820',error:'#C0392B',info:'#555'};
  var icones={ok:'✅',warn:'⚠️',error:'❌',info:'ℹ️'};
  var d=document.createElement('div');
  d.style.cssText='color:'+(cores[tipo]||'#555')+';font-size:0.79rem;margin-bottom:3px;';
  d.textContent=(icones[tipo]||'ℹ️')+' '+msg;
  log.appendChild(d); log.scrollTop=log.scrollHeight;
}

// CONFIGURAÇÕES
function updateConfigPanel(){
  if($('configEmail')) $('configEmail').textContent=state.user?state.user.email:'—';
  if($('configNome'))  $('configNome').textContent =state.user?state.user.name:'—';
  if($('configTotalLanc'))    $('configTotalLanc').textContent   =state.lancamentos.length;
  if($('configTotalCartoes')) $('configTotalCartoes').textContent=state.cartoes.length;
  var ul=localStorage.getItem('fp_ultimo_sync');
  if($('configUltimoSync')) $('configUltimoSync').textContent=ul?new Date(ul).toLocaleString('pt-BR'):'—';
  var st=$('configSyncStatus');
  if(st){ st.textContent=state.sheetsId?'✅ Planilha conectada':'⚠️ Aguardando autorização OAuth'; st.style.color=state.sheetsId?'#1B7A3E':'#A07820'; }
  if($('toggleFinn')){ var cfg=getConfig(); $('toggleFinn').checked=cfg.finnAtivo!==false; }
  if($('inputSheetsId')&&state.sheetsId) $('inputSheetsId').value=state.sheetsId;
  if($('syncLog')){ $('syncLog').innerHTML=''; $('syncLog').style.display='none'; }
}

// TESTAR CONEXÃO
async function testarConexao(){
  if($('syncLog')){ $('syncLog').innerHTML=''; $('syncLog').style.display='none'; }
  var st=$('configSyncStatus');
  if(st){ st.textContent='⏳ Testando...'; st.style.color='#555'; }
  addSyncLog('Iniciando teste de conexão...','info');
  try{ await fetch(CONFIG.SHEETS_URL+'?action=ping'); addSyncLog('Apps Script: OK ✅','ok'); }
  catch(e){ addSyncLog('Apps Script inacessível.','warn'); }
  var temToken=await garantirToken(false);
  if(!temToken){ addSyncLog('Token OAuth não encontrado. Use "Enviar ↑" primeiro para autorizar.','warn'); if(st){st.textContent='⚠️ Use Enviar ↑ primeiro';st.style.color='#A07820';} return; }
  addSyncLog('Token OAuth: válido ✅','ok');
  if(state.sheetsId){ addSyncLog('Planilha: '+state.sheetsId.substring(0,22)+'...','ok'); if(st){st.textContent='✅ Tudo conectado';st.style.color='#1B7A3E';} }
  else{ addSyncLog('Planilha não configurada. Use "Buscar no Drive" ou cole o ID abaixo.','warn'); if(st){st.textContent='⚠️ Sem planilha';st.style.color='#A07820';} }
}

// SINCRONIZAR — baixa do Sheets
async function sincronizarAgora(){
  if($('syncLog')){ $('syncLog').innerHTML=''; $('syncLog').style.display='none'; }
  addSyncLog('Baixando dados do Sheets...','info');
  if(!state.sheetsId){ addSyncLog('Planilha não configurada. Use "Buscar no Drive" primeiro.','warn'); return; }
  if(!await garantirToken(true)){ addSyncLog('Sem token OAuth. Clique novamente para tentar.','error'); return; }
  await loadFromSheets();
  var agora=new Date().toISOString();
  localStorage.setItem('fp_ultimo_sync',agora);
  if($('configUltimoSync')) $('configUltimoSync').textContent=new Date(agora).toLocaleString('pt-BR');
  if($('configTotalLanc'))  $('configTotalLanc').textContent=state.lancamentos.length;
  addSyncLog('✅ '+state.lancamentos.length+' lançamentos e '+state.cartoes.length+' cartões carregados.','ok');
}

// ENVIAR — sobe dados para Sheets
async function enviarParaSheets(){
  if($('syncLog')){ $('syncLog').innerHTML=''; $('syncLog').style.display='none'; }
  addSyncLog('Preparando envio para o Google Sheets...','info');
  if(!await garantirToken(true)){ addSyncLog('Sem token OAuth. Clique novamente para tentar.','error'); return; }
  if(!state.sheetsId){
    addSyncLog('Criando planilha pessoal...','info');
    var novoId=await criarPlanilhaCliente();
    if(!novoId){ return; }
    state.sheetsId=novoId;
    localStorage.setItem('fp_sheets_id_'+state.user.email,novoId);
    sheetsPOST({action:'saveSheetsId',email:state.user.email,sheetsId:novoId});
  }
  addSyncLog('Enviando '+state.lancamentos.length+' lançamentos e '+state.cartoes.length+' cartões...','info');
  var ok=await _syncParaSheetsCliente();
  if(ok){ localStorage.setItem('fp_ultimo_sync',new Date().toISOString()); updateConfigPanel(); addSyncLog('✅ Dados enviados com sucesso!','ok'); }
  else{ addSyncLog('Falha no envio — veja o erro acima.','error'); }
}

// BUSCAR PLANILHA NO DRIVE
async function buscarPlanilhaNosDrive(){
  if($('syncLog')){ $('syncLog').innerHTML=''; $('syncLog').style.display='none'; }
  addSyncLog('Buscando planilha FinançasPro no Google Drive...','info');
  if(!await garantirToken(true)){ addSyncLog('Sem token OAuth. Clique novamente para tentar.','error'); return; }
  try{
    var q=encodeURIComponent("name contains 'FinançasPro' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    var res=await fetch(DRIVE_API+'?q='+q+'&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc',{headers:{'Authorization':'Bearer '+state.accessToken}});
    var data=await res.json();
    if(data.error){ addSyncLog('Erro Drive API: '+data.error.message,'error'); return; }
    if(data.files&&data.files.length>0){
      addSyncLog('Encontrada(s) '+data.files.length+' planilha(s):','ok');
      var log=$('syncLog');
      data.files.forEach(function(p){
        var dt=p.modifiedTime?new Date(p.modifiedTime).toLocaleDateString('pt-BR'):'';
        var div=document.createElement('div');
        div.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(27,122,62,0.07);border-radius:6px;margin:3px 0;font-size:0.78rem;gap:8px;';
        div.innerHTML='<span>📊 <strong>'+p.name+'</strong> <span style="color:#999;">'+dt+'</span></span><button onclick="vincularPlanilha(\''+p.id+'\')" style="background:#1B7A3E;color:#fff;border:none;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:0.75rem;">Vincular ✅</button>';
        if(log) log.appendChild(div);
      });
      vincularPlanilha(data.files[0].id,false);
      addSyncLog('✅ Planilha mais recente vinculada. Clique em "Sincronizar ↓".','ok');
    } else {
      addSyncLog('Nenhuma planilha FinançasPro encontrada. Cole o ID manualmente abaixo.','warn');
    }
  } catch(e){ addSyncLog('Erro: '+(e.message||e),'error'); }
}

function vincularPlanilha(id,log){
  if(log===undefined) log=true;
  if(!id) return;
  state.sheetsId=id;
  localStorage.setItem('fp_sheets_id_'+state.user.email,id);
  sheetsPOST({action:'saveSheetsId',email:state.user.email,sheetsId:id});
  if($('inputSheetsId')) $('inputSheetsId').value=id;
  updateConfigPanel();
  if(log){ addSyncLog('✅ Planilha vinculada: '+id.substring(0,24)+'...','ok'); addSyncLog('Clique em "Sincronizar ↓" para carregar os dados.','info'); }
}

function vincularPlanilhaManual(){
  if($('syncLog')){ $('syncLog').innerHTML=''; $('syncLog').style.display='none'; }
  var raw=$('inputSheetsId')?$('inputSheetsId').value.trim():'';
  if(!raw){ addSyncLog('Cole o ID ou URL da planilha acima.','warn'); return; }
  var match=raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  vincularPlanilha(match?match[1]:raw);
}

// EXPORTAR CSV
function exportarCSV(tipo){
  var rows=[],nome='';
  if(tipo==='lancamentos'){
    nome='FinancasPro_Lancamentos_'+MONTHS[state.currentMonth]+state.currentYear+'.csv';
    rows=[['Tipo','Descrição','Valor (R$)','Categoria','Data','Pagamento','Observação','Recorrente']];
    getLancamentosMes().forEach(function(l){ rows.push([l.tipo,l.descricao,(l.valor||0).toFixed(2).replace('.',','),l.categoria,l.data,l.pagamento||'',l.obs||'',l.recorrente?'Sim':'Não']); });
  } else if(tipo==='cartoes'){
    nome='FinancasPro_Cartoes_'+state.currentYear+'.csv';
    rows=[['Nome','Limite (R$)','Fechamento','Vencimento']];
    state.cartoes.forEach(function(c){ rows.push([c.nome,(c.limite||0).toFixed(2).replace('.',','),c.fechamento,c.vencimento]); });
  } else if(tipo==='anual'){
    nome='FinancasPro_Anual_'+state.currentYear+'.csv';
    rows=[['Mês','Receita','Despesa','Saldo','Economia']];
    for(var m=0;m<12;m++){ var it=getLancamentosMes(m,state.currentYear),r=sumBy(it,'receita'),d=sumBy(it,'despesa'),s=r-d,t=r>0?Math.round((s/r)*100):0; rows.push([MONTHS[m]+'/'+state.currentYear,r.toFixed(2).replace('.',','),d.toFixed(2).replace('.',','),s.toFixed(2).replace('.',','),t+'%']); }
  }
  if(!rows.length){ alert('Nenhum dado para exportar.'); return; }
  var csv=rows.map(function(r){ return r.map(function(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }).join(';'); }).join('\r\n');
  var blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a'); a.href=url; a.download=nome;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// EXPORTAR JSON
function exportarDados(){
  var backup={version:'2.0',exportadoEm:new Date().toISOString(),usuario:state.user?state.user.email:'',lancamentos:state.lancamentos,cartoes:state.cartoes};
  var blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a'); a.href=url; a.download='FinancasPro_Backup_'+new Date().toISOString().split('T')[0]+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// LIMPAR DADOS LOCAIS
function limparDados(){
  if(!confirm('\u26a0\ufe0f Apagar\u00e1 TODOS os dados locais.\nOs dados no Sheets permanecem.\n\nContinuar?')) return;
  if(!confirm('Confirmar exclus\u00e3o dos dados locais?')) return;
  state.lancamentos=[]; state.cartoes=[]; saveLocal(); destroyAllCharts(); renderAll(); updateConfigPanel();
  alert('\u2705 Dados locais apagados.\nUse "Sincronizar \u2193" para recarregar do Sheets.');
}

// ══════════════════════════════════════════════════
// AUTO-LOGIN — entra automático se já tiver sessão salva
// ══════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {
  try {
    const savedUser = localStorage.getItem('fp_user');
    if (!savedUser) return; // 1ª visita — deixa tela de login normal
    const user = JSON.parse(savedUser);
    if (!user || !user.email) return;
    // Usuário já cadastrado — entra automaticamente
    state.user     = user;
    state.sheetsId = localStorage.getItem('fp_sheets_id_' + user.email) || null;
    // Restaura token OAuth da sessionStorage (evita popup desnecessário)
    const sessToken  = sessionStorage.getItem('fp_access_token');
    const sessExpiry = parseInt(sessionStorage.getItem('fp_token_expiry') || '0');
    if (sessToken && Date.now() < sessExpiry) {
      state.accessToken = sessToken;
      state.tokenExpiry = sessExpiry;
    }
    // Aguarda Google SDK carregar para inicializar token (silencioso)
    function tryInit() {
      if (window.google && google.accounts && google.accounts.oauth2) {
        _inicializarTokenClient();
      }
      initApp();
    }
    // Pequeno delay para garantir que o SDK carregou
    if (window.google && google.accounts) {
      tryInit();
    } else {
      setTimeout(tryInit, 1500);
    }
  } catch(e) {
    console.warn('Auto-login falhou, usando tela de login normal:', e);
  }
});
