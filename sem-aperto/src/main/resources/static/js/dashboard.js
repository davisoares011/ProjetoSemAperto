function variacao(atual, anterior) {
  atual = Number(atual);
  anterior = Number(anterior);
  if (!anterior) return null;
  return Math.round(((atual - anterior) / anterior) * 100);
}

function cardResumo({ rotulo, valor, corValor, iconeNome, corIcone, fundoIcone, etiqueta, etiquetaBoa }) {
  return `
    <div class="cartao resumo">
      <div class="linha">
        <div class="icone-caixa ${fundoIcone} ${corIcone}">${icone(iconeNome)}</div>
        ${etiqueta ? `<span class="etiqueta ${etiquetaBoa ? 'bg-verde verde' : 'bg-vermelho vermelho'}">${etiqueta}</span>` : ''}
      </div>
      <div class="rotulo">${rotulo}</div>
      <div class="valor ${corValor}">${moeda(valor)}</div>
    </div>`;
}

function textoVariacao(pct) {
  if (pct === null) return '';
  return `${pct > 0 ? '+' : ''}${pct}% vs mês ant.`;
}

function itemMovimentacao(m) {
  const receita = m.tipo === 'RECEITA';
  return `
    <div class="item-lista">
      <div class="emoji-caixa">${escapar(m.categoriaIcone)}</div>
      <div class="info">
        <div class="titulo">${escapar(m.descricao)}</div>
        <div class="detalhe">${escapar(m.categoriaNome)}</div>
      </div>
      <div class="data">${dataBR(m.data)}</div>
      <div class="valor ${receita ? 'verde' : 'vermelho'}">${receita ? '+' : '-'}${moeda(m.valor)}</div>
    </div>`;
}

async function carregarDashboard() {
  const mes = Mes.obter();
  document.querySelectorAll('.mes-texto').forEach((el) => { el.textContent = nomeMes(mes); });

  let d;
  try {
    d = await api(`/dashboard?mes=${mes}`);
  } catch (e) {
    toast(e.message, 'erro');
    return;
  }

  const varReceitas = variacao(d.receitas, d.receitasMesAnterior);
  const varDespesas = variacao(d.despesas, d.despesasMesAnterior);
  const usoLimite = Number(d.limiteTotal) ? Math.round(((d.limiteTotal - d.limiteDisponivel) / d.limiteTotal) * 100) : null;

  document.getElementById('cards').innerHTML = [
    cardResumo({ rotulo: 'Saldo do mês', valor: d.saldo, corValor: Number(d.saldo) < 0 ? 'vermelho' : '',
      iconeNome: 'dinheiro', corIcone: 'verde', fundoIcone: 'bg-verde',
      etiqueta: Number(d.saldo) >= 0 ? 'Positivo' : 'Negativo', etiquetaBoa: Number(d.saldo) >= 0 }),
    cardResumo({ rotulo: 'Receitas', valor: d.receitas, corValor: 'verde', iconeNome: 'sobe', corIcone: 'verde',
      fundoIcone: 'bg-verde', etiqueta: textoVariacao(varReceitas), etiquetaBoa: varReceitas >= 0 }),
    cardResumo({ rotulo: 'Despesas', valor: d.despesas, corValor: 'vermelho', iconeNome: 'desce', corIcone: 'vermelho',
      fundoIcone: 'bg-vermelho', etiqueta: textoVariacao(varDespesas), etiquetaBoa: varDespesas <= 0 }),
    cardResumo({ rotulo: 'Limite disponível', valor: d.limiteDisponivel,
      corValor: Number(d.limiteDisponivel) < 0 ? 'vermelho' : '', iconeNome: 'selo', corIcone: 'azul', fundoIcone: 'bg-azul',
      etiqueta: usoLimite === null ? 'Sem limites' : `${usoLimite}% utilizado`, etiquetaBoa: usoLimite === null || usoLimite < 100 }),
  ].join('');

  Graficos.linhas(document.getElementById('grafico-evolucao'), {
    rotulos: d.evolucao.map((p) => String(p.dia).padStart(2, '0')),
    series: [
      { nome: 'Receitas', cor: '#2BA889', valores: d.evolucao.map((p) => Number(p.receitas)) },
      { nome: 'Despesas', cor: '#E85D5D', valores: d.evolucao.map((p) => Number(p.despesas)) },
      { nome: 'Saldo', cor: '#1675A5', valores: d.evolucao.map((p) => Number(p.saldo)), tracejado: true },
    ],
  });

  const cats = d.despesasPorCategoria.map((c) => ({ nome: c.nome, cor: c.cor, valor: Number(c.valor) }));
  Graficos.rosca(document.getElementById('grafico-categorias'), cats);
  document.getElementById('lista-categorias').innerHTML = cats.map((c) => `
    <div class="linha">
      <span class="nome"><span class="bola" style="background:${escapar(c.cor)}"></span>${escapar(c.nome)}</span>
      <span class="numero">${moeda(c.valor)}</span>
    </div>`).join('');

  document.getElementById('ultimas').innerHTML = d.ultimasMovimentacoes.length
    ? d.ultimasMovimentacoes.map(itemMovimentacao).join('')
    : `<div class="vazio">Nenhuma movimentação em ${nomeMes(mes)}. <a href="movimentacoes.html">Cadastrar agora</a></div>`;
}

Layout.iniciar().then((usuario) => {
  document.getElementById('saudacao').textContent = `Olá, ${usuario.apelido}! 👋`;
  carregarDashboard();
  document.addEventListener('mudou-mes', carregarDashboard);
});
