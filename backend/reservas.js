const sql = require('mssql');

module.exports = (app, pool, pronto, tratar) => {
  const selecao = `
    SELECT r.Id, r.RecursoId, r.UsuarioId, r.StatusId,
      rc.Codigo, rc.Nome AS Recurso, rc.Tipo, u.Nome AS Usuario, s.Descricao AS Status,
      CONVERT(VARCHAR(10), r.DataInicial, 23) AS DataInicial,
      CONVERT(VARCHAR(10), r.DataFinal, 23) AS DataFinal,
      CONVERT(VARCHAR(5), r.HoraInicial, 108) AS HoraInicial,
      CONVERT(VARCHAR(5), r.HoraFinal, 108) AS HoraFinal
    FROM Reserva r
    JOIN Recurso rc ON rc.Id = r.RecursoId
    JOIN Usuario u ON u.Id = r.UsuarioId
    JOIN Status s ON s.Id = r.StatusId`;

  // datas e horas vão como texto e o sql converte (o driver reclama do formato da hora)
  const binda = (rq, d) => rq
    .input('RecursoId', sql.Int, d.RecursoId)
    .input('UsuarioId', sql.Int, d.UsuarioId)
    .input('StatusId', sql.Int, d.StatusId)
    .input('DataInicial', sql.VarChar(10), d.DataInicial)
    .input('DataFinal', sql.VarChar(10), d.DataFinal)
    .input('HoraInicial', sql.VarChar(8), d.HoraInicial)
    .input('HoraFinal', sql.VarChar(8), d.HoraFinal);

  async function validar(d, id) {
    const obrig = ['RecursoId', 'UsuarioId', 'StatusId', 'DataInicial', 'DataFinal', 'HoraInicial', 'HoraFinal'];
    if (obrig.some(c => !d[c])) throw new Error('Preencha todos os campos da reserva.');
    if (d.DataFinal < d.DataInicial) throw new Error('A data final não pode ser menor que a inicial.');
    if (d.HoraFinal <= d.HoraInicial) throw new Error('A hora final tem que ser maior que a hora inicial.');

    // conflito: mesmo recurso, datas e horários que se cruzam, com reserva ativa
    const rq = binda(pool.request(), d).input('Id', sql.Int, id || 0);
    const r = await rq.query(`
      SELECT TOP 1 r.Id FROM Reserva r JOIN Status s ON s.Id = r.StatusId
      WHERE r.RecursoId = @RecursoId AND r.Id <> @Id
        AND s.Descricao IN ('Reservado', 'Ocupado', 'Bloqueado')
        AND r.DataInicial <= CAST(@DataFinal AS DATE) AND r.DataFinal >= CAST(@DataInicial AS DATE)
        AND r.HoraInicial < CAST(@HoraFinal AS TIME) AND r.HoraFinal > CAST(@HoraInicial AS TIME)`);
    if (r.recordset.length) throw new Error('Esse recurso já está reservado, ocupado ou bloqueado nesse período.');
  }

  app.get('/recursos', tratar(async (req, res) => {
    await pronto;
    res.json((await pool.request().query('SELECT Id, Codigo, Nome, Capacidade, Tipo FROM Recurso ORDER BY Tipo, Nome')).recordset);
  }));

  app.get('/reservas', tratar(async (req, res) => {
    await pronto;
    const q = req.query, rq = pool.request(), w = [];
    if (q.codigo) { rq.input('codigo', sql.VarChar(20), `%${q.codigo}%`); w.push('rc.Codigo LIKE @codigo'); }
    if (q.nome) { rq.input('nome', sql.VarChar(100), `%${q.nome}%`); w.push('rc.Nome LIKE @nome'); }
    if (q.usuario) { rq.input('usuario', sql.VarChar(100), `%${q.usuario}%`); w.push('u.Nome LIKE @usuario'); }
    if (q.statusId) { rq.input('statusId', sql.Int, q.statusId); w.push('r.StatusId = @statusId'); }
    if (q.dataDe) { rq.input('dataDe', sql.VarChar(10), q.dataDe); w.push('r.DataFinal >= CAST(@dataDe AS DATE)'); }
    if (q.dataAte) { rq.input('dataAte', sql.VarChar(10), q.dataAte); w.push('r.DataInicial <= CAST(@dataAte AS DATE)'); }
    if (q.hora) {
      rq.input('hora', sql.VarChar(8), q.hora);
      w.push('r.HoraInicial <= CAST(@hora AS TIME) AND r.HoraFinal > CAST(@hora AS TIME)');
    }
    const where = w.length ? ' WHERE ' + w.join(' AND ') : '';
    res.json((await rq.query(`${selecao}${where} ORDER BY r.DataInicial DESC, r.HoraInicial`)).recordset);
  }));

  app.post('/reservas', tratar(async (req, res) => {
    await pronto;
    const d = req.body;
    await validar(d);
    const out = await binda(pool.request(), d).query(`
      INSERT INTO Reserva (RecursoId, UsuarioId, StatusId, DataInicial, DataFinal, HoraInicial, HoraFinal)
      OUTPUT INSERTED.Id
      VALUES (@RecursoId, @UsuarioId, @StatusId, CAST(@DataInicial AS DATE), CAST(@DataFinal AS DATE),
              CAST(@HoraInicial AS TIME(0)), CAST(@HoraFinal AS TIME(0)))`);
    res.status(201).json({ Id: out.recordset[0].Id });
  }));

  app.put('/reservas/:id', tratar(async (req, res) => {
    await pronto;
    const d = req.body;
    await validar(d, req.params.id);
    await binda(pool.request(), d).input('Id', sql.Int, req.params.id).query(`
      UPDATE Reserva SET RecursoId = @RecursoId, UsuarioId = @UsuarioId, StatusId = @StatusId,
        DataInicial = CAST(@DataInicial AS DATE), DataFinal = CAST(@DataFinal AS DATE),
        HoraInicial = CAST(@HoraInicial AS TIME(0)), HoraFinal = CAST(@HoraFinal AS TIME(0))
      WHERE Id = @Id`);
    res.json({ ok: true });
  }));

  app.delete('/reservas/:id', tratar(async (req, res) => {
    await pronto;
    await pool.request().input('Id', sql.Int, req.params.id).query('DELETE FROM Reserva WHERE Id = @Id');
    res.json({ ok: true });
  }));
};
