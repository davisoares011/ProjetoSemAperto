/* Cadastro e edição de receitas/despesas. Para editar: movimentacoes.html?id=123 */

const estado = {
  tipo: 'DESPESA',
  recorrente: false,
  frequencia: 'MENSAL',
  categorias: [],
  editandoId: new URLSearchParams(window.location.search).get('id'),
};

const $ = (id) => document.getElementById(id);

function trocarTipo(tipo, categoriaSelecionada) {
  estado.tipo = tipo;
  document.querySelectorAll('.aba').forEach((aba) => {
    const ativa = aba.dataset.tipo === tipo;
    aba.classList.toggle('ativa', ativa);
    aba.setAttribute('aria-selected', ativa);
  });
  $('descricao').placeholder = tipo === 'RECEITA' ? 'Ex: Salário, freelance...' : 'Ex: Supermercado, luz...';

  const opcoes = estado.categorias.filter((c) => c.tipo === tipo);
  $('categoria').innerHTML = '<option value="">Selecionar</option>' + opcoes
    .map((c) => `<option value="${c.id}">${escapar(c.icone)} ${escapar(c.nome)}</option>`).join('');
  if (categoriaSelecionada) $('categoria').value = categoriaSelecionada;
}

function definirRecorrente(ligado) {
  estado.recorrente = ligado;
  $('toggle-recorrente').classList.toggle('ligado', ligado);
  $('toggle-recorrente').setAttribute('aria-checked', ligado);
  $('bloco-frequencia').classList.toggle('oculto', !ligado);
}

function definirFrequencia(freq) {
  estado.frequencia = freq;
  document.querySelectorAll('#chips-frequencia .chip').forEach((c) => c.classList.toggle('ativo', c.dataset.freq === freq));
}

function limparFormulario() {
  $('form-mov').reset();
  $('data').value = hojeIso();
  definirRecorrente(false);
  definirFrequencia('MENSAL');
  $('erro').classList.add('oculto');
}

async function carregarRecorrentes() {
  const todas = await api('/movimentacoes');
  const recorrentes = todas.filter((m) => m.frequencia !== 'UNICA');

  // Se a mesma conta aparece várias vezes (ex.: aluguel todo mês), mostra só a mais recente
  const vistas = new Set();
  const unicas = recorrentes.filter((m) => {
    const chave = `${m.descricao.toLowerCase()}|${m.categoriaId}|${m.frequencia}`;
    if (vistas.has(chave)) return false;
    vistas.add(chave);
    return true;
  });

  $('qtd-recorrentes').textContent = `${unicas.length} ativa${unicas.length === 1 ? '' : 's'}`;
  $('recorrentes').innerHTML = unicas.length ? unicas.map((m) => `
    <div class="recorrente">
      <div class="topo-rec">
        <div>
          <div class="nome">${escapar(m.descricao)}</div>
          <div class="cat">${escapar(m.categoriaIcone)} ${escapar(m.categoriaNome)}</div>
        </div>
        <div class="valor ${m.tipo === 'RECEITA' ? 'verde' : 'vermelho'}">${moeda(m.valor)}</div>
      </div>
      <div class="baixo-rec">
        <div class="info">
          <span class="etiqueta bg-cinza cinza">${FREQUENCIAS[m.frequencia]}</span>
          <span>Próx: ${dataBR(proximaData(m.data, m.frequencia))}</span>
        </div>
        <div>
          <a class="btn-icone" href="movimentacoes.html?id=${m.id}" title="Editar" aria-label="Editar">${icone('editar', 'icone-xs')}</a>
          <button type="button" class="btn-icone excluir" data-excluir="${m.id}" data-nome="${escapar(m.descricao)}" title="Excluir" aria-label="Excluir">${icone('lixeira', 'icone-xs')}</button>
        </div>
      </div>
    </div>`).join('')
    : '<div class="vazio">Nenhuma movimentação recorrente ainda.<br>Ligue a opção "Movimentação recorrente" ao cadastrar.</div>';
}

/** Calcula a próxima data de uma recorrência, a partir de hoje. */
function proximaData(dataIso, frequencia) {
  const [a, m, d] = dataIso.split('-').map(Number);
  let data = new Date(a, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let voltas = 0;
  while (data <= hoje && voltas < 1000) {
    if (frequencia === 'SEMANAL') data.setDate(data.getDate() + 7);
    else if (frequencia === 'MENSAL') data = new Date(data.getFullYear(), data.getMonth() + 1, Math.min(d, new Date(data.getFullYear(), data.getMonth() + 2, 0).getDate()));
    else data.setFullYear(data.getFullYear() + 1);
    voltas++;
  }
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

async function carregarEdicao(id) {
  try {
    const m = await api(`/movimentacoes/${id}`);
    $('titulo-form').textContent = 'Editar movimentação';
    $('aviso-edicao').classList.remove('oculto');
    $('btn-salvar').textContent = 'Salvar alterações';
    trocarTipo(m.tipo, m.categoriaId);
    $('descricao').value = m.descricao;
    $('valor').value = m.valor;
    $('data').value = m.data;
    $('conta').value = m.conta;
    $('observacao').value = m.observacao || '';
    definirRecorrente(m.frequencia !== 'UNICA');
    if (m.frequencia !== 'UNICA') definirFrequencia(m.frequencia);
  } catch (e) {
    toast(e.message, 'erro');
    estado.editandoId = null;
  }
}

async function salvar(e) {
  e.preventDefault();
  $('erro').classList.add('oculto');

  const dados = {
    descricao: $('descricao').value.trim(),
    valor: Number($('valor').value),
    data: $('data').value,
    tipo: estado.tipo,
    categoriaId: Number($('categoria').value) || null,
    conta: $('conta').value,
    observacao: $('observacao').value.trim() || null,
    frequencia: estado.recorrente ? estado.frequencia : 'UNICA',
  };

  let problema = '';
  if (!dados.descricao) problema = 'Informe a descrição.';
  else if (!(dados.valor > 0)) problema = 'Informe um valor maior que zero.';
  else if (!dados.data) problema = 'Informe a data.';
  else if (!dados.categoriaId) problema = 'Escolha uma categoria.';
  if (problema) {
    $('erro').textContent = problema;
    $('erro').classList.remove('oculto');
    return;
  }

  $('btn-salvar').disabled = true;
  try {
    if (estado.editandoId) {
      await api(`/movimentacoes/${estado.editandoId}`, { method: 'PUT', body: dados });
      toast('Movimentação atualizada com sucesso.');
      setTimeout(() => { window.location.href = 'historico.html'; }, 800);
      return;
    }
    await api('/movimentacoes', { method: 'POST', body: dados });
    toast('Movimentação cadastrada com sucesso.');
    const tipo = estado.tipo;
    limparFormulario();
    trocarTipo(tipo);
    carregarRecorrentes();
  } catch (err) {
    $('erro').textContent = err.message;
    $('erro').classList.remove('oculto');
  } finally {
    $('btn-salvar').disabled = false;
  }
}

Layout.iniciar().then(async () => {
  try {
    estado.categorias = await api('/categorias');
  } catch (e) {
    toast('Não foi possível carregar as categorias.', 'erro');
  }

  limparFormulario();
  trocarTipo('DESPESA');

  document.querySelectorAll('.aba').forEach((aba) => aba.addEventListener('click', () => trocarTipo(aba.dataset.tipo)));
  $('toggle-recorrente').addEventListener('click', () => definirRecorrente(!estado.recorrente));
  document.querySelectorAll('#chips-frequencia .chip').forEach((c) => c.addEventListener('click', () => definirFrequencia(c.dataset.freq)));
  $('form-mov').addEventListener('submit', salvar);
  $('btn-cancelar').addEventListener('click', () => {
    if (estado.editandoId) window.location.href = 'historico.html';
    else { limparFormulario(); trocarTipo(estado.tipo); }
  });

  $('recorrentes').addEventListener('click', async (e) => {
    const botao = e.target.closest('[data-excluir]');
    if (!botao) return;
    const ok = await confirmar('Confirmar exclusão',
      `Deseja excluir a movimentação <strong>${escapar(botao.dataset.nome)}</strong>? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    try {
      await api(`/movimentacoes/${botao.dataset.excluir}`, { method: 'DELETE' });
      toast('Movimentação excluída.');
      carregarRecorrentes();
    } catch (err) {
      toast(err.message, 'erro');
    }
  });

  if (estado.editandoId) await carregarEdicao(estado.editandoId);
  carregarRecorrentes().catch((e) => toast(e.message, 'erro'));
});
