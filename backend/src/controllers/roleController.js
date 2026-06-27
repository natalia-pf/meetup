import { getDb } from '../database/db.js';

export function listarRoles(req, res) {
  const db = getDb();
  const { categoria, busca } = req.query;

  let query = `
    SELECT r.*, u.nome as criador_nome, u.foto as criador_foto
    FROM roles r
    JOIN usuarios u ON u.id = r.criador_id
    WHERE 1=1
  `;
  const params = [];

  if (categoria) {
    query += ' AND r.categoria = ?';
    params.push(categoria);
  }

  if (busca) {
    query += ' AND (r.nome LIKE ? OR r.descricao LIKE ? OR r.local LIKE ?)';
    const termo = `%${busca}%`;
    params.push(termo, termo, termo);
  }

  query += ' ORDER BY r.data ASC';

  const roles = db.prepare(query).all(...params);
  res.json(roles);
}

export function getRoleById(req, res) {
  const db = getDb();
  const role = db.prepare(`
    SELECT r.*, u.nome as criador_nome, u.foto as criador_foto, u.bio as criador_bio
    FROM roles r
    JOIN usuarios u ON u.id = r.criador_id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!role) return res.status(404).json({ erro: 'Rolê não encontrado' });

  // Participantes
  role.participantes = db.prepare(`
    SELECT u.id, u.nome, u.foto
    FROM inscricoes i JOIN usuarios u ON u.id = i.usuario_id
    WHERE i.role_id = ?
  `).all(req.params.id);

  // Comentários
  role.comentarios = db.prepare(`
    SELECT c.*, u.nome as autor_nome, u.foto as autor_foto
    FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.role_id = ?
    ORDER BY c.criado_em ASC
  `).all(req.params.id);

  res.json(role);
}

export function criarRole(req, res) {
  const { nome, descricao, categoria, local, latitude, longitude, data, horario, limite_participantes } = req.body;

  if (!nome || !local || !data || !horario) {
    return res.status(400).json({ erro: 'Nome, local, data e horário são obrigatórios' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO roles (nome, descricao, categoria, local, latitude, longitude, data, horario, limite_participantes, criador_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(nome, descricao || '', categoria || 'geral', local, latitude || null, longitude || null, data, horario, limite_participantes || 10, req.usuario.id);

  // Criador já entra inscrito
  db.prepare('INSERT OR IGNORE INTO inscricoes (role_id, usuario_id) VALUES (?, ?)').run(result.lastInsertRowid, req.usuario.id);
  db.prepare('UPDATE roles SET total_inscritos = 1 WHERE id = ?').run(result.lastInsertRowid);

  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(role);
}

export function editarRole(req, res) {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);

  if (!role) return res.status(404).json({ erro: 'Rolê não encontrado' });
  if (role.criador_id !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });

  const { nome, descricao, categoria, local, latitude, longitude, data, horario, limite_participantes } = req.body;

  db.prepare(`
    UPDATE roles SET
      nome = COALESCE(?, nome),
      descricao = COALESCE(?, descricao),
      categoria = COALESCE(?, categoria),
      local = COALESCE(?, local),
      latitude = COALESCE(?, latitude),
      longitude = COALESCE(?, longitude),
      data = COALESCE(?, data),
      horario = COALESCE(?, horario),
      limite_participantes = COALESCE(?, limite_participantes)
    WHERE id = ?
  `).run(nome, descricao, categoria, local, latitude, longitude, data, horario, limite_participantes, req.params.id);

  const atualizado = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  res.json(atualizado);
}

export function deletarRole(req, res) {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);

  if (!role) return res.status(404).json({ erro: 'Rolê não encontrado' });
  if (role.criador_id !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });

  db.prepare('DELETE FROM roles WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Rolê deletado com sucesso' });
}

export function inscreverRole(req, res) {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);

  if (!role) return res.status(404).json({ erro: 'Rolê não encontrado' });
  if (role.total_inscritos >= role.limite_participantes) {
    return res.status(400).json({ erro: 'Rolê lotado' });
  }

  try {
    db.prepare('INSERT INTO inscricoes (role_id, usuario_id) VALUES (?, ?)').run(req.params.id, req.usuario.id);
    db.prepare('UPDATE roles SET total_inscritos = total_inscritos + 1 WHERE id = ?').run(req.params.id);
    res.json({ mensagem: 'Inscrição realizada com sucesso' });
  } catch {
    res.status(409).json({ erro: 'Você já está inscrito neste rolê' });
  }
}

export function cancelarInscricao(req, res) {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);

  if (!role) return res.status(404).json({ erro: 'Rolê não encontrado' });
  if (role.criador_id === req.usuario.id) {
    return res.status(400).json({ erro: 'O criador não pode cancelar a própria inscrição' });
  }

  const result = db.prepare('DELETE FROM inscricoes WHERE role_id = ? AND usuario_id = ?').run(req.params.id, req.usuario.id);
  if (result.changes === 0) return res.status(404).json({ erro: 'Inscrição não encontrada' });

  db.prepare('UPDATE roles SET total_inscritos = total_inscritos - 1 WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Inscrição cancelada' });
}

export function comentar(req, res) {
  const { texto } = req.body;
  if (!texto || !texto.trim()) return res.status(400).json({ erro: 'Comentário não pode ser vazio' });

  const db = getDb();
  const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(req.params.id);
  if (!role) return res.status(404).json({ erro: 'Rolê não encontrado' });

  const result = db.prepare('INSERT INTO comentarios (role_id, usuario_id, texto) VALUES (?, ?, ?)').run(req.params.id, req.usuario.id, texto.trim());

  const comentario = db.prepare(`
    SELECT c.*, u.nome as autor_nome, u.foto as autor_foto
    FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(comentario);
}

export function getRolesParaMapa(req, res) {
  const db = getDb();
  const roles = db.prepare(`
    SELECT id, nome, local, latitude, longitude, data, horario, categoria, total_inscritos, limite_participantes
    FROM roles
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    ORDER BY data ASC
  `).all();
  res.json(roles);
}
