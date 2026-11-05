/* Cadastro, edição e exclusão de categorias. */

const CORES = ['#1675A5', '#2BA889', '#155A7D', '#F2B84B', '#55B978', '#8B5CF6', '#E85D5D', '#F97316', '#9CA3AF'];
const ICONES_CATEGORIA = ['🏠', '🍽️', '📄', '🚗', '🎮', '📚', '💊', '💰', '📦', '✈️', '🛍️', '💻', '🏋️', '🎵', '🐾'];

let categorias = [];
let filtroTipo = '';

async function carregar() {
  try {
    categorias = await api('/categorias');
  } catch (e) {
    toast(e.message, 'erro');
  }
  desenhar();
}

function desenhar() {
  const lista = filtroTipo ? categorias.filter((c) => c.tipo === filtroTipo) : categorias;
  const grade = document.getElementById('grade-categorias');
  if (!lista.length) {
    grade.innerHTML = '<div class="cartao vazio" style="grid-column:1/-1">Nenhuma categoria por aqui ainda.</div>';
    return;
  }
  grade.innerHTML = lista.map((c) => `
    <div class="cartao cartao-categoria">
      <div class="linha">
        <div class="emoji-grande" style="background:${escapar(c.cor)}1f">${escapar(c.icone)}</div>
        <div class="botoes">
          <button type="button" class="btn-icone" data-editar="${c.id}" title="Editar" aria-label="Editar ${escapar(c.nome)}">${icone('editar', 'icone-xs')}</button>
          <button type="button" class="btn-icone excluir" data-excluir="${c.id}" title="Excluir" aria-label="Excluir ${escapar(c.nome)}">${icone('lixeira', 'icone-xs')}</button>
        </div>
      </div>
      <div class="nome">${escapar(c.nome)}</div>
      <span class="etiqueta" style="background:${escapar(c.cor)}1f;color:${escapar(c.cor)}">${TIPOS[c.tipo]}</span>
      <div class="base">
        <span class="qtd">${c.quantidade} movimentaç${c.quantidade === 1 ? 'ão' : 'ões'}</span>
        <span class="total">${moeda(c.total)}</span>
      </div>
    </div>`).join('');
}

function abrirFormulario(categoria) {
  const form = categoria
    ? { nome: categoria.nome, tipo: categoria.tipo, cor: categoria.cor, icone: categoria.icone }
    : { nome: '', tipo: filtroTipo || 'DESPESA', cor: '#2BA889', icone: '📦' };

  const { el, fechar } = abrirModal(categoria ? 'Editar categoria' : 'Nova categoria', `
    <div class="campo">
      <label for="cat-nome">Nome da categoria</label>
      <input class="entrada" id="cat-nome" maxlength="80" placeholder="Ex: Alimentação" value="${escapar(form.nome)}">
    </div>
    <div class="campo">
      <label>Tipo</label>
      <div class="tipo-opcoes">
        <button type="button" class="receita" data-tipo="RECEITA">Receita</button>
        <button type="button" class="despesa" data-tipo="DESPESA">Despesa</button>
      </div>
    </div>
    <div class="campo">
      <label>Cor</label>
      <div class="cores">${CORES.map((c) => `<button type="button" class="cor-opcao" data-cor="${c}" style="background:${c};color:${c}" aria-label="Cor ${c}"></button>`).join('')}</div>
    </div>
    <div class="campo">
      <label>Ícone</label>
      <div class="icones">${ICONES_CATEGORIA.map((i) => `<button type="button" class="icone-opcao" data-icone="${i}">${i}</button>`).join('')}</div>
    </div>
    <div class="alerta-erro oculto" id="cat-erro" style="margin-top:0"></div>
    <div class="botoes-form">
      <button type="button" class="btn btn-secundario" data-fechar>Cancelar</button>
      <button type="button" class="btn btn-primario" id="cat-salvar">Salvar categoria</button>
    </div>`);

  const marcar = () => {
    el.querySelectorAll('[data-tipo]').forEach((b) => b.classList.toggle('ativo', b.dataset.tipo === form.tipo));
    el.querySelectorAll('[data-cor]').forEach((b) => b.classList.toggle('ativo', b.dataset.cor === form.cor));
    el.querySelectorAll('[data-icone]').forEach((b) => b.classList.toggle('ativo', b.dataset.icone === form.icone));
  };
  marcar();

  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tipo) form.tipo = b.dataset.tipo;
    if (b.dataset.cor) form.cor = b.dataset.cor;
    if (b.dataset.icone) form.icone = b.dataset.icone;
    marcar();
  });

  el.querySelector('#cat-salvar').addEventListener('click', async () => {
    form.nome = el.querySelector('#cat-nome').value.trim();
    const erro = el.querySelector('#cat-erro');
    if (!form.nome) {
      erro.textContent = 'Informe o nome da categoria.';
      erro.classList.remove('oculto');
      return;
    }
    try {
      if (categoria) {
        await api(`/categorias/${categoria.id}`, { method: 'PUT', body: form });
        toast('Categoria atualizada com sucesso.');
      } else {
        await api('/categorias', { method: 'POST', body: form });
        toast('Categoria criada com sucesso.');
      }
      fechar();
      carregar();
    } catch (err) {
      erro.textContent = err.message;
      erro.classList.remove('oculto');
    }
  });
}

Layout.iniciar().then(() => {
  carregar();

  document.getElementById('btn-nova').addEventListener('click', () => abrirFormulario(null));

  document.getElementById('filtro-tipo').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tipo]');
    if (!b) return;
    filtroTipo = b.dataset.tipo;
    document.querySelectorAll('#filtro-tipo button').forEach((x) => x.classList.toggle('ativo', x === b));
    desenhar();
  });

  document.getElementById('grade-categorias').addEventListener('click', async (e) => {
    const editar = e.target.closest('[data-editar]');
    if (editar) {
      abrirFormulario(categorias.find((c) => String(c.id) === editar.dataset.editar));
      return;
    }
    const excluir = e.target.closest('[data-excluir]');
    if (!excluir) return;
    const cat = categorias.find((c) => String(c.id) === excluir.dataset.excluir);
    const ok = await confirmar('Confirmar exclusão', `Deseja excluir a categoria <strong>${escapar(cat.nome)}</strong>?`);
    if (!ok) return;
    try {
      await api(`/categorias/${cat.id}`, { method: 'DELETE' });
      toast('Categoria excluída.');
      carregar();
    } catch (err) {
      toast(err.message, 'erro');
    }
  });
});
