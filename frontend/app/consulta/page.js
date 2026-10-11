'use client';
import { useEffect, useState } from 'react';
import { API } from '../../lib/api';
import TabelaReservas from '../../components/TabelaReservas';

const vazio = { codigo: '', nome: '', usuario: '', statusId: '', dataDe: '', dataAte: '', hora: '' };

export default function Consulta() {
  const [filtro, setFiltro] = useState(vazio);
  const [status, setStatus] = useState([]);
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');

  const buscar = async f => {
    const params = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    const r = await fetch(`${API}/reservas?${params}`);
    if (!r.ok) return setErro('Não foi possível consultar as reservas.');
    setErro('');
    setLista(await r.json());
  };

  useEffect(() => {
    buscar(vazio);
    fetch(`${API}/status`).then(r => r.json()).then(setStatus);
  }, []);

  const muda = e => setFiltro({ ...filtro, [e.target.name]: e.target.value });

  return (
    <>
      <h1>Consulta de Reservas</h1>
      <form onSubmit={e => { e.preventDefault(); buscar(filtro); }}>
        <label>Código do recurso<input name="codigo" value={filtro.codigo} onChange={muda} /></label>
        <label>Nome do recurso<input name="nome" value={filtro.nome} onChange={muda} /></label>
        <label>Usuário<input name="usuario" value={filtro.usuario} onChange={muda} /></label>
        <label>Status
          <select name="statusId" value={filtro.statusId} onChange={muda}>
            <option value="">Todos</option>
            {status.map(s => <option key={s.Id} value={s.Id}>{s.Descricao}</option>)}
          </select>
        </label>
        <label>Data (de)<input type="date" name="dataDe" value={filtro.dataDe} onChange={muda} /></label>
        <label>Data (até)<input type="date" name="dataAte" value={filtro.dataAte} onChange={muda} /></label>
        <label>Hora<input type="time" name="hora" value={filtro.hora} onChange={muda} /></label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <button type="submit">Consultar</button>
          <button type="button" className="sec" onClick={() => { setFiltro(vazio); buscar(vazio); }}>Limpar</button>
        </div>
      </form>
      {erro && <div className="msg erro">{erro}</div>}
      <TabelaReservas lista={lista} />
    </>
  );
}
