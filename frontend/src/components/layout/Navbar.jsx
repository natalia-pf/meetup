import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const categoriaEmoji = { esporte: '🏃', jogos: '🎮', arte: '🎨', bar: '🍺', café: '☕', geral: '✨' };

export default function Navbar() {
  const { usuario, tipo, logout, isLogado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-lg mx-auto px-4">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <span className="text-2xl">🎯</span> MeetUp
          </Link>
          {isLogado && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Olá, {usuario?.nome?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="flex md:hidden items-center justify-around h-16">
          {isLogado ? (
            <>
              <NavItem to="/" icon="🏠" label="Início" active={isActive('/')} />
              <NavItem to="/mapa" icon="🗺️" label="Mapa" active={isActive('/mapa')} />
              {!tipo || tipo === 'usuario' ? (
                <NavItem to="/roles/novo" icon="➕" label="Criar" active={isActive('/roles/novo')} primary />
              ) : null}
              {tipo === 'estabelecimento' ? (
                <NavItem to="/estabelecimento/dashboard" icon="🏢" label="Dashboard" active={isActive('/estabelecimento/dashboard')} />
              ) : (
                <NavItem to="/historico" icon="📋" label="Histórico" active={isActive('/historico')} />
              )}
              <NavItem to="/perfil" icon="👤" label="Perfil" active={isActive('/perfil')} />
            </>
          ) : (
            <>
              <NavItem to="/" icon="🏠" label="Início" active={isActive('/')} />
              <NavItem to="/login" icon="👤" label="Entrar" active={isActive('/login')} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label, active, primary }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
        primary
          ? 'bg-primary-500 text-white -mt-4 shadow-lg px-4 py-2'
          : active
          ? 'text-primary-600'
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
