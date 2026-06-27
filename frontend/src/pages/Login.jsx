import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoLogin, setTipoLogin] = useState('usuario');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { loginUsuario, loginEstabelecimento } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (tipoLogin === 'usuario') {
        await loginUsuario(email, senha);
      } else {
        await loginEstabelecimento(email, senha);
      }
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm mt-1">Entre para encontrar seu próximo rolê</p>
        </div>

        <div className="card p-6">
          {/* Toggle tipo */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {['usuario', 'estabelecimento'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoLogin(tipo)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tipoLogin === tipo ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                {tipo === 'usuario' ? '👤 Usuário' : '🏢 Estabelecimento'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="input" placeholder="••••••••" required />
            </div>

            {erro && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{erro}</div>
            )}

            <button type="submit" disabled={carregando} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-primary-600 font-semibold hover:underline">
              Cadastre-se
            </Link>
          </div>

          {/* Dica de demo */}
          <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
            <strong>Demo:</strong> ana@email.com / 123456
          </div>
        </div>
      </div>
    </div>
  );
}
