import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuariosApi, estabelecimentosApi } from '../services/api';

const INTERESSES = ['trilhas', 'café', 'jogos', 'música', 'arte', 'bar', 'teatro', 'esporte', 'cinema', 'leitura', 'culinária', 'tecnologia'];

export default function Perfil() {
  const { usuario, tipo, logout, atualizarPerfil, isEstabelecimento } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    bio: usuario?.bio || '',
    cidade: usuario?.cidade || '',
    interesses: usuario?.interesses || [],
    endereco: usuario?.endereco || '',
    contato: usuario?.contato || '',
    descricao: usuario?.descricao || '',
  });
  const [salvando, setSalvando] = useState(false);

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-5xl">👤</div>
        <p className="text-gray-600">Você precisa estar logado</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Entrar</button>
      </div>
    );
  }

  function toggleInteresse(interesse) {
    setForm((f) => ({
      ...f,
      interesses: f.interesses.includes(interesse)
        ? f.interesses.filter((i) => i !== interesse)
        : [...f.interesses, interesse],
    }));
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      if (isEstabelecimento) {
        await estabelecimentosApi.editar(form);
      } else {
        await usuariosApi.editar(form);
      }
      await atualizarPerfil();
      setEditando(false);
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-6">
      {/* Avatar e nome */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg mb-3">
          {usuario.nome?.[0]}
        </div>
        <h1 className="text-xl font-extrabold text-gray-900">{usuario.nome}</h1>
        <span className="text-xs text-gray-400 mt-0.5">{tipo === 'estabelecimento' ? '🏢 Estabelecimento' : '👤 Usuário'}</span>
        {usuario.cidade && <span className="text-sm text-gray-500 mt-1">📍 {usuario.cidade}</span>}
      </div>

      {!editando ? (
        /* Modo visualização */
        <div className="space-y-4">
          {usuario.bio && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sobre</h3>
              <p className="text-sm text-gray-700">{usuario.bio}</p>
            </div>
          )}

          {!isEstabelecimento && usuario.interesses?.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Interesses</h3>
              <div className="flex flex-wrap gap-2">
                {usuario.interesses.length > 0 && usuario.interesses?.map((i) => (
                  <span key={i} className="badge bg-primary-50 text-primary-600">{i}</span>
                ))}
              </div>
            </div>
          )}

          {isEstabelecimento && (
            <div className="card p-4 space-y-2">
              {usuario.endereco && <div className="text-sm text-gray-600">📍 {usuario.endereco}</div>}
              {usuario.contato && <div className="text-sm text-gray-600">📞 {usuario.contato}</div>}
            </div>
          )}

          <button onClick={() => setEditando(true)} className="btn-outline w-full py-3">
            ✏️ Editar perfil
          </button>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full py-3 rounded-xl font-semibold text-red-500 border-2 border-red-100 hover:bg-red-50 transition-all"
          >
            Sair da conta
          </button>
        </div>
      ) : (
        /* Modo edição */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input" />
          </div>

          {!isEstabelecimento ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interesses</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESSES.map((i) => (
                    <button type="button" key={i} onClick={() => toggleInteresse(i)}
                      className={`px-3 py-1 rounded-full text-sm border transition-all ${
                        form.interesses.includes(i) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'
                      }`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                <input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input resize-none" rows={3} />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button onClick={() => setEditando(false)} className="btn-outline flex-1 py-3">Cancelar</button>
            <button onClick={handleSalvar} disabled={salvando} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
