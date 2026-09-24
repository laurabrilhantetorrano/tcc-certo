import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Inicio from './Inicio';
import Login from './Login';
import Cadastro from './Cadastro';
import Produto from './Produto';
import Carrinho from './Carrinho';
import { CarrinhoProvider } from './CarrinhoContext';
import SobreNos from './SobreNos';
import Contato from './Contato';
import Footer from './Footer';

function FooterCondicional() {
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/cadastro"
  ) {
    return null;
  }

  return <Footer />;
}

function App() {
  return (
    <CarrinhoProvider>
      <BrowserRouter>
        <Routes>

          {/* Página inicial */}
          <Route path="/" element={<Inicio />} />

          {/* Página de login */}
          <Route path="/login" element={<Login />} />

          {/* Página de cadastro */}
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Página do produto */}
          <Route path="/produto/:id" element={<Produto />} />

          {/* Página do carrinho */}
          <Route path="/carrinho" element={<Carrinho />} />

          {/* Página Sobre Nós */}
          <Route path="/sobre-nos" element={<SobreNos />} />

          {/* Página de contato */}
          <Route path="/contato" element={<Contato />} />

        </Routes>

        <FooterCondicional />

      </BrowserRouter>
    </CarrinhoProvider>
  );
}

export default App;