import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { estabelecimentosApi } from '../services/api';

export default function EstabelecimentoDashboard() {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novoEvento, setNovoEvento] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', data: '', horario: '', limite_participantes: 50 });
  const [salvando, setSalvando] = useState(false);
  const [inscritosEvento, setInscritosEvento] = useState(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    try {
      const { data } = await estabelecimentosApi.meusEventos();
      setEventos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriarEvento(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const { data } = await estabelecimentosApi.criarEvento({
        ...form, limite_participantes: Number(form.limite_participantes)
      });
      setEventos((ev) => [data, ...ev]);
      setNovoEvento(false);
      setForm({ nome: '', descricao: '', data: '', horario: '', limite_participantes: 50 });
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao criar evento');
    } finally {
      setSalvando(false);
    }
  }

  async function verInscritos(id) {
    try {
      const { data } = await estabelecimentosApi.inscritos(id);
      setInscritosEvento(data);
    } catch (err) {
      alert('Erro ao carregar inscritos');
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard 🏢</h1>
        <p className="text-gray-500 text-sm mt-1">{usuario?.nome}</p>
      </div>

      {/* Criar evento */}
      <button onClick={() => setNovoEvento(!novoEvento)} className="btn-primary w-full py-3 mb-5">
        {novoEvento ? 'Cancelar' : '➕ Criar novo evento'}
      </button>

      {novoEvento && (
        <form onSubmit={handleCriarEvento} className="card p-4 mb-5 space-y-4">
          <h3 className="font-bold text-gray-900">Novo evento</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="input resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
              <input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limite de participantes</label>
            <input type="number" value={form.limite_participantes} onChange={(e) => setForm({ ...form, limite_participantes: e.target.value })} className="input" min={1} />
          </div>
          <button type="submit" disabled={salvando} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {salvando ? 'Criando...' : 'Criar evento'}
          </button>
        </form>
      )}

      {/* Modal inscritos */}
      {inscritosEvento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setInscritosEvento(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Inscritos — {inscritosEvento.evento.nome}</h3>
              <button onClick={() => setInscritosEvento(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            {inscritosEvento.inscritos.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum inscrito ainda</p>
            ) : (
              <div className="space-y-3">
                {inscritosEvento.inscritos.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                      {p.nome[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{p.nome}</div>
                      <div className="text-xs text-gray-500">{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <h2 className="font-bold text-gray-900 mb-3">Meus eventos</h2>

      {carregando ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="card p-4 animate-pulse h-20"></div>)}
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🎪</div>
          <p>Nenhum evento criado ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((ev) => (
            <div key={ev.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{ev.nome}</h3>
                <span className="text-xs text-gray-500">👥 {ev.total_inscritos}/{ev.limite_participantes}</span>
              </div>
              <div className="text-sm text-gray-500 mb-3">📅 {ev.data} às {ev.horario}</div>
              {ev.descricao && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ev.descricao}</p>}
              <button onClick={() => verInscritos(ev.id)} className="text-sm text-primary-600 font-semibold hover:underline">
                Ver inscritos →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
