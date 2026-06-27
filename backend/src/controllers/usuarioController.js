import { getDb } from '../database/db.js';

export function getPerfil(req, res) {
  const db = getDb();
  const usuario = db.prepare(`
    SELECT id, nome, email, bio, foto, interesses, cidade, data_nascimento, criado_em
    FROM usuarios WHERE id = ?
  `).get(req.usuario.id);

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  usuario.interesses = JSON.parse(usuario.interesses || '[]');
  res.json(usuario);
}

export function getPerfilPublico(req, res) {
  const db = getDb();
  const usuario = db.prepare(`
    SELECT id, nome, bio, foto, interesses, cidade
    FROM usuarios WHERE id = ?
  `).get(req.params.id);

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  usuario.interesses = JSON.parse(usuario.interesses || '[]');
  res.json(usuario);
}

export function editarPerfil(req, res) {
  const { nome, bio, interesses, cidade, latitude, longitude } = req.body;
  const db = getDb();

  db.prepare(`
    UPDATE usuarios SET
      nome = COALESCE(?, nome),
      bio = COALESCE(?, bio),
      interesses = COALESCE(?, interesses),
      cidade = COALESCE(?, cidade),
      latitude = COALESCE(?, latitude),
      longitude = COALESCE(?, longitude)
    WHERE id = ?
  `).run(
    nome || null,
    bio || null,
    interesses ? JSON.stringify(interesses) : null,
    cidade || null,
    latitude || null,
    longitude || null,
    req.usuario.id
  );

  const atualizado = db.prepare('SELECT id, nome, email, bio, foto, interesses, cidade FROM usuarios WHERE id = ?').get(req.usuario.id);
  atualizado.interesses = JSON.parse(atualizado.interesses || '[]');
  res.json(atualizado);
}

export function getHistorico(req, res) {
  const db = getDb();
  const roles = db.prepare(`
    SELECT r.*, u.nome as criador_nome, u.foto as criador_foto
    FROM inscricoes i
    JOIN roles r ON r.id = i.role_id
    JOIN usuarios u ON u.id = r.criador_id
    WHERE i.usuario_id = ?
    ORDER BY r.data DESC
  `).all(req.usuario.id);

  res.json(roles);
}
