import { useState, useEffect } from 'react';
import { usuariosApi } from '../services/api';
import RoleCard from '../components/common/RoleCard';

export default function Historico() {
  const [roles, setRoles] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    usuariosApi.historico()
      .then(({ data }) => setRoles(data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-6">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-5">Meu histórico 📋</h1>

      {carregando ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium">Você ainda não participou de rolês</p>
          <p className="text-sm">Explore a home e encontre algo legal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => <RoleCard key={role.id} role={role} />)}
        </div>
      )}
    </div>
  );
}
