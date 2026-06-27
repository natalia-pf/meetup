import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cadastro() {
  const [tipo, setTipo] = useState('usuario');
  const [form, setForm] = useState({ nome: '', email: '', senha: '', data_nascimento: '', endereco: '', contato: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { cadastrarUsuario, cadastrarEstabelecimento } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (tipo === 'usuario') {
        await cadastrarUsuario(form);
      } else {
        await cadastrarEstabelecimento(form);
      }
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Criar conta</h1>
          <p className="text-gray-500 text-sm mt-1">Comece a criar e participar de rolês</p>
        </div>

        <div className="card p-6">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {['usuario', 'estabelecimento'].map((t) => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tipo === t ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>
                {t === 'usuario' ? '👤 Usuário' : '🏢 Estabelecimento'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input name="nome" value={form.nome} onChange={handleChange} className="input" placeholder="Seu nome" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" name="senha" value={form.senha} onChange={handleChange} className="input" placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>

            {tipo === 'usuario' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} className="input" />
              </div>
            )}

            {tipo === 'estabelecimento' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input name="endereco" value={form.endereco} onChange={handleChange} className="input" placeholder="Rua, número, cidade" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                  <input name="contato" value={form.contato} onChange={handleChange} className="input" placeholder="Telefone ou WhatsApp" />
                </div>
              </>
            )}

            {erro && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{erro}</div>}

            <button type="submit" disabled={carregando} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
