# Sem Aperto

Sistema de controle de despesas pessoais feito em Java com Spring Boot. É um projeto só: o mesmo app serve a API e as telas (HTML, CSS e JavaScript puro), então não precisa de Node, React nem nada do Figma.

## O que precisa ter instalado

- Java 21
- MySQL 8 rodando na porta 3306
- Uma IDE com Maven (IntelliJ, Eclipse ou VS Code com o Extension Pack for Java). Se preferir terminal, o Maven 3.9+.

## Como rodar

1. Abra `src/main/resources/application.properties` e coloque o usuário e a senha do seu MySQL:

   ```properties
   spring.datasource.username=root
   spring.datasource.password=root
   ```

2. Rode a classe `SemApertoApplication` pela IDE, ou no terminal:

   ```bash
   mvn spring-boot:run
   ```

3. Acesse http://localhost:8080

Na primeira vez o Spring cria o banco `sem_aperto`, as tabelas (pelo `schema.sql`) e um usuário de exemplo com alguns meses de dados. Pra ver o sistema já preenchido, entre com o usuário **joao**. Qualquer outro nome de usuário cria uma conta nova e vazia (só com as categorias padrão).

## Como funciona a entrada

Não tem senha. A pessoa digita o nome de usuário e como quer ser chamada:

- se o usuário já existe, entra nele (e atualiza o apelido);
- se não existe, a conta é criada na hora.

Quem entrou fica guardado na sessão do servidor (cookie `JSESSIONID`). Todas as rotas `/api/**`, menos `/api/sessao`, passam pelo `SessaoInterceptor`, que devolve 401 se ninguém tiver entrado.

## Estrutura

```
src/main/java/br/com/semaperto
├── config/        interceptor da sessão e dados de exemplo
├── controller/    endpoints REST e tratamento de erros
├── dto/           objetos que entram e saem da API (records)
├── model/         entidades JPA
├── repository/    acesso ao banco (Spring Data JPA)
└── service/       regras de negócio

src/main/resources
├── application.properties
├── schema.sql     tabelas do banco
└── static/        telas (index.html é a entrada)

banco/sem_aperto.sql   script completo do banco, com consultas de exemplo
```

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/sessao` | Entra no sistema (`username`, `apelido`) |
| GET | `/api/sessao` | Mostra quem está logado |
| DELETE | `/api/sessao` | Sai |
| GET, POST | `/api/categorias` | Lista e cria categorias |
| PUT, DELETE | `/api/categorias/{id}` | Edita e exclui |
| GET, POST | `/api/movimentacoes` | Lista (opcional `?inicio=&fim=`) e cria |
| GET, PUT, DELETE | `/api/movimentacoes/{id}` | Busca, edita e exclui |
| GET, POST | `/api/limites` | Lista do mês (`?mes=AAAA-MM`) e define limite |
| DELETE | `/api/limites/{id}` | Remove limite |
| GET | `/api/dashboard?mes=AAAA-MM` | Números do dashboard |
| GET | `/api/relatorios?mes=AAAA-MM` | Dados dos relatórios |

## Algumas decisões

- Valores em dinheiro usam `BigDecimal` no Java e `DECIMAL(14,2)` no banco, pra não perder centavos.
- O Hibernate não cria nem altera tabelas (`ddl-auto=none`). Quem manda na estrutura é o `schema.sql`, que usa `CREATE TABLE IF NOT EXISTS` e por isso não apaga nada quando o app reinicia.
- Os gráficos são SVG feitos à mão em `static/js/graficos.js`, sem biblioteca externa.
- "Exportar PDF" abre a impressão do navegador (é só escolher "Salvar como PDF"). "Exportar CSV" baixa as movimentações do mês num arquivo que abre no Excel.

## Problemas comuns

- **`Access denied for user 'root'`**: usuário ou senha do MySQL errados no `application.properties`.
- **`Communications link failure`**: o MySQL não está rodando, ou está em outra porta.
- **Porta 8080 ocupada**: mude `server.port` no `application.properties`.
- **Quero zerar tudo**: no MySQL, rode `DROP DATABASE sem_aperto;` e suba o app de novo.
