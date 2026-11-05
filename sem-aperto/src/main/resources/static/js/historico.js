/* Histórico com filtros, paginação, edição e exclusão. */

const POR_PAGINA = 8;
let todas = [];
let pagina = 1;

const $ = (id) => document.getElementById(id);

async function buscarMovimentacoes() {
  const periodo = $('filtro-periodo').value;
  let caminho = '/movimentacoes';
  if (periodo === 'mes') {
    const mes = Mes.obter();
    caminho += `?inicio=${mes}-01&fim=${fimDoMes(mes)}`;
  }
  try {
    todas = await api(caminho);
  } catch (e) {
    toast(e.message, 'erro');
    todas = [];
  }
  pagina = 1;
  desenhar();
}

function filtradas() {
  const busca = $('busca').value.trim().toLowerCase();
  const tipo = $('filtro-tipo').value;
  const categoria = $('filtro-categoria').value;
  return todas.filter((m) =>
    (!busca || m.descricao.toLowerCase().includes(busca) || m.categoriaNome.toLowerCase().includes(busca)) &&
    (!tipo || m.tipo === tipo) &&
    (!categoria || String(m.categoriaId) === categoria));
}

function desenhar() {
  const lista = filtradas();
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  pagina = Math.min(pagina, totalPaginas);
  const daPagina = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  $('linhas').innerHTML = daPagina.length ? daPagina.map((m) => {
    const receita = m.tipo === 'RECEITA';
    return `
      <tr>
        <td class="data">${dataBR(m.data)}</td>
        <td class="desc">${escapar(m.descricao)}</td>
        <td class="esconder-celular"><span class="etiqueta bg-cinza cinza">${escapar(m.categoriaIcone)} ${escapar(m.categoriaNome)}</span></td>
        <td class="esconder-celular"><span class="etiqueta ${receita ? 'bg-verde verde' : 'bg-vermelho vermelho'}">${TIPOS[m.tipo]}</span></td>
        <td class="valor ${receita ? 'verde' : 'vermelho'}">${receita ? '+' : '-'}${moeda(m.valor)}</td>
        <td style="white-space:nowrap">
          <a class="btn-icone" href="movimentacoes.html?id=${m.id}" title="Editar" aria-label="Editar">${icone('editar', 'icone-sm')}</a>
          <button type="button" class="btn-icone excluir" data-excluir="${m.id}" data-nome="${escapar(m.descricao)}" title="Excluir" aria-label="Excluir">${icone('lixeira', 'icone-sm')}</button>
        </td>
      </tr>`;
  }).join('') : `
    <tr><td colspan="6">
      <div class="vazio">
        ${icone('busca')}
        <p>Nenhuma movimentação encontrada.</p>
        <button type="button" class="btn-link" data-limpar>Limpar filtros</button>
      </div>
    </td></tr>`;

  const pag = $('paginacao');
  if (lista.length <= POR_PAGINA) {
    pag.classList.add('oculto');
    return;
  }
  pag.classList.remove('oculto');
  const numeros = Array.from({ length: totalPaginas }, (_, i) =>
    `<button type="button" class="${i + 1 === pagina ? 'ativo' : ''}" data-pagina="${i + 1}">${i + 1}</button>`).join('');
  pag.innerHTML = `
    <span class="info">Exibindo ${(pagina - 1) * POR_PAGINA + 1}–${Math.min(pagina * POR_PAGINA, lista.length)} de ${lista.length}</span>
    <div class="paginas">
      <button type="button" data-pagina="${pagina - 1}" ${pagina === 1 ? 'disabled' : ''} aria-label="Anterior">${icone('esquerda', 'icone-sm')}</button>
      ${numeros}
      <button type="button" data-pagina="${pagina + 1}" ${pagina === totalPaginas ? 'disabled' : ''} aria-label="Próxima">${icone('direita', 'icone-sm')}</button>
    </div>`;
}

function limparFiltros() {
  $('busca').value = '';
  $('filtro-tipo').value = '';
  $('filtro-categoria').value = '';
  pagina = 1;
  desenhar();
}

Layout.iniciar().then(async () => {
  try {
    const categorias = await api('/categorias');
    $('filtro-categoria').innerHTML = '<option value="">Todas</option>' + categorias
      .map((c) => `<option value="${c.id}">${escapar(c.nome)}</option>`).join('');
  } catch (e) { /* o filtro de categoria fica só com "Todas" */ }

  ['busca', 'filtro-tipo', 'filtro-categoria'].forEach((id) =>
    $(id).addEventListener('input', () => { pagina = 1; desenhar(); }));
  $('filtro-periodo').addEventListener('change', buscarMovimentacoes);
  $('btn-limpar').addEventListener('click', limparFiltros);
  document.addEventListener('mudou-mes', () => {
    $('filtro-periodo').value = 'mes';
    buscarMovimentacoes();
  });

  $('paginacao').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pagina]');
    if (b && !b.disabled) { pagina = Number(b.dataset.pagina); desenhar(); }
  });

  $('linhas').addEventListener('click', async (e) => {
    if (e.target.closest('[data-limpar]')) return limparFiltros();
    const botao = e.target.closest('[data-excluir]');
    if (!botao) return;
    const ok = await confirmar('Confirmar exclusão',
      `Deseja excluir a movimentação <strong>${escapar(botao.dataset.nome)}</strong>? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    try {
      await api(`/movimentacoes/${botao.dataset.excluir}`, { method: 'DELETE' });
      todas = todas.filter((m) => String(m.id) !== botao.dataset.excluir);
      desenhar();
      toast('Movimentação excluída.');
    } catch (err) {
      toast(err.message, 'erro');
    }
  });

  buscarMovimentacoes();
});
