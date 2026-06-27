import { Link } from 'react-router-dom';

const categorias = {
  esporte: { emoji: '🏃', cor: 'bg-green-100 text-green-700' },
  jogos: { emoji: '🎮', cor: 'bg-purple-100 text-purple-700' },
  arte: { emoji: '🎨', cor: 'bg-pink-100 text-pink-700' },
  bar: { emoji: '🍺', cor: 'bg-yellow-100 text-yellow-700' },
  café: { emoji: '☕', cor: 'bg-amber-100 text-amber-700' },
  geral: { emoji: '✨', cor: 'bg-blue-100 text-blue-700' },
};

export default function RoleCard({ role }) {
  const cat = categorias[role.categoria] || categorias.geral;
  const lotado = role.total_inscritos >= role.limite_participantes;

  const dataFormatada = new Date(role.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short'
  });

  return (
    <Link to={`/roles/${role.id}`} className="card hover:shadow-md transition-shadow block">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`badge ${cat.cor} shrink-0`}>{cat.emoji} {role.categoria || 'geral'}</span>
            {lotado && <span className="badge bg-red-100 text-red-600 shrink-0">Lotado</span>}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-semibold text-primary-600">{dataFormatada}</div>
            <div className="text-xs text-gray-500">{role.horario}</div>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 truncate">{role.nome}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{role.descricao}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>📍</span>
            <span className="truncate max-w-[180px]">{role.local}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
            <span>👥</span>
            <span>{role.total_inscritos}/{role.limite_participantes}</span>
          </div>
        </div>

        {role.criador_nome && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
              {role.criador_nome?.[0]}
            </div>
            <span className="text-xs text-gray-500">{role.criador_nome}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
