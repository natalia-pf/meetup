import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usuariosApi, estabelecimentosApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [tipo, setTipo] = useState(null); // 'usuario' | 'estabelecimento'
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('meetup_token');
    const dadosSalvos = localStorage.getItem('meetup_usuario');
    const tipoSalvo = localStorage.getItem('meetup_tipo');

    if (token && dadosSalvos) {
      try {
        setUsuario(JSON.parse(dadosSalvos));
        setTipo(tipoSalvo);
      } catch {
        localStorage.clear();
      }
    }
    setCarregando(false);
  }, []);

  function salvarSessao(token, dados, tipoUsuario) {
    localStorage.setItem('meetup_token', token);
    localStorage.setItem('meetup_usuario', JSON.stringify(dados));
    localStorage.setItem('meetup_tipo', tipoUsuario);
    setUsuario(dados);
    setTipo(tipoUsuario);
  }

  async function loginUsuario(email, senha) {
    const { data } = await authApi.loginUsuario({ email, senha });
    salvarSessao(data.token, data.usuario, 'usuario');
    return data;
  }

  async function loginEstabelecimento(email, senha) {
    const { data } = await authApi.loginEstabelecimento({ email, senha });
    salvarSessao(data.token, data.estabelecimento, 'estabelecimento');
    return data;
  }

  async function cadastrarUsuario(dados) {
    const { data } = await authApi.cadastrarUsuario(dados);
    salvarSessao(data.token, data.usuario, 'usuario');
    return data;
  }

  async function cadastrarEstabelecimento(dados) {
    const { data } = await authApi.cadastrarEstabelecimento(dados);
    salvarSessao(data.token, data.estabelecimento, 'estabelecimento');
    return data;
  }

  async function atualizarPerfil() {
    if (tipo === 'usuario') {
      const { data } = await usuariosApi.me();
      setUsuario(data);
      localStorage.setItem('meetup_usuario', JSON.stringify(data));
    } else {
      const { data } = await estabelecimentosApi.me();
      setUsuario(data);
      localStorage.setItem('meetup_usuario', JSON.stringify(data));
    }
  }

  function logout() {
    localStorage.removeItem('meetup_token');
    localStorage.removeItem('meetup_usuario');
    localStorage.removeItem('meetup_tipo');
    setUsuario(null);
    setTipo(null);
  }

  return (
    <AuthContext.Provider value={{
      usuario, tipo, carregando,
      loginUsuario, loginEstabelecimento,
      cadastrarUsuario, cadastrarEstabelecimento,
      atualizarPerfil, logout,
      isLogado: !!usuario,
      isEstabelecimento: tipo === 'estabelecimento',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
