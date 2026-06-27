import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rolesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const categorias = {
  esporte: { emoji: '🏃', cor: 'bg-green-100 text-green-700' },
  jogos: { emoji: '🎮', cor: 'bg-purple-100 text-purple-700' },
  arte: { emoji: '🎨', cor: 'bg-pink-100 text-pink-700' },
  bar: { emoji: '🍺', cor: 'bg-yellow-100 text-yellow-700' },
  café: { emoji: '☕', cor: 'bg-amber-100 text-amber-700' },
  geral: { emoji: '✨', cor: 'bg-blue-100 text-blue-700' },
};

export default function RoleDetalhe() {
  const { id } = useParams();
  const { usuario, isLogado } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [comentario, setComentario] = useState('');
  const [inscrito, setInscrito] = useState(false);
  const [acao, setAcao] = useState(false);

  useEffect(() => {
    carregarRole();
  }, [id]);

  async function carregarRole() {
    try {
      const { data } = await rolesApi.getById(id);
      setRole(data);
      if (usuario) {
        setInscrito(data.participantes?.some((p) => p.id === usuario.id));
      }
    } catch {
      navigate('/');
    } finally {
      setCarregando(false);
    }
  }

  async function handleInscrever() {
    if (!isLogado) return navigate('/login');
    setAcao(true);
    try {
      if (inscrito) {
        await rolesApi.cancelar(id);
        setInscrito(false);
        setRole((r) => ({ ...r, total_inscritos: r.total_inscritos - 1, participantes: r.participantes.filter((p) => p.id !== usuario.id) }));
      } else {
        await rolesApi.inscrever(id);
        setInscrito(true);
        setRole((r) => ({ ...r, total_inscritos: r.total_inscritos + 1, participantes: [...(r.participantes || []), { id: usuario.id, nome: usuario.nome }] }));
      }
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro');
    } finally {
      setAcao(false);
    }
  }

  async function handleComentar(e) {
    e.preventDefault();
    if (!comentario.trim()) return;
    try {
      const { data } = await rolesApi.comentar(id, comentario);
      setRole((r) => ({ ...r, comentarios: [...(r.comentarios || []), data] }));
      setComentario('');
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao comentar');
    }
  }

  if (carregando) return <div className="flex items-center justify-center min-h-screen"><div className="text-4xl animate-bounce">🎯</div></div>;
  if (!role) return null;

  const cat = categorias[role.categoria] || categorias.geral;
  const lotado = role.total_inscritos >= role.limite_participantes;
  const ehCriador = usuario?.id === role.criador_id;

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 pt-8 pb-12">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-white/80 hover:text-white text-sm">
          ← Voltar
        </button>
        <span className={`badge ${cat.cor} mb-3`}>{cat.emoji} {role.categoria}</span>
        <h1 className="text-2xl font-extrabold mb-2">{role.nome}</h1>
        <p className="text-white/80 text-sm">{role.descricao}</p>
      </div>

      <div className="px-4 -mt-6">
        {/* Info card */}
        <div className="card p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon="📅" label="Data" value={new Date(role.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} />
            <InfoItem icon="🕐" label="Horário" value={role.horario} />
            <InfoItem icon="📍" label="Local" value={role.local} className="col-span-2" />
            <InfoItem icon="👥" label="Vagas" value={`${role.total_inscritos}/${role.limite_participantes}`} />
          </div>
        </div>

        {/* Ação */}
        {!ehCriador && (
          <button
            onClick={handleInscrever}
            disabled={acao || (lotado && !inscrito)}
            className={`w-full py-3 rounded-xl font-semibold text-base mb-4 transition-all disabled:opacity-60 ${
              inscrito ? 'bg-red-50 text-red-500 border-2 border-red-200' : lotado ? 'bg-gray-100 text-gray-400' : 'btn-primary'
            }`}
          >
            {acao ? '...' : inscrito ? '✗ Cancelar inscrição' : lotado ? 'Rolê lotado' : '✓ Participar do rolê'}
          </button>
        )}

        {ehCriador && (
          <div className="bg-primary-50 rounded-xl px-4 py-3 mb-4 text-sm text-primary-700 font-medium text-center">
            🎉 Você criou este rolê
          </div>
        )}

        {/* Participantes */}
        <div className="card p-4 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Participantes ({role.participantes?.length || 0})</h3>
          {role.participantes?.length === 0 ? (
            <p className="text-sm text-gray-400">Ninguém inscrito ainda</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {role.participantes?.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                    {p.nome?.[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{p.nome}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comentários */}
        <div className="card p-4 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Comentários ({role.comentarios?.length || 0})</h3>

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {role.comentarios?.length === 0 && (
              <p className="text-sm text-gray-400">Seja o primeiro a comentar!</p>
            )}
            {role.comentarios?.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                  {c.autor_nome?.[0]}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="text-xs font-semibold text-gray-700">{c.autor_nome}</div>
                  <div className="text-sm text-gray-600">{c.texto}</div>
                </div>
              </div>
            ))}
          </div>

          {isLogado && (
            <form onSubmit={handleComentar} className="flex gap-2">
              <input
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="input flex-1 py-2 text-sm"
                placeholder="Escreva um comentário..."
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm shrink-0">Enviar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, className = '' }) {
  return (
    <div className={className}>
      <div className="text-xs text-gray-400 mb-0.5">{icon} {label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}
