import Crud from '../../components/Crud';
export default function Page() {
  return <Crud titulo="Cadastro de Laboratórios" rota="laboratorios" campos={[
    { n: 'Codigo', r: 'Código' }, { n: 'Nome', r: 'Nome' },
    { n: 'Capacidade', r: 'Capacidade', t: 'number' }, { n: 'Localizacao', r: 'Localização' }]} />;
}
