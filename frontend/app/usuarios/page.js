import Crud from '../../components/Crud';
export default function Page() {
  return <Crud titulo="Cadastro de Usuários" rota="usuarios" campos={[
    { n: 'Cpf', r: 'CPF' }, { n: 'Nome', r: 'Nome completo' }, { n: 'DataNascimento', r: 'Data de nascimento', t: 'date' },
    { n: 'Celular', r: 'Celular' }, { n: 'Email', r: 'E-mail', t: 'email' }, { n: 'Login', r: 'Login' },
    { n: 'Senha', r: 'Senha', t: 'password' }]} />;
}
