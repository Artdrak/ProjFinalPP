import './globals.css';
import Link from 'next/link';
export const metadata = { title: 'Reserva de Laboratórios e Salas' };
export default function Layout({ children }) {
  return (
    <html lang="pt-BR"><body>
      <nav>
        <Link href="/">Início</Link><Link href="/usuarios">Usuários</Link>
        <Link href="/laboratorios">Laboratórios</Link><Link href="/salas">Salas</Link><Link href="/status">Status</Link>
      </nav>
      <main>{children}</main>
    </body></html>
  );
}
