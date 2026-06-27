import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/db.js';

function gerarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ========== USUÁRIO ==========

export async function cadastrarUsuario(req, res) {
  const { nome, email, senha, data_nascimento } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const db = getDb();
    const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existente) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const result = db.prepare(`
      INSERT INTO usuarios (nome, email, senha, data_nascimento) VALUES (?, ?, ?, ?)
    `).run(nome, email, hash, data_nascimento || null);

    const token = gerarToken({ id: result.lastInsertRowid, tipo: 'usuario' });
    const usuario = db.prepare('SELECT id, nome, email, bio, foto, interesses, cidade FROM usuarios WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ token, usuario });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário', detalhes: err.message });
  }
}

export async function loginUsuario(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  }

  try {
    const db = getDb();
    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken({ id: usuario.id, tipo: 'usuario' });
    const { senha: _, ...dados } = usuario;
    dados.interesses = JSON.parse(dados.interesses || '[]');

    res.json({ token, usuario: dados });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no login', detalhes: err.message });
  }
}

// ========== ESTABELECIMENTO ==========

export async function cadastrarEstabelecimento(req, res) {
  const { nome, email, senha, endereco, contato, descricao } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const db = getDb();
    const existente = db.prepare('SELECT id FROM estabelecimentos WHERE email = ?').get(email);
    if (existente) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const result = db.prepare(`
      INSERT INTO estabelecimentos (nome, email, senha, endereco, contato, descricao) VALUES (?, ?, ?, ?, ?, ?)
    `).run(nome, email, hash, endereco || null, contato || null, descricao || null);

    const token = gerarToken({ id: result.lastInsertRowid, tipo: 'estabelecimento' });
    const estab = db.prepare('SELECT id, nome, email, endereco, contato, descricao, foto FROM estabelecimentos WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ token, estabelecimento: estab });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar estabelecimento', detalhes: err.message });
  }
}

export async function loginEstabelecimento(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  }

  try {
    const db = getDb();
    const estab = db.prepare('SELECT * FROM estabelecimentos WHERE email = ?').get(email);
    if (!estab) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaOk = await bcrypt.compare(senha, estab.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken({ id: estab.id, tipo: 'estabelecimento' });
    const { senha: _, ...dados } = estab;

    res.json({ token, estabelecimento: dados });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no login', detalhes: err.message });
  }
}
