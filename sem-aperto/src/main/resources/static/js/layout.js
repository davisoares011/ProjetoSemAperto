/* =========================================================
   Monta o menu lateral e o topo das telas internas.
   Cada página HTML tem <body data-pagina="..."> e chama Layout.iniciar().
   ========================================================= */

const PAGINAS = [
  { id: 'dashboard', titulo: 'Dashboard', arquivo: 'dashboard.html' },
  { id: 'movimentacoes', titulo: 'Movimentações', arquivo: 'movimentacoes.html' },
  { id: 'historico', titulo: 'Histórico', arquivo: 'historico.html' },
  { id: 'categorias', titulo: 'Categorias', arquivo: 'categorias.html' },
  { id: 'limites', titulo: 'Limites de gastos', arquivo: 'limites.html' },
  { id: 'relatorios', titulo: 'Relatórios', arquivo: 'relatorios.html' },
];

// Telas que usam o seletor de mês do topo
const PAGINAS_COM_MES = ['dashboard', 'historico', 'limites', 'relatorios'];

const Layout = {
  usuario: null,

  /** Confere se tem alguém "logado", desenha o layout e devolve o usuário. */
  async iniciar() {
    let usuario;
    try {
      usuario = await api('/sessao');
    } catch (e) {
      window.location.href = '/index.html';
      return new Promise(() => {}); // para a página aqui enquanto redireciona
    }
    this.usuario = usuario;
    this.desenhar(usuario);
    return usuario;
  },

  desenhar(usuario) {
    const atual = document.body.dataset.pagina;
    const pagina = PAGINAS.find((p) => p.id === atual) || PAGINAS[0];
    document.title = `${pagina.titulo} · Sem Aperto`;

    const itens = PAGINAS.map((p) => `
      <li>
        <a href="${p.arquivo}" class="item-menu ${p.id === atual ? 'ativo' : ''}" ${p.id === atual ? 'aria-current="page"' : ''}>
          ${icone(p.id)}<span>${p.titulo}</span>
        </a>
      </li>`).join('');

    document.getElementById('sidebar').innerHTML = `
      <div class="topo-logo"><a href="dashboard.html"><img src="img/logo.png" alt="Sem Aperto"></a></div>
      <nav aria-label="Menu principal">
        <div class="titulo-menu">Menu</div>
        <ul>${itens}</ul>
      </nav>
      <div class="rodape-menu">
        <div class="usuario-menu">
          <div class="avatar sm">${escapar(iniciais(usuario.apelido))}</div>
          <div>
            <div class="nome">${escapar(usuario.apelido)}</div>
            <div class="user">@${escapar(usuario.username)}</div>
          </div>
        </div>
        <button type="button" class="btn-sair" id="btn-sair">${icone('sair', 'icone-sm')}<span>Sair</span></button>
      </div>`;

    const temMes = PAGINAS_COM_MES.includes(atual);
    document.getElementById('topo').innerHTML = `
      <div class="esquerda">
        <button type="button" class="btn-icone btn-menu-mobile" id="btn-menu" aria-label="Abrir menu">${icone('menu')}</button>
        <h1>${pagina.titulo}</h1>
      </div>
      <div class="direita">
        ${temMes ? `
          <label class="seletor-mes" title="Mês de referência">
            ${icone('calendario', 'icone-sm')}
            <input type="month" id="mes-topo" value="${Mes.obter()}" aria-label="Mês de referência">
          </label>` : ''}
        ${atual !== 'movimentacoes' ? `
          <a href="movimentacoes.html" class="btn btn-primario btn-nova">${icone('mais', 'icone-sm')}Nova movimentação</a>` : ''}
        <div class="avatar" title="${escapar(usuario.apelido)}">${escapar(iniciais(usuario.apelido))}</div>
      </div>`;

    // Menu no celular
    const sidebar = document.getElementById('sidebar');
    const fundo = document.getElementById('fundo-escuro');
    const alternar = (abrir) => {
      sidebar.classList.toggle('aberta', abrir);
      fundo.classList.toggle('aberto', abrir);
    };
    document.getElementById('btn-menu').addEventListener('click', () => alternar(true));
    fundo.addEventListener('click', () => alternar(false));

    document.getElementById('btn-sair').addEventListener('click', async () => {
      try { await api('/sessao', { method: 'DELETE' }); } catch (e) { /* mesmo com erro, volta pra entrada */ }
      window.location.href = '/index.html';
    });

    const inputMes = document.getElementById('mes-topo');
    if (inputMes) {
      inputMes.addEventListener('change', () => {
        if (inputMes.value) Mes.definir(inputMes.value);
      });
    }
  },
};
