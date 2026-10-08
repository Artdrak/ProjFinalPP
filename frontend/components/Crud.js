'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API || 'http://localhost:3001';

// tela usada por todos os cadastros
export default function Crud({ titulo, rota, campos }) {
  const [lista, setLista] = useState([]);
  const [f, setF] = useState({});
  const [msg, setMsg] = useState('');

  const carregar = async () => setLista(await (await fetch(`${API}/${rota}`)).json());
  useEffect(() => { carregar(); }, []);

  const salvar = async e => {
    e.preventDefault();
    const r = await fetch(`${API}/${rota}${f.Id ? '/' + f.Id : ''}`, {
      method: f.Id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f)
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.erro);
    setMsg('Salvo com sucesso!'); setF({}); carregar();
  };

  const editar = x => {
    const o = { ...x };
    campos.forEach(c => { if (c.t === 'date' && o[c.n]) o[c.n] = o[c.n].slice(0, 10); });
    setF(o); setMsg('');
  };

  const excluir = async id => {
    if (!confirm('Excluir este registro?')) return;
    const r = await fetch(`${API}/${rota}/${id}`, { method: 'DELETE' });
    if (!r.ok) setMsg((await r.json()).erro); else { setMsg('Excluído.'); carregar(); }
  };

  const colunas = campos.filter(c => c.t !== 'password');
  return (
    <>
      <h1>{titulo}</h1>
      <form onSubmit={salvar}>
        {campos.map(c => (
          <label key={c.n}>{c.r}
            <input type={c.t || 'text'} value={f[c.n] ?? ''} onChange={e => setF({ ...f, [c.n]: e.target.value })}
              placeholder={c.t === 'password' && f.Id ? 'vazio = manter senha' : ''} />
          </label>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <button type="submit">{f.Id ? 'Atualizar' : 'Incluir'}</button>
          <button type="button" className="sec" onClick={() => { setF({}); setMsg(''); }}>Limpar</button>
        </div>
      </form>
      <div className="msg">{msg}</div>
      <table>
        <thead><tr>{colunas.map(c => <th key={c.n}>{c.r}</th>)}<th>Ações</th></tr></thead>
        <tbody>
          {lista.map(x => (
            <tr key={x.Id}>
              {colunas.map(c => <td key={c.n}>{c.t === 'date' && x[c.n] ? x[c.n].slice(0, 10) : x[c.n]}</td>)}
              <td><button onClick={() => editar(x)}>Editar</button> <button className="del" onClick={() => excluir(x.Id)}>Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
