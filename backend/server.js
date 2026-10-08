require('dotenv').config();
const express = require('express'), cors = require('cors'), sql = require('mssql'), bcrypt = require('bcryptjs');
const app = express();
app.use(cors(), express.json());

const pool = new sql.ConnectionPool({
  server: process.env.DB_SERVER || 'localhost', database: process.env.DB_NAME || 'ReservaDB',
  user: process.env.DB_USER, password: process.env.DB_PASS,
  options: { encrypt: false, trustServerCertificate: true }
});
const pronto = pool.connect();

// 2627 e 2601 = valor duplicado, 547 = chave estrangeira
const tratar = fn => (req, res) => fn(req, res).catch(e => {
  const msgs = { 2627: 'Já existe registro com esse valor único.', 2601: 'Já existe registro com esse valor único.', 547: 'Registro em uso; não pode ser excluído.' };
  res.status(400).json({ erro: msgs[e.number] || e.message });
});

// monta get, post, put e delete de cada tabela
function crud(rota, { tabela, campos, listar, obrig = [], fixo = {}, manter = [], antes = async d => d }) {
  const r = express.Router();
  const cs = Object.keys(campos);
  const bind = (rq, d) => cs.forEach(c => rq.input(c, campos[c], d[c] ?? null));
  const prepara = async body => ({ ...(await antes(body)), ...fixo });

  r.get('/', tratar(async (req, res) => {
    await pronto;
    const rq = pool.request();
    const w = Object.entries(fixo).map(([c, v], i) => (rq.input('f' + i, v), `${c}=@f${i}`)).join(' AND ');
    res.json((await rq.query(`SELECT ${listar} FROM ${tabela} ${w ? 'WHERE ' + w : ''} ORDER BY Id`)).recordset);
  }));

  r.post('/', tratar(async (req, res) => {
    await pronto;
    const d = await prepara(req.body);
    obrig.forEach(c => { if (!d[c]) throw new Error(`O campo ${c} é obrigatório.`); });
    const rq = pool.request(); bind(rq, d);
    const out = await rq.query(`INSERT INTO ${tabela}(${cs}) OUTPUT INSERTED.Id VALUES(${cs.map(c => '@' + c)})`);
    res.status(201).json({ Id: out.recordset[0].Id });
  }));

  r.put('/:id', tratar(async (req, res) => {
    await pronto;
    const d = await prepara(req.body);
    const rq = pool.request(); bind(rq, d); rq.input('Id', sql.Int, req.params.id);
    const set = cs.map(c => manter.includes(c) ? `${c}=COALESCE(@${c},${c})` : `${c}=@${c}`);
    await rq.query(`UPDATE ${tabela} SET ${set} WHERE Id=@Id`);
    res.json({ ok: true });
  }));

  r.delete('/:id', tratar(async (req, res) => {
    await pronto;
    await pool.request().input('Id', sql.Int, req.params.id).query(`DELETE FROM ${tabela} WHERE Id=@Id`);
    res.json({ ok: true });
  }));

  app.use('/' + rota, r);
}

crud('usuarios', {
  tabela: 'Usuario',
  campos: { Cpf: sql.Char(11), Nome: sql.VarChar(100), DataNascimento: sql.Date, Celular: sql.VarChar(15),
            Email: sql.VarChar(100), Login: sql.VarChar(30), SenhaHash: sql.VarChar(100) },
  listar: 'Id,Cpf,Nome,DataNascimento,Celular,Email,Login,DataCadastro,DataUltimoAcesso',
  obrig: ['Cpf', 'Nome', 'DataNascimento', 'Email', 'Login', 'SenhaHash'],
  manter: ['SenhaHash'], // sem senha nova na edição, continua a antiga
  antes: async d => ({ ...d, Cpf: (d.Cpf || '').replace(/\D/g, ''), SenhaHash: d.Senha ? await bcrypt.hash(d.Senha, 10) : null })
});

const recurso = { tabela: 'Recurso', listar: '*', obrig: ['Codigo', 'Nome', 'Capacidade'],
  campos: { Codigo: sql.VarChar(20), Nome: sql.VarChar(100), Capacidade: sql.Int, Localizacao: sql.VarChar(100), Tipo: sql.Char(1) } };
crud('laboratorios', { ...recurso, fixo: { Tipo: 'L' } });
crud('salas', { ...recurso, fixo: { Tipo: 'S' } });
crud('status', { tabela: 'Status', campos: { Descricao: sql.VarChar(30) }, listar: '*', obrig: ['Descricao'] });

app.listen(3001, () => console.log('API rodando em http://localhost:3001'));
