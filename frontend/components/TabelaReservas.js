const dataBr = d => d.split('-').reverse().join('/');

export default function TabelaReservas({ lista, onEditar, onExcluir }) {
  if (!lista.length) return <p>Nenhuma reserva encontrada.</p>;
  return (
    <table>
      <thead>
        <tr><th>Recurso</th><th>Usuário</th><th>Período</th><th>Horário</th><th>Status</th>{onEditar && <th>Ações</th>}</tr>
      </thead>
      <tbody>
        {lista.map(r => (
          <tr key={r.Id}>
            <td>{r.Codigo} - {r.Recurso}</td>
            <td>{r.Usuario}</td>
            <td>{dataBr(r.DataInicial)} a {dataBr(r.DataFinal)}</td>
            <td>{r.HoraInicial} às {r.HoraFinal}</td>
            <td><span className={'st ' + r.Status.toLowerCase()}>{r.Status}</span></td>
            {onEditar && (
              <td>
                <button onClick={() => onEditar(r)}>Editar</button>{' '}
                <button className="del" onClick={() => onExcluir(r.Id)}>Excluir</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
