import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'meetup.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      data_nascimento TEXT,
      bio TEXT DEFAULT '',
      interesses TEXT DEFAULT '[]',
      foto TEXT DEFAULT NULL,
      latitude REAL DEFAULT NULL,
      longitude REAL DEFAULT NULL,
      cidade TEXT DEFAULT NULL,
      tipo TEXT DEFAULT 'usuario',
      criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS estabelecimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      endereco TEXT,
      contato TEXT,
      descricao TEXT DEFAULT '',
      foto TEXT DEFAULT NULL,
      latitude REAL DEFAULT NULL,
      longitude REAL DEFAULT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      local TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      limite_participantes INTEGER DEFAULT 10,
      total_inscritos INTEGER DEFAULT 0,
      criador_id INTEGER NOT NULL,
      estabelecimento_id INTEGER DEFAULT NULL,
      criado_em TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (criador_id) REFERENCES usuarios(id),
      FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
    );

    CREATE TABLE IF NOT EXISTS inscricoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      inscrito_em TEXT DEFAULT (datetime('now')),
      UNIQUE(role_id, usuario_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      texto TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estabelecimento_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      limite_participantes INTEGER DEFAULT 50,
      total_inscritos INTEGER DEFAULT 0,
      criado_em TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
    );

    CREATE TABLE IF NOT EXISTS inscricoes_eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evento_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      inscrito_em TEXT DEFAULT (datetime('now')),
      UNIQUE(evento_id, usuario_id),
      FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  console.log('✅ Banco de dados inicializado com sucesso');
  return db;
}

export default getDb;
