
---

# 📘 Gerenciador de Eventos – API REST (Spring Boot)

API RESTful desenvolvida para gerenciamento de **eventos**, **participantes**, **locais**, **categorias** e **inscrições**, permitindo operações de CRUD completas.
Projeto criado como requisito para a disciplina de Desenvolvimento Web Back-End.

---

## 📝 Descrição do Projeto

Este projeto implementa uma API REST utilizando **Spring Boot**, seguindo arquitetura em camadas (Controller, Service, Repository) e com persistência de dados via **Spring Data JPA** e **MySQL**.
O sistema permite cadastrar e gerenciar:

* Eventos
* Participantes
* Locais
* Categorias
* Inscrições com status e código de ingresso

A API utiliza validações com **Bean Validation**, versionamento de rotas (`/api/v1`) e tratamento global de erros.

---

## 🚀 Tecnologias Utilizadas

* **Java 17**
* **Spring Boot**
* Spring Web
* Spring Data JPA
* MySQL
* Lombok
* Jakarta Validation (Bean Validation)
* Maven

---

## ▶️ Como Executar o Projeto

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
```

### 2️⃣ Criar o banco de dados MySQL

Execute o script SQL abaixo (ou use o arquivo `.sql` incluso no repositório).

### 3️⃣ Configurar o `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gerenciador_eventos?useSSL=false&serverTimezone=UTC
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
```

### 4️⃣ Rodar o projeto

```bash
mvn spring-boot:run
```

API iniciará em:

```
http://localhost:8080/api/v1
```

---

# 🗄 Script SQL – Criação do Banco de Dados

Este é o script original enviado no dump do phpMyAdmin (MariaDB), utilizado pela aplicação:


```sql
CREATE DATABASE IF NOT EXISTS `gerenciador_eventos`;
USE `gerenciador_eventos`;

CREATE TABLE `categorias` (
  `id` bigint(20) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `categorias` (`id`, `nome`) VALUES
(1, 'Workshops');

CREATE TABLE `eventos` (
  `id` bigint(20) NOT NULL,
  `data_hora` datetime(6) NOT NULL,
  `descricao` text DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `local_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `eventos` (`id`, `data_hora`, `descricao`, `nome`, `categoria_id`, `local_id`) VALUES
(1, '2025-11-22 19:00:00.000000', 'isso', 'Ryoukai meet', 1, 2),
(2, '2025-11-22 05:10:00.000000', 'asdasd', 'asda', 1, 1);

CREATE TABLE `inscricoes` (
  `id` bigint(20) NOT NULL,
  `codigo_ingresso` varchar(255) NOT NULL,
  `data_inscricao` datetime(6) NOT NULL,
  `status` enum('PENDENTE','CONFIRMADO','CANCELADO') NOT NULL,
  `evento_id` bigint(20) NOT NULL,
  `participante_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `locais` (
  `id` bigint(20) NOT NULL,
  `capacidade` int(11) DEFAULT NULL,
  `endereco` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `locais` (`id`, `capacidade`, `endereco`, `nome`) VALUES
(1, 200, 'Rua das Flores, 123 - Bloco A', 'Auditório Central'),
(2, 231, 'aqui emcasa', 'Aqui em casa');

CREATE TABLE `participantes` (
  `id` bigint(20) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `data_nascimento` date NOT NULL,
  `email` varchar(255) NOT NULL,
  `genero` enum('FEMININO','MASCULINO','NAO_BINARIO','OUTRO','PREFIRO_NAO_INFORMAR') NOT NULL,
  `nome` varchar(255) NOT NULL,
  `telefone` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `participantes` (`id`, `cpf`, `data_nascimento`, `email`, `genero`, `nome`, `telefone`) VALUES
(2, '11111111111', '2025-11-13', '1231@g.com', 'FEMININO', '12', '4444444'),
(3, '12345678997', '2025-08-05', 'email@gmail.com', 'MASCULINO', 'Alexcandre', '44987885256');

ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_9qte5svl2i6n82lpdyyheoi1h` (`nome`);

ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_categoria` (`categoria_id`),
  ADD KEY `FK_local` (`local_id`);

ALTER TABLE `inscricoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_codigo_ingresso` (`codigo_ingresso`),
  ADD KEY `FK_evento` (`evento_id`),
  ADD KEY `FK_participante` (`participante_id`);

ALTER TABLE `locais`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `participantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_cpf` (`cpf`),
  ADD UNIQUE KEY `UK_email` (`email`);

ALTER TABLE `eventos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `inscricoes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `locais`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `participantes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `eventos`
  ADD CONSTRAINT `FK_evento_local` FOREIGN KEY (`local_id`) REFERENCES `locais` (`id`),
  ADD CONSTRAINT `FK_evento_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

ALTER TABLE `inscricoes`
  ADD CONSTRAINT `FK_inscricao_participante` FOREIGN KEY (`participante_id`) REFERENCES `participantes` (`id`),
  ADD CONSTRAINT `FK_inscricao_evento` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`);
```

---
# ✅ Testes para executar no Postman

> Base URL: `http://localhost:8080/api/`

---

## 1) CATEGORIAS

### Create Category

* Método: `POST /categorias`
* Body (JSON):

```json
{
  "nome": "Workshops"
}
```

* Esperado: `201 Created` (ou `200`)
* Checar: resposta possui `id` e `nome`.

### List Categories

* `GET /categorias`
* Esperado: `200` e um array com a categoria criada.

---

## 2) LOCAIS

### Create Local

* `POST /locais`
* Body:

```json
{
  "nome": "Auditório Central",
  "endereco": "Rua das Flores, 123",
  "capacidade": 200
}
```

* Esperado: `201` com `id`.

### List Locals

* `GET /locais` → `200` e array.

---

## 3) PARTICIPANTES

### Create Participant (válido)

* `POST /participantes`
* Body:

```json
{
  "nome": "Alexandre",
  "email": "alex@example.com",
  "cpf": "12345678901",
  "dataNascimento": "1995-01-01",
  "genero": "MASCULINO",
  "telefone": "44999999999"
}
```

* Esperado: `201` com `id`.

### Validation test (erro)

* `POST /participantes` com body sem `email`:

```json
{
  "nome": "Sem Email",
  "cpf": "22222222222",
  "dataNascimento": "1990-01-01",
  "genero": "FEMININO"
}
```

* Esperado: `400 Bad Request` com JSON de erros por campo.

---

## 4) EVENTOS (usa ids de categoria e local)

### Create Event

* `POST /eventos`
* Body exemplo (substituir `categoria.id` e `local.id` pelos ids criados):

```json
{
  "nome": "Workshop de Spring",
  "descricao": "Introdução ao Spring Boot",
  "dataHora": "2025-12-10T14:00:00",
  "categoria": { "id": 1 },
  "local": { "id": 1 }
}
```

* Esperado: `201` com `id`.

### List Events

* `GET /eventos` → `200` array.

### Get Event by ID

* `GET /eventos/{id}` → `200` com o objeto do evento.

### Update Event

* `PUT /eventos/{id}`
* Body (ex: atualiza `nome` e `dataHora`):

```json
{
  "nome": "Workshop Spring - Atualizado",
  "descricao": "Conteúdo atualizado",
  "dataHora": "2025-12-11T14:00:00",
  "categoria": { "id": 1 },
  "local": { "id": 1 }
}
```

* Esperado: `200` com evento atualizado.

### Delete Event

* `DELETE /eventos/{id}` → `204 No Content` (ou `200`) e em seguida `GET /eventos/{id}` → `404`.

---

## 5) INSCRIÇÕES

* Cria inscrição vinculando participante e evento:

### Create Inscricao

* `POST /inscricoes`
* Body:

```json
{
  "participante": { "id": 1 },
  "evento": { "id": 1 }
}
```

* Esperado: `201` com `id`, `codigoIngresso`, `status` (PENDENTE), `dataInscricao`.

### List Inscricoes

* `GET /inscricoes` → `200`.

### Update Inscricao (status)

* `PUT /inscricoes/{id}`
* Body para confirmar:

```json
{
  "status": "CONFIRMADO"
}
```

* Esperado: `200` com `status` atualizado.

### Delete Inscricao

* `DELETE /inscricoes/{id}` → `204` e `GET` deve retornar `404`.

---
