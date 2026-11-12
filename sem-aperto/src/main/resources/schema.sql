CREATE TABLE IF NOT EXISTS usuarios (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    username   VARCHAR(40)  NOT NULL,
    apelido    VARCHAR(60)  NOT NULL,
    criado_em  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_username UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS categorias (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(80)  NOT NULL,
    tipo        VARCHAR(10)  NOT NULL,
    cor         VARCHAR(16)  NOT NULL,
    icone       VARCHAR(16)  NOT NULL,
    usuario_id  BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_categorias_usuario_nome UNIQUE (usuario_id, nome),
    CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
    id           BIGINT          NOT NULL AUTO_INCREMENT,
    descricao    VARCHAR(140)    NOT NULL,
    valor        DECIMAL(14, 2)  NOT NULL,
    data         DATE            NOT NULL,
    tipo         VARCHAR(10)     NOT NULL,
    conta        VARCHAR(80)     NOT NULL,
    observacao   VARCHAR(500),
    frequencia   VARCHAR(10)     NOT NULL,
    categoria_id BIGINT          NOT NULL,
    usuario_id   BIGINT          NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_movimentacoes_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id),
    CONSTRAINT fk_movimentacoes_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS limites (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    valor         DECIMAL(14, 2)  NOT NULL,
    mes_referencia VARCHAR(7)     NOT NULL,
    categoria_id  BIGINT          NOT NULL,
    usuario_id    BIGINT          NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_limites UNIQUE (usuario_id, categoria_id, mes_referencia),
    CONSTRAINT fk_limites_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id),
    CONSTRAINT fk_limites_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios (id)
);
