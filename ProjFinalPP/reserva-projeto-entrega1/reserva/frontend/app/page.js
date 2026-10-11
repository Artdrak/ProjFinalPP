import Link from 'next/link';

const itens = [
  { href: '/reservas', titulo: 'Reservar recurso', texto: 'Reservar um laboratório ou sala' },
  { href: '/consulta', titulo: 'Consultar reservas', texto: 'Filtrar por recurso, data, hora, usuário e status' },
  { href: '/usuarios', titulo: 'Usuários', texto: 'Cadastro de usuários' },
  { href: '/laboratorios', titulo: 'Laboratórios', texto: 'Cadastro de laboratórios' },
  { href: '/salas', titulo: 'Salas', texto: 'Cadastro de salas de aula' },
  { href: '/status', titulo: 'Status', texto: 'Cadastro de status' }
];

export default function Home() {
  return (
    <>
      <h1>Reserva de Laboratórios e Salas de Aula</h1>
      <div className="menu">
        {itens.map(i => (
          <Link key={i.href} href={i.href} className="card">
            <strong>{i.titulo}</strong>
            <span>{i.texto}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
