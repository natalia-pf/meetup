import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rolesApi } from '../services/api';
import RoleCard from '../components/common/RoleCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = ['todos', 'esporte', 'jogos', 'arte', 'bar', 'café', 'geral'];

export default function Home() {
  const { isLogado, usuario } = useAuth();
  const [roles, setRoles] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState('todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    buscarRoles();
  }, [categoria, busca]);

  async function buscarRoles() {
    setCarregando(true);
    try {
      const params = {};
      if (categoria !== 'todos') params.categoria = categoria;
      if (busca) params.busca = busca;
      const { data } = await rolesApi.listar(params);
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-4">
      {/* Header */}
      <div className="mb-5">
        {isLogado ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {usuario?.nome?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">O que vai rolar hoje?</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">MeetUp</h1>
            <p className="text-gray-500 mb-4">Encontre pessoas e crie rolês incríveis</p>
            <div className="flex gap-3 justify-center">
              <Link to="/cadastro" className="btn-primary">Criar conta</Link>
              <Link to="/login" className="btn-outline">Entrar</Link>
            </div>
          </div>
        )}
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Buscar rolê..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              categoria === cat
                ? 'bg-primary-500 text-white shadow'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Botão criar */}
      {isLogado && (
        <Link to="/roles/novo" className="flex items-center gap-3 card p-4 mb-5 border-dashed border-2 border-primary-200 hover:border-primary-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl">➕</div>
          <div>
            <div className="font-semibold text-primary-600">Criar novo rolê</div>
            <div className="text-xs text-gray-400">Convide pessoas para algo legal</div>
          </div>
        </Link>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🤷</div>
          <p className="font-medium">Nenhum rolê encontrado</p>
          <p className="text-sm">Seja o primeiro a criar um!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => <RoleCard key={role.id} role={role} />)}
        </div>
      )}
    </div>
  );
}
