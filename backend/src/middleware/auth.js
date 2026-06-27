import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("process.env.JWT_SECRET: " + process.env.JWT_SECRET);

    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

export function autenticarEstabelecimento(req, res, next) {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== 'estabelecimento') {
      return res.status(403).json({ erro: 'Acesso restrito a estabelecimentos' });
    }
    next();
  });
}
