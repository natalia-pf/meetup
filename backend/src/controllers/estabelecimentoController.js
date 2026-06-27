import { getDb } from '../database/db.js';

export function getPerfil(req, res) {
  const db = getDb();
  const estab = db.prepare('SELECT id, nome, email, endereco, contato, descricao, foto, latitude, longitude FROM estabelecimentos WHERE id = ?').get(req.usuario.id);
  if (!estab) return res.status(404).json({ erro: 'Estabelecimento não encontrado' });
  res.json(estab);
}

export function editarPerfil(req, res) {
  const { nome, endereco, contato, descricao, latitude, longitude } = req.body;
  const db = getDb();

  db.prepare(`
    UPDATE estabelecimentos SET
      nome = COALESCE(?, nome),
      endereco = COALESCE(?, endereco),
      contato = COALESCE(?, contato),
      descricao = COALESCE(?, descricao),
      latitude = COALESCE(?, latitude),
      longitude = COALESCE(?, longitude)
    WHERE id = ?
  `).run(nome, endereco, contato, descricao, latitude, longitude, req.usuario.id);

  const atualizado = db.prepare('SELECT id, nome, email, endereco, contato, descricao, foto FROM estabelecimentos WHERE id = ?').get(req.usuario.id);
  res.json(atualizado);
}

export function criarEvento(req, res) {
  const { nome, descricao, data, horario, limite_participantes } = req.body;

  if (!nome || !data || !horario) {
    return res.status(400).json({ erro: 'Nome, data e horário são obrigatórios' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO eventos (estabelecimento_id, nome, descricao, data, horario, limite_participantes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.usuario.id, nome, descricao || '', data, horario, limite_participantes || 50);

  const evento = db.prepare('SELECT * FROM eventos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(evento);
}

export function listarEventos(req, res) {
  const db = getDb();
  const eventos = db.prepare(`
    SELECT e.*, est.nome as estab_nome, est.endereco as estab_endereco
    FROM eventos e
    JOIN estabelecimentos est ON est.id = e.estabelecimento_id
    ORDER BY e.data ASC
  `).all();
  res.json(eventos);
}

export function meusEventos(req, res) {
  const db = getDb();
  const eventos = db.prepare('SELECT * FROM eventos WHERE estabelecimento_id = ? ORDER BY data ASC').all(req.usuario.id);
  res.json(eventos);
}

export function getInscritos(req, res) {
  const db = getDb();
  const evento = db.prepare('SELECT * FROM eventos WHERE id = ? AND estabelecimento_id = ?').get(req.params.id, req.usuario.id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' });

  const inscritos = db.prepare(`
    SELECT u.id, u.nome, u.foto, u.email, ie.inscrito_em
    FROM inscricoes_eventos ie
    JOIN usuarios u ON u.id = ie.usuario_id
    WHERE ie.evento_id = ?
  `).all(req.params.id);

  res.json({ evento, inscritos });
}

export function inscreverEvento(req, res) {
  const db = getDb();
  const evento = db.prepare('SELECT * FROM eventos WHERE id = ?').get(req.params.id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' });
  if (evento.total_inscritos >= evento.limite_participantes) return res.status(400).json({ erro: 'Evento lotado' });

  try {
    db.prepare('INSERT INTO inscricoes_eventos (evento_id, usuario_id) VALUES (?, ?)').run(req.params.id, req.usuario.id);
    db.prepare('UPDATE eventos SET total_inscritos = total_inscritos + 1 WHERE id = ?').run(req.params.id);
    res.json({ mensagem: 'Inscrito no evento com sucesso' });
  } catch {
    res.status(409).json({ erro: 'Você já está inscrito neste evento' });
  }
}
