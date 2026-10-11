'use client';
import { useEffect, useState } from 'react';
import { API } from '../../lib/api';
import TabelaReservas from '../../components/TabelaReservas';

const vazio = { RecursoId: '', UsuarioId: '', StatusId: '', DataInicial: '', DataFinal: '', HoraInicial: '', HoraFinal: '' };

export default function Reservas() {
  const [recursos, setRecursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState([]);
  const [lista, setLista] = useState([]);
  const [f, setF] = useState(vazio);
  const [msg, setMsg] = useState({ texto: '', erro: false });

  const get = async rota => {
    const r = await fetch(`${API}/${rota}`);
    return r.ok ? r.json() : [];
  };
  const carregar = async () => setLista(await get('reservas'));

  useEffect(() => {
    (async () => {
      setRecursos(await get('recursos'));
      setUsuarios(await get('usuarios'));
      setStatus(await get('status'));
      carregar();
    })();
  }, []);

  // se não escolher status, usa Reservado
  const padrao = status.find(s => s.Descricao === 'Reservado')?.Id ?? '';
  const muda = e => setF({ ...f, [e.target.name]: e.target.value });

  const salvar = async e => {
    e.preventDefault();
    const dados = { ...f, StatusId: f.StatusId || padrao };
    const r = await fetch(`${API}/reservas${f.Id ? '/' + f.Id : ''}`, {
      method: f.Id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const d = await r.json();
    if (!r.ok) return setMsg({ texto: d.erro, erro: true });
    setMsg({ texto: 'Reserva salva!', erro: false });
    setF(vazio);
    carregar();
  };

  const editar = r => {
    setF(r);
    setMsg({ texto: '', erro: false });
    window.scrollTo(0, 0);
  };

  const excluir = async id => {
    if (!confirm('Excluir esta reserva?')) return;
    const r = await fetch(`${API}/reservas/${id}`, { method: 'DELETE' });
    if (r.ok) carregar();
  };

  return (
    <>
      <h1>Reserva de Laboratórios e Salas</h1>
      <form onSubmit={salvar}>
        <label>Recurso
          <select name="RecursoId" value={f.RecursoId} onChange={muda} required>
            <option value="">Selecione</option>
            <optgroup label="Laboratórios">
              {recursos.filter(x => x.Tipo === 'L').map(x => <option key={x.Id} value={x.Id}>{x.Codigo} - {x.Nome}</option>)}
            </optgroup>
            <optgroup label="Salas">
              {recursos.filter(x => x.Tipo === 'S').map(x => <option key={x.Id} value={x.Id}>{x.Codigo} - {x.Nome}</option>)}
            </optgroup>
          </select>
        </label>
        <label>Usuário
          <select name="UsuarioId" value={f.UsuarioId} onChange={muda} required>
            <option value="">Selecione</option>
            {usuarios.map(u => <option key={u.Id} value={u.Id}>{u.Nome}</option>)}
          </select>
        </label>
        <label>Status
          <select name="StatusId" value={f.StatusId || padrao} onChange={muda}>
            {status.map(s => <option key={s.Id} value={s.Id}>{s.Descricao}</option>)}
          </select>
        </label>
        <label>Data inicial<input type="date" name="DataInicial" value={f.DataInicial} onChange={muda} required /></label>
        <label>Data final<input type="date" name="DataFinal" value={f.DataFinal} onChange={muda} required /></label>
        <label>Hora inicial<input type="time" name="HoraInicial" value={f.HoraInicial} onChange={muda} required /></label>
        <label>Hora final<input type="time" name="HoraFinal" value={f.HoraFinal} onChange={muda} required /></label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <button type="submit">{f.Id ? 'Atualizar' : 'Reservar'}</button>
          <button type="button" className="sec" onClick={() => { setF(vazio); setMsg({ texto: '', erro: false }); }}>Limpar</button>
        </div>
      </form>
      <div className={'msg' + (msg.erro ? ' erro' : '')}>{msg.texto}</div>
      <TabelaReservas lista={lista} onEditar={editar} onExcluir={excluir} />
    </>
  );
}
