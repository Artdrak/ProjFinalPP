# Reserva de Laboratórios e Salas de Aula

Sistema web para reservar laboratórios e salas de aula, feito para o Projeto de Prática Profissional do 2º semestre.

**Tecnologias:** Node.js (Express + mssql), Next.js (React) e SQL Server.

## Entregas

| Entrega | O que tem |
|---|---|
| 1 | Cadastros de usuários, laboratórios, salas e status |
| 2 | Menu principal, reserva de recursos e consulta de reservas |
| 3 | Tela de login e registro de acessos (ainda não feita) |

## O que o sistema faz

- **Cadastros:** usuários, laboratórios, salas e status, com incluir, editar e excluir.
- **Reserva:** escolhe o recurso (laboratório ou sala), o usuário, o status, as datas e os horários.
- **Consulta:** lista as reservas com filtros por código e nome do recurso, usuário, status, período e hora.
- **Menu principal:** atalhos para todas as telas.

## Como rodar

### O que precisa ter instalado
- Node.js
- SQL Server e SSMS

### Passo a passo

1. Baixar o projeto:
   ```
   git clone https://github.com/Artdrak/ProjFinalPP.git
   ```
2. No SSMS, executar na ordem:
   1. `banco/script.sql`
   2. `banco/entrega2.sql`
3. Rodar a API:
   ```
   cd backend
   npm install
   npm start
   ```
   Antes disso, copiar `.env.example` para `.env` e preencher com os dados do seu SQL Server (veja abaixo). A API sobe em http://localhost:3001.
4. Rodar o front, em outro terminal:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Abrir http://localhost:3000.

### Arquivo `.env` do backend

```
DB_SERVER=localhost
DB_NAME=ReservaDB
DB_USER=sa
DB_PASS=sua_senha
```

O arquivo `.env` não vai para o GitHub (está no `.gitignore`).

## Estrutura de pastas

```
banco/
  script.sql          tabelas Usuario, Recurso, Status e LogAcesso
  entrega2.sql        tabela Reserva
backend/
  server.js           servidor, conexão e CRUD dos cadastros
  reservas.js         rotas de reserva e consulta
frontend/
  app/                telas (menu, cadastros, reservas e consulta)
  components/         Crud.js (cadastros) e TabelaReservas.js
  lib/api.js          endereço da API
```

## Banco de dados

| Tabela | Para que serve |
|---|---|
| `Usuario` | dados do usuário, login e senha (guardada com hash bcrypt) |
| `Recurso` | laboratórios e salas, separados pelo campo `Tipo` (L ou S) |
| `Status` | Livre, Reservado, Ocupado e Bloqueado |
| `Reserva` | liga recurso, usuário e status, com datas e horas |
| `LogAcesso` | vai guardar os acessos ao sistema (entrega 3) |

Laboratório e sala têm os mesmos campos (código, nome, capacidade e localização), por isso ficam na mesma tabela.

## Rotas da API

| Rota | Métodos |
|---|---|
| `/usuarios`, `/laboratorios`, `/salas`, `/status` | GET, POST, PUT `/:id`, DELETE `/:id` |
| `/recursos` | GET (laboratórios e salas juntos, usado no select da reserva) |
| `/reservas` | GET, POST, PUT `/:id`, DELETE `/:id` |

Filtros do `GET /reservas` (todos opcionais): `codigo`, `nome`, `usuario`, `statusId`, `dataDe`, `dataAte` e `hora`.

## Regras da reserva

- A data final não pode ser menor que a inicial, e a hora final tem que ser maior que a inicial.
- O horário vale para todos os dias do período. Exemplo: de 10 a 12/11, das 8h às 10h, vale para os três dias.
- Não deixa reservar um recurso que já tenha reserva com status Reservado, Ocupado ou Bloqueado no mesmo período e horário.
- Duas reservas em sequência não conflitam (uma até as 10h e outra a partir das 10h).

## Próximos passos

- Tela de login e registro dos acessos na tabela `LogAcesso` (entrega 3).

## Autores

- Arthur Otero
- Matias Trevisan

## Bibliografia

(colocar aqui os livros, sites, vídeos e ferramentas de IA que foram consultados)
1. Claude code para explicar os erros que obtive durante o processo
2. Gemini para ajudar a fazer o CSS
3. Gemini para saber o que seria interessante colocar no readme