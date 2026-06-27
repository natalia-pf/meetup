import bcrypt from 'bcryptjs';
import { initDb, getDb } from './db.js';

async function seed() {
  initDb();
  const db = getDb();

  console.log('🌱 Populando banco de dados...');

  const senhaHash = await bcrypt.hash('123456', 10);

  // Usuários
  const usuarios = [
    { nome: 'Ana Silva', email: 'ana@email.com', data_nascimento: '1998-05-12', bio: 'Adoro trilhas e cafés!', interesses: JSON.stringify(['trilhas', 'café', 'leitura']), cidade: 'Joinville' },
    { nome: 'Bruno Costa', email: 'bruno@email.com', data_nascimento: '1995-08-20', bio: 'Gosto de jogos e música.', interesses: JSON.stringify(['jogos', 'música', 'bar']), cidade: 'Joinville' },
    { nome: 'Carla Melo', email: 'carla@email.com', data_nascimento: '2000-01-30', bio: 'Apaixonada por arte e cultura.', interesses: JSON.stringify(['arte', 'museu', 'teatro']), cidade: 'Joinville' },
  ];

  const insertUsuario = db.prepare(`
    INSERT OR IGNORE INTO usuarios (nome, email, senha, data_nascimento, bio, interesses, cidade)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of usuarios) {
    insertUsuario.run(u.nome, u.email, senhaHash, u.data_nascimento, u.bio, u.interesses, u.cidade);
  }

  // Estabelecimentos
  const insertEstab = db.prepare(`
    INSERT OR IGNORE INTO estabelecimentos (nome, email, senha, endereco, contato, descricao, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEstab.run(
    'Bar do Zé', 'bardo@email.com', senhaHash,
    'Rua das Flores, 123, Joinville', '(47) 99999-0001',
    'O melhor bar da cidade com música ao vivo toda sexta!',
    -26.3044, -48.8487
  );

  insertEstab.run(
    'Café Arte', 'cafearte@email.com', senhaHash,
    'Av. Brasil, 456, Joinville', '(47) 99999-0002',
    'Café aconchegante com exposições mensais.',
    -26.3100, -48.8450
  );

  // Roles
  const user1 = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('ana@email.com');
  const user2 = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('bruno@email.com');

  const insertRole = db.prepare(`
    INSERT OR IGNORE INTO roles (nome, descricao, categoria, local, latitude, longitude, data, horario, limite_participantes, criador_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  if (user1) {
    insertRole.run(
      'Trilha no Morro', 'Vamos fazer uma trilha leve no morro da cidade. Nível iniciante!',
      'esporte', 'Morro do Boa Vista, Joinville', -26.2800, -48.8300,
      '2026-07-15', '07:30', 8, user1.id
    );
  }

  if (user2) {
    insertRole.run(
      'Noite de Board Games', 'Reunião casual para jogar board games. Traga seu jogo favorito!',
      'jogos', 'Café Central, R. XV de Novembro, 200', -26.3050, -48.8490,
      '2026-07-20', '19:00', 6, user2.id
    );
    insertRole.run(
      'Grupo de Corrida', 'Corrida leve pela orla. Todos os níveis são bem-vindos.',
      'esporte', 'Parque da Cidade, Joinville', -26.3150, -48.8550,
      '2026-07-25', '06:30', 15, user2.id
    );
  }

  console.log('✅ Seed concluído!');
  console.log('👤 Usuários: ana@email.com, bruno@email.com, carla@email.com (senha: 123456)');
  console.log('🏢 Estabelecimentos: bardo@email.com, cafearte@email.com (senha: 123456)');
  process.exit(0);
}

seed().catch(console.error);
