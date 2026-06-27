import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import RoleDetalhe from './pages/RoleDetalhe';
import CriarRole from './pages/CriarRole';
import Mapa from './pages/Mapa';
import Perfil from './pages/Perfil';
import Historico from './pages/Historico';
import EstabelecimentoDashboard from './pages/EstabelecimentoDashboard';

function RotaProtegida({ children }) {
  const { isLogado, carregando } = useAuth();
  if (carregando) return <div className="flex items-center justify-center min-h-screen text-4xl">🎯</div>;
  return isLogado ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />
          <div className="md:pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/roles/:id" element={<RoleDetalhe />} />
              <Route path="/mapa" element={<Mapa />} />
              <Route path="/roles/novo" element={<RotaProtegida><CriarRole /></RotaProtegida>} />
              <Route path="/perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
              <Route path="/historico" element={<RotaProtegida><Historico /></RotaProtegida>} />
              <Route path="/estabelecimento/dashboard" element={<RotaProtegida><EstabelecimentoDashboard /></RotaProtegida>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
