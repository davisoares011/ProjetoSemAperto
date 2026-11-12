(async function () {
  document.getElementById('rotulo-mes').textContent = `Evolução financeira — ${nomeMes(mesAtualIso())}`;

  try {
    await api('/sessao');
    window.location.href = 'dashboard.html';
    return;
  } catch (e) {
  }

  const form = document.getElementById('form-entrada');
  const erro = document.getElementById('erro');
  const botao = document.getElementById('btn-entrar');
  const campoUser = document.getElementById('username');

  campoUser.addEventListener('input', () => {
    campoUser.value = campoUser.value.replace(/[@\s]/g, '');
  });

  function mostrarErro(msg) {
    erro.textContent = msg;
    erro.classList.remove('oculto');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erro.classList.add('oculto');

    const username = campoUser.value.trim();
    const apelido = document.getElementById('apelido').value.trim();

    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) {
      mostrarErro('O usuário deve ter de 3 a 40 caracteres, sem espaços (letras, números, ponto, _ ou -).');
      campoUser.focus();
      return;
    }
    if (!apelido) {
      mostrarErro('Informe seu nome ou apelido.');
      document.getElementById('apelido').focus();
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Entrando...';
    try {
      await api('/sessao', { method: 'POST', body: { username, apelido } });
      window.location.href = 'dashboard.html';
    } catch (err) {
      mostrarErro(err.message);
      botao.disabled = false;
      botao.textContent = 'Entrar';
    }
  });

  campoUser.focus();
})();
