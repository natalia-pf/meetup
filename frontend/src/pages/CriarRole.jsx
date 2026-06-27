import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rolesApi } from '../services/api';

const CATEGORIAS = ['esporte', 'jogos', 'arte', 'bar', 'café', 'geral'];

export default function CriarRole() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', descricao: '', categoria: 'geral',
    local: '', latitude: '', longitude: '',
    data: '', horario: '', limite_participantes: 10,
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const payload = { ...form, limite_participantes: Number(form.limite_participantes) };
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);

      const { data } = await rolesApi.criar(payload);
      navigate(`/roles/${data.id}`);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar rolê');
    } finally {
      setCarregando(false);
    }
  }

  function usarLocalizacaoAtual() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-6">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 flex items-center gap-1 mb-3 hover:text-gray-700">
          ← Voltar
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900">Criar rolê 🎉</h1>
        <p className="text-gray-500 text-sm mt-1">Defina os detalhes do seu encontro</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Nome do rolê *">
          <input name="nome" value={form.nome} onChange={handleChange} className="input" placeholder="Ex: Trilha no morro" required />
        </Field>

        <Field label="Descrição">
          <textarea name="descricao" value={form.descricao} onChange={handleChange} className="input min-h-[80px] resize-none" placeholder="Conte mais sobre o rolê..." />
        </Field>

        <Field label="Categoria">
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => (
              <button type="button" key={cat} onClick={() => setForm((f) => ({ ...f, categoria: cat }))}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  form.categoria === cat ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Local *">
          <input name="local" value={form.local} onChange={handleChange} className="input" placeholder="Ex: Parque da Cidade, Joinville" required />
        </Field>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas GPS (opcional)</label>
          <div className="flex gap-2 mb-2">
            <input name="latitude" value={form.latitude} onChange={handleChange} className="input" placeholder="Latitude" />
            <input name="longitude" value={form.longitude} onChange={handleChange} className="input" placeholder="Longitude" />
          </div>
          <button type="button" onClick={usarLocalizacaoAtual} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            📍 Usar minha localização atual
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Data *">
            <input type="date" name="data" value={form.data} onChange={handleChange} className="input" required />
          </Field>
          <Field label="Horário *">
            <input type="time" name="horario" value={form.horario} onChange={handleChange} className="input" required />
          </Field>
        </div>

        <Field label="Limite de participantes">
          <input type="number" name="limite_participantes" value={form.limite_participantes} onChange={handleChange} className="input" min={2} max={200} />
        </Field>

        {erro && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{erro}</div>}

        <button type="submit" disabled={carregando} className="btn-primary w-full py-3 text-base disabled:opacity-60">
          {carregando ? 'Criando...' : '🎉 Criar rolê'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
