import Crud from '../../components/Crud';
export default function Page() {
  return <Crud titulo="Cadastro de Status" rota="status" campos={[{ n: 'Descricao', r: 'Descrição' }]} />;
}
