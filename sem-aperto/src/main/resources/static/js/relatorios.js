let relatorio = null;

async function carregar() {
  const mes = Mes.obter();
  document.querySelectorAll('.mes-texto').forEach((el) => { el.textContent = nomeMes(mes); });
  try {
    relatorio = await api(`/relatorios?mes=${mes}`);
  } catch (e) {
    toast(e.message, 'erro');
    return;
  }
  desenhar(relatorio, mes);
}

function desenhar(r, mes) {
  const cats = r.despesasPorCategoria.map((c) => ({ nome: c.nome, cor: c.cor, icone: c.icone, valor: Number(c.valor) }));
  const maior = cats[0];
  const menor = cats[cats.length - 1];
  const totalCats = cats.reduce((s, c) => s + c.valor, 0);
  const mediaDespesas = r.ultimosMeses.reduce((s, m) => s + Number(m.despesas), 0) / r.ultimosMeses.length;

  const card = (rotulo, valor, cor) => `
    <div class="cartao resumo">
      <div class="rotulo" style="margin-bottom:8px">${rotulo}</div>
      <div class="valor ${cor}" style="font-size:18px">${valor}</div>
    </div>`;
  document.getElementById('cards-relatorio').innerHTML =
    card('Receitas totais', moeda(r.receitas), 'verde') +
    card('Despesas totais', moeda(r.despesas), 'vermelho') +
    card('Saldo', moeda(r.saldo), Number(r.saldo) < 0 ? 'vermelho' : '') +
    card('Maior categoria', maior ? `${escapar(maior.icone)} ${escapar(maior.nome)}` : '—', '');

  const rotulos = r.ultimosMeses.map((m) => m.rotulo.charAt(0).toUpperCase() + m.rotulo.slice(1));
  Graficos.barras(document.getElementById('grafico-barras'), {
    rotulos,
    series: [
      { nome: 'Receitas', cor: '#2BA889', valores: r.ultimosMeses.map((m) => Number(m.receitas)) },
      { nome: 'Despesas', cor: '#E85D5D', valores: r.ultimosMeses.map((m) => Number(m.despesas)), opacidade: 0.85 },
    ],
  });

  Graficos.rosca(document.getElementById('grafico-rosca'), cats, { altura: 200 });
  document.getElementById('barras-pct').innerHTML = cats.map((c) => {
    const pct = Math.round((c.valor / totalCats) * 100);
    return `
      <div>
        <div class="topo-pct">
          <span class="cinza" style="display:flex;align-items:center;gap:6px">
            <span style="width:10px;height:10px;border-radius:50%;background:${escapar(c.cor)}"></span>${escapar(c.nome)}
          </span>
          <strong>${pct}%</strong>
        </div>
        <div class="barra"><div style="width:${pct}%;background:${escapar(c.cor)}"></div></div>
      </div>`;
  }).join('');

  Graficos.linhas(document.getElementById('grafico-saldo'), {
    rotulos,
    altura: 200,
    series: [{ nome: 'Saldo', cor: '#1675A5', valores: r.ultimosMeses.map((m) => Number(m.saldo)), pontos: true, grossura: 2.5 }],
  });

  const mini = (rotulo, valor, sub, cor = '') => `
    <div class="resumo-mini">
      <div class="rotulo">${rotulo}</div>
      <div class="valor ${cor}">${valor}</div>
      <div class="sub">${sub}</div>
    </div>`;
  document.getElementById('resumo-final').innerHTML =
    mini('Total de receitas', moeda(r.receitas), nomeMes(mes), 'verde') +
    mini('Total de despesas', moeda(r.despesas), nomeMes(mes), 'vermelho') +
    mini('Saldo do mês', moeda(r.saldo), nomeMes(mes)) +
    mini('Média mensal (despesas)', moeda(mediaDespesas), 'Últimos 6 meses') +
    mini('Maior categoria de gasto', maior ? escapar(maior.nome) : '—', maior ? moeda(maior.valor) : 'Sem despesas') +
    mini('Menor categoria de gasto', menor ? escapar(menor.nome) : '—', menor ? moeda(menor.valor) : 'Sem despesas');
}

async function exportarCsv() {
  const mes = Mes.obter();
  try {
    const lista = await api(`/movimentacoes?inicio=${mes}-01&fim=${fimDoMes(mes)}`);
    const campo = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const linhas = [
      ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Conta', 'Frequência', 'Observação'].map(campo).join(';'),
      ...lista.map((m) => [
        dataBR(m.data), m.descricao, m.categoriaNome, TIPOS[m.tipo],
        Number(m.valor).toFixed(2).replace('.', ','), m.conta, FREQUENCIAS[m.frequencia], m.observacao,
      ].map(campo).join(';')),
    ];

    const blob = new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sem-aperto-${mes}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch (e) {
    toast(e.message, 'erro');
  }
}

Layout.iniciar().then(() => {
  carregar();
  document.addEventListener('mudou-mes', carregar);
  document.getElementById('btn-csv').addEventListener('click', exportarCsv);
  document.getElementById('btn-pdf').addEventListener('click', () => window.print());
});
