/* =========================================================
   Funções usadas por todas as telas:
   chamadas à API, formatação, avisos (toast) e modais.
   ========================================================= */

/** Chama a API do Spring. Como o front e a API estão no mesmo servidor, não tem CORS. */
async function api(caminho, opcoes = {}) {
  const config = {
    method: opcoes.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (opcoes.body !== undefined) config.body = JSON.stringify(opcoes.body);

  let resposta;
  try {
    resposta = await fetch('/api' + caminho, config);
  } catch (e) {
    throw new Error('Não consegui falar com o servidor. Confere se o Spring Boot está rodando.');
  }

  // Sessão expirou ou ninguém entrou: volta pra tela de entrada
  if (resposta.status === 401 && caminho !== '/sessao') {
    window.location.href = '/index.html';
    throw new Error('Entre no sistema para continuar.');
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    const erro = new Error(corpo.mensagem || 'Não foi possível concluir a operação.');
    erro.status = resposta.status;
    throw erro;
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

/* ---------------- Formatação ---------------- */

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function moeda(valor) {
  return formatadorMoeda.format(Number(valor) || 0);
}

/** "2026-11-05" -> "05/11/2026" (sem usar Date, pra não ter problema de fuso horário) */
function dataBR(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
  'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** "2026-11" -> "Novembro 2026" */
function nomeMes(mesIso) {
  const [a, m] = mesIso.split('-');
  return `${NOMES_MESES[Number(m) - 1]} ${a}`;
}

function hojeIso() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function mesAtualIso() {
  return hojeIso().slice(0, 7);
}

/** Último dia do mês "2026-02" -> "2026-02-28" */
function fimDoMes(mesIso) {
  const [a, m] = mesIso.split('-').map(Number);
  const ultimo = new Date(a, m, 0).getDate();
  return `${mesIso}-${String(ultimo).padStart(2, '0')}`;
}

/** Evita que um texto digitado pelo usuário vire HTML na página. */
function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function iniciais(nome) {
  const partes = String(nome || '?').trim().split(/\s+/);
  const letras = partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : partes[0].slice(0, 2);
  return letras.toUpperCase();
}

const TIPOS = { RECEITA: 'Receita', DESPESA: 'Despesa' };
const FREQUENCIAS = { UNICA: 'Única', SEMANAL: 'Semanal', MENSAL: 'Mensal', ANUAL: 'Anual' };

/* ---------------- Mês escolhido no topo da tela ---------------- */

const Mes = {
  obter() {
    try {
      return sessionStorage.getItem('mesSelecionado') || mesAtualIso();
    } catch (e) {
      return mesAtualIso();
    }
  },
  definir(valor) {
    try { sessionStorage.setItem('mesSelecionado', valor); } catch (e) { /* sem storage, segue o jogo */ }
    document.dispatchEvent(new CustomEvent('mudou-mes', { detail: valor }));
  },
};

/* ---------------- Ícones (SVG) ---------------- */

const ICONES = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  movimentacoes: '<path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>',
  historico: '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  categorias: '<path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>',
  limites: '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
  relatorios: '<path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
  sair: '<path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  fechar: '<path d="M18 6L6 18M6 6l12 12"/>',
  editar: '<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>',
  lixeira: '<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
  sobe: '<path d="M7 11l5-5m0 0l5 5m-5-5v12"/>',
  desce: '<path d="M17 13l-5 5m0 0l-5-5m5 5V6"/>',
  dinheiro: '<path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  selo: '<path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>',
  busca: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  pdf: '<path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
  esquerda: '<path d="M15 19l-7-7 7-7"/>',
  direita: '<path d="M9 5l7 7-7 7"/>',
};

function icone(nome, classeExtra = '') {
  return `<svg class="icone ${classeExtra}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ''}</svg>`;
}

/* ---------------- Aviso rápido (toast) ---------------- */

function toast(mensagem, tipo = 'sucesso') {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span>${escapar(mensagem)}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('saindo'), 3200);
  setTimeout(() => el.remove(), 3600);
}

/* ---------------- Modal ---------------- */

/**
 * Abre um modal. "conteudo" é HTML.
 * Devolve o elemento do modal e uma função pra fechar.
 */
function abrirModal(titulo, conteudo, { pequeno = false } = {}) {
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  fundo.innerHTML = `
    <div class="modal ${pequeno ? 'pequeno' : ''}" role="dialog" aria-modal="true" aria-label="${escapar(titulo)}">
      <div class="modal-cabecalho">
        <h2>${escapar(titulo)}</h2>
        <button type="button" class="btn-icone" data-fechar aria-label="Fechar">${icone('fechar', 'icone-sm')}</button>
      </div>
      <div class="modal-corpo">${conteudo}</div>
    </div>`;
  document.body.appendChild(fundo);

  const fechar = () => {
    fundo.remove();
    document.removeEventListener('keydown', aoTeclar);
  };
  const aoTeclar = (e) => { if (e.key === 'Escape') fechar(); };
  document.addEventListener('keydown', aoTeclar);
  fundo.addEventListener('click', (e) => {
    if (e.target === fundo || e.target.closest('[data-fechar]')) fechar();
  });

  const primeiroCampo = fundo.querySelector('input, select, textarea');
  if (primeiroCampo) primeiroCampo.focus();

  return { el: fundo, fechar };
}

/** Modal de "tem certeza?". Resolve true se a pessoa confirmar. */
function confirmar(titulo, mensagemHtml, textoBotao = 'Excluir') {
  return new Promise((resolve) => {
    const { el, fechar } = abrirModal(titulo, `
      <p>${mensagemHtml}</p>
      <div class="botoes-form">
        <button type="button" class="btn btn-secundario" data-fechar>Cancelar</button>
        <button type="button" class="btn btn-perigo" data-confirmar>${escapar(textoBotao)}</button>
      </div>`, { pequeno: true });
    el.querySelector('[data-confirmar]').addEventListener('click', () => { fechar(); resolve(true); });
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.closest('[data-fechar]')) resolve(false);
    });
  });
}
