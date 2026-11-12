let limites = [];
let categoriasDespesa = [];

function situacao(pct) {
  if (pct > 100) return { cor: '#E85D5D', classe: 'vermelho', fundo: 'bg-vermelho', texto: 'Ultrapassado' };
  if (pct === 100) return { cor: '#E85D5D', classe: 'vermelho', fundo: 'bg-vermelho', texto: 'Limite atingido' };
  if (pct >= 80) return { cor: '#F2B84B', classe: 'amarelo', fundo: 'bg-amarelo', texto: 'Alerta' };
  return { cor: '#2BA889', classe: 'verde', fundo: 'bg-verde', texto: 'Dentro do limite' };
}

async function carregar() {
  const mes = Mes.obter();
  document.getElementById('mes-nome').textContent = nomeMes(mes);
  try {
    limites = await api(`/limites?mes=${mes}`);
  } catch (e) {
    toast(e.message, 'erro');
    limites = [];
  }
  desenhar();
}

function desenhar() {
  const total = limites.reduce((s, l) => s + Number(l.valor), 0);
  const gasto = limites.reduce((s, l) => s + Number(l.gasto), 0);
  const pctGeral = total ? Math.round((gasto / total) * 100) : 0;
  const geral = situacao(pctGeral);

  const card = (rotulo, valor, cor, iconeNome, corIcone, fundo) => `
    <div class="cartao resumo">
      <div class="icone-caixa ${fundo} ${corIcone}" style="margin-bottom:16px">${icone(iconeNome)}</div>
      <div class="rotulo">${rotulo}</div>
      <div class="valor ${cor}">${moeda(valor)}</div>
    </div>`;
  document.getElementById('cards-limite').innerHTML =
    card('Limite mensal', total, '', 'selo', 'azul', 'bg-azul') +
    card('Total utilizado', gasto, 'vermelho', 'desce', 'vermelho', 'bg-vermelho') +
    card('Disponível', total - gasto, total - gasto < 0 ? 'vermelho' : 'verde', 'dinheiro', 'verde', 'bg-verde');

  document.getElementById('uso-texto').textContent = `${moeda(gasto)} de ${moeda(total)}`;
  const pctEl = document.getElementById('uso-pct');
  pctEl.textContent = `${pctGeral}%`;
  pctEl.className = geral.classe;
  const barra = document.getElementById('uso-barra');
  barra.style.background = geral.cor;
  requestAnimationFrame(() => { barra.style.width = `${Math.min(pctGeral, 100)}%`; });

  document.getElementById('lista-limites').innerHTML = limites.length ? limites.map((l) => {
    const pct = Number(l.valor) ? Math.round((Number(l.gasto) / Number(l.valor)) * 100) : 0;
    const s = situacao(pct);
    return `
      <div class="limite-item">
        <div class="linha">
          <div class="esq">
            <span class="emoji">${escapar(l.categoriaIcone)}</span>
            <div>
              <div class="nome">${escapar(l.categoriaNome)}</div>
              <div class="detalhe">${moeda(l.gasto)} de ${moeda(l.valor)}</div>
            </div>
          </div>
          <div class="dir">
            <span class="etiqueta ${s.fundo} ${s.classe} esconder-celular">${s.texto}</span>
            <span class="pct ${s.classe}">${pct}%</span>
            <button type="button" class="btn-icone" data-editar="${l.categoriaId}" data-valor="${l.valor}" title="Alterar" aria-label="Alterar limite">${icone('editar', 'icone-xs')}</button>
            <button type="button" class="btn-icone excluir" data-excluir="${l.id}" data-nome="${escapar(l.categoriaNome)}" title="Remover" aria-label="Remover limite">${icone('lixeira', 'icone-xs')}</button>
          </div>
        </div>
        <div class="barra"><div style="width:${Math.min(pct, 100)}%;background:${s.cor}"></div></div>
      </div>`;
  }).join('') : `<div class="vazio">Nenhum limite definido para ${nomeMes(Mes.obter())}.</div>`;
}

function abrirFormulario(categoriaId, valor) {
  if (!categoriasDespesa.length) {
    toast('Cadastre uma categoria de despesa primeiro.', 'erro');
    return;
  }
  const { el, fechar } = abrirModal('Definir limite', `
    <div class="campo">
      <label for="lim-categoria">Categoria</label>
      <select class="entrada" id="lim-categoria">
        ${categoriasDespesa.map((c) => `<option value="${c.id}">${escapar(c.icone)} ${escapar(c.nome)}</option>`).join('')}
      </select>
    </div>
    <div class="campo">
      <label for="lim-valor">Limite mensal</label>
      <div class="entrada-prefixo">
        <span>R$</span>
        <input class="entrada" id="lim-valor" type="number" min="0.01" step="0.01" placeholder="0,00">
      </div>
      <span class="dica">Vale para ${nomeMes(Mes.obter())}. Se a categoria já tiver limite, o valor é trocado.</span>
    </div>
    <div class="alerta-erro oculto" id="lim-erro" style="margin-top:0"></div>
    <div class="botoes-form">
      <button type="button" class="btn btn-secundario" data-fechar>Cancelar</button>
      <button type="button" class="btn btn-primario" id="lim-salvar">Salvar limite</button>
    </div>`, { pequeno: true });

  if (categoriaId) el.querySelector('#lim-categoria').value = categoriaId;
  if (valor) el.querySelector('#lim-valor').value = valor;

  el.querySelector('#lim-salvar').addEventListener('click', async () => {
    const dados = {
      categoriaId: Number(el.querySelector('#lim-categoria').value),
      valor: Number(el.querySelector('#lim-valor').value),
      mes: Mes.obter(),
    };
    const erro = el.querySelector('#lim-erro');
    if (!(dados.valor > 0)) {
      erro.textContent = 'Informe um valor maior que zero.';
      erro.classList.remove('oculto');
      return;
    }
    try {
      await api('/limites', { method: 'POST', body: dados });
      fechar();
      toast('Limite definido com sucesso.');
      carregar();
    } catch (err) {
      erro.textContent = err.message;
      erro.classList.remove('oculto');
    }
  });
}

Layout.iniciar().then(async () => {
  try {
    categoriasDespesa = (await api('/categorias')).filter((c) => c.tipo === 'DESPESA');
  } catch (e) { /* o modal avisa se não tiver categoria */ }

  carregar();
  document.addEventListener('mudou-mes', carregar);
  document.getElementById('btn-definir').addEventListener('click', () => abrirFormulario());

  document.getElementById('lista-limites').addEventListener('click', async (e) => {
    const editar = e.target.closest('[data-editar]');
    if (editar) return abrirFormulario(editar.dataset.editar, editar.dataset.valor);
    const excluir = e.target.closest('[data-excluir]');
    if (!excluir) return;
    const ok = await confirmar('Remover limite', `Remover o limite de <strong>${escapar(excluir.dataset.nome)}</strong> neste mês?`, 'Remover');
    if (!ok) return;
    try {
      await api(`/limites/${excluir.dataset.excluir}`, { method: 'DELETE' });
      toast('Limite removido.');
      carregar();
    } catch (err) {
      toast(err.message, 'erro');
    }
  });
});
