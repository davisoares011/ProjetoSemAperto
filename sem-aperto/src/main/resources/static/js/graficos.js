const Graficos = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const desenhos = new Map();

  function moedaCurta(v) {
    const abs = Math.abs(v);
    if (abs >= 1000) return `R$${(v / 1000).toFixed(abs >= 10000 ? 0 : 1).replace('.', ',')}k`;
    return `R$${Math.round(v)}`;
  }

  function topoBonito(max) {
    if (max <= 0) return 100;
    const potencia = Math.pow(10, Math.floor(Math.log10(max)));
    const passos = [1, 2, 2.5, 5, 10];
    for (const p of passos) {
      if (p * potencia >= max) return p * potencia;
    }
    return 10 * potencia;
  }

  function criarSvg(el, altura) {
    el.innerHTML = '';
    el.classList.add('grafico');
    const largura = Math.max(el.clientWidth, 240);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${largura} ${altura}`);
    svg.setAttribute('height', altura);
    svg.setAttribute('role', 'img');
    el.appendChild(svg);
    return { svg, largura };
  }

  function add(pai, tag, attrs, texto) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (texto !== undefined) n.textContent = texto;
    pai.appendChild(n);
    return n;
  }

  function dica(el) {
    let d = el.querySelector('.dica-grafico');
    if (!d) {
      d = document.createElement('div');
      d.className = 'dica-grafico oculto';
      el.appendChild(d);
    }
    return d;
  }

  function mostrarDica(el, x, y, titulo, linhas) {
    const d = dica(el);
    d.innerHTML = `<b>${escapar(titulo)}</b>` + linhas
      .map((l) => `<div><span style="color:${l.cor}">●</span> ${escapar(l.nome)}: ${moeda(l.valor)}</div>`).join('');
    d.classList.remove('oculto');
    const larg = d.offsetWidth;
    let esquerda = x + 12;
    if (esquerda + larg > el.clientWidth) esquerda = x - larg - 12;
    d.style.left = `${Math.max(0, esquerda)}px`;
    d.style.top = `${Math.max(y - 20, 0)}px`;
  }

  function esconderDica(el) {
    dica(el).classList.add('oculto');
  }

  function eixos(svg, largura, altura, margem, maximo, minimo, linhas = 4) {
    for (let i = 0; i <= linhas; i++) {
      const valor = minimo + ((maximo - minimo) / linhas) * i;
      const y = altura - margem.baixo - ((valor - minimo) / (maximo - minimo)) * (altura - margem.cima - margem.baixo);
      add(svg, 'line', { x1: margem.esq, x2: largura - margem.dir, y1: y, y2: y, class: 'grade' });
      add(svg, 'text', { x: margem.esq - 8, y: y + 4, 'text-anchor': 'end', class: 'eixo' }, moedaCurta(valor));
    }
  }

  function vazio(el, altura) {
    el.innerHTML = `<div class="vazio" style="height:${altura}px;display:flex;align-items:center;justify-content:center">Sem dados neste período.</div>`;
  }

  function caminhoSuave(pontos) {
    if (pontos.length < 2) return `M${pontos[0][0]},${pontos[0][1]}`;
    let d = `M${pontos[0][0]},${pontos[0][1]}`;
    for (let i = 1; i < pontos.length; i++) {
      const [x0, y0] = pontos[i - 1];
      const [x1, y1] = pontos[i];
      const cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return d;
  }

  function linhas(el, { rotulos, series, altura = 220 }) {
    desenhos.set(el, () => linhas(el, { rotulos, series, altura }));
    const todos = series.flatMap((s) => s.valores);
    if (!rotulos.length || todos.every((v) => v === 0)) return vazio(el, altura);

    const { svg, largura } = criarSvg(el, altura);
    const margem = { esq: 56, dir: 12, cima: 10, baixo: 28 };
    const menor = Math.min(0, ...todos);
    const maior = Math.max(0, ...todos);
    const passo = topoBonito((maior - menor) / 4 || 1);
    const minimo = Math.floor(menor / passo) * passo;
    const maximo = Math.max(minimo + passo * 4, Math.ceil(maior / passo) * passo);
    eixos(svg, largura, altura, margem, maximo, minimo, Math.round((maximo - minimo) / passo));

    const areaL = largura - margem.esq - margem.dir;
    const areaA = altura - margem.cima - margem.baixo;
    const x = (i) => margem.esq + (rotulos.length === 1 ? areaL / 2 : (areaL / (rotulos.length - 1)) * i);
    const y = (v) => margem.cima + areaA - ((v - minimo) / (maximo - minimo)) * areaA;

    rotulos.forEach((r, i) => add(svg, 'text', { x: x(i), y: altura - 8, 'text-anchor': 'middle', class: 'eixo' }, r));

    series.forEach((s) => {
      const pts = s.valores.map((v, i) => [x(i), y(v)]);
      add(svg, 'path', {
        d: caminhoSuave(pts), fill: 'none', stroke: s.cor, 'stroke-width': s.grossura || 2,
        'stroke-dasharray': s.tracejado ? '5 5' : 'none',
      });
      if (s.pontos) pts.forEach(([px, py]) => add(svg, 'circle', { cx: px, cy: py, r: 4, fill: s.cor }));
    });

    const marcador = add(svg, 'line', { y1: margem.cima, y2: altura - margem.baixo, stroke: '#CBD5E1', 'stroke-width': 1, visibility: 'hidden' });
    const capa = add(svg, 'rect', { x: margem.esq, y: margem.cima, width: areaL, height: areaA, fill: 'transparent' });
    capa.addEventListener('mousemove', (e) => {
      const caixa = svg.getBoundingClientRect();
      const escala = largura / caixa.width;
      const mx = (e.clientX - caixa.left) * escala;
      let i = rotulos.length === 1 ? 0 : Math.round(((mx - margem.esq) / areaL) * (rotulos.length - 1));
      i = Math.max(0, Math.min(rotulos.length - 1, i));
      marcador.setAttribute('x1', x(i));
      marcador.setAttribute('x2', x(i));
      marcador.setAttribute('visibility', 'visible');
      mostrarDica(el, x(i) / escala, e.clientY - caixa.top, rotulos[i],
        series.map((s) => ({ nome: s.nome, cor: s.cor, valor: s.valores[i] })));
    });
    capa.addEventListener('mouseleave', () => {
      marcador.setAttribute('visibility', 'hidden');
      esconderDica(el);
    });
  }

  function barras(el, { rotulos, series, altura = 220 }) {
    desenhos.set(el, () => barras(el, { rotulos, series, altura }));
    const todos = series.flatMap((s) => s.valores);
    if (!rotulos.length || todos.every((v) => v === 0)) return vazio(el, altura);

    const { svg, largura } = criarSvg(el, altura);
    const margem = { esq: 56, dir: 12, cima: 10, baixo: 28 };
    const maximo = topoBonito(Math.max(...todos));
    eixos(svg, largura, altura, margem, maximo, 0);

    const areaL = largura - margem.esq - margem.dir;
    const areaA = altura - margem.cima - margem.baixo;
    const grupo = areaL / rotulos.length;
    const larguraBarra = Math.min(28, (grupo * 0.7) / series.length);
    const espaco = 4;

    rotulos.forEach((r, i) => {
      const centro = margem.esq + grupo * i + grupo / 2;
      add(svg, 'text', { x: centro, y: altura - 8, 'text-anchor': 'middle', class: 'eixo' }, r);
      const totalL = series.length * larguraBarra + (series.length - 1) * espaco;
      series.forEach((s, j) => {
        const h = (s.valores[i] / maximo) * areaA;
        const bx = centro - totalL / 2 + j * (larguraBarra + espaco);
        const by = margem.cima + areaA - h;
        const raio = Math.min(4, h / 2);
        add(svg, 'path', {
          d: `M${bx},${by + h} V${by + raio} Q${bx},${by} ${bx + raio},${by} H${bx + larguraBarra - raio} Q${bx + larguraBarra},${by} ${bx + larguraBarra},${by + raio} V${by + h} Z`,
          fill: s.cor, opacity: s.opacidade || 1,
        });
      });
      const capa = add(svg, 'rect', { x: margem.esq + grupo * i, y: margem.cima, width: grupo, height: areaA, fill: 'transparent' });
      capa.addEventListener('mousemove', (e) => {
        const caixa = svg.getBoundingClientRect();
        capa.setAttribute('fill', 'rgba(0,0,0,0.03)');
        mostrarDica(el, (centro * caixa.width) / largura, e.clientY - caixa.top, r,
          series.map((s) => ({ nome: s.nome, cor: s.cor, valor: s.valores[i] })));
      });
      capa.addEventListener('mouseleave', () => {
        capa.setAttribute('fill', 'transparent');
        esconderDica(el);
      });
    });
  }

  function rosca(el, itens, { altura = 160, interno = 0.62 } = {}) {
    desenhos.set(el, () => rosca(el, itens, { altura, interno }));
    const total = itens.reduce((s, i) => s + Number(i.valor), 0);
    if (!total) return vazio(el, altura);

    const { svg, largura } = criarSvg(el, altura);
    const cx = largura / 2;
    const cy = altura / 2;
    const rExt = altura / 2 - 4;
    const rInt = rExt * interno;
    let angulo = -Math.PI / 2;

    itens.forEach((item) => {
      const fatia = (Number(item.valor) / total) * Math.PI * 2;
      const fim = angulo + fatia;
      let fatiaEl;
      if (fatia >= Math.PI * 2 - 0.0001) {
        fatiaEl = add(svg, 'circle', { cx, cy, r: (rExt + rInt) / 2, fill: 'none', stroke: item.cor, 'stroke-width': rExt - rInt });
      } else {
        const grande = fatia > Math.PI ? 1 : 0;
        const p = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        fatiaEl = add(svg, 'path', {
          d: `M${p(rExt, angulo)} A${rExt},${rExt} 0 ${grande} 1 ${p(rExt, fim)} L${p(rInt, fim)} A${rInt},${rInt} 0 ${grande} 0 ${p(rInt, angulo)} Z`,
          fill: item.cor, stroke: '#fff', 'stroke-width': 2,
        });
      }
      fatiaEl.addEventListener('mousemove', (e) => {
        const caixa = svg.getBoundingClientRect();
        mostrarDica(el, e.clientX - caixa.left, e.clientY - caixa.top, item.nome,
          [{ nome: `${Math.round((item.valor / total) * 100)}%`, cor: item.cor, valor: item.valor }]);
      });
      fatiaEl.addEventListener('mouseleave', () => esconderDica(el));
      angulo = fim;
    });
  }

  let espera;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => desenhos.forEach((desenhar, el) => {
      if (document.body.contains(el)) desenhar();
    }), 150);
  });

  return { linhas, barras, rosca };
})();
