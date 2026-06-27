import { Router } from 'express';
import { autenticar, autenticarEstabelecimento } from '../middleware/auth.js';
import {
  getPerfil, editarPerfil, criarEvento, listarEventos,
  meusEventos, getInscritos, inscreverEvento
} from '../controllers/estabelecimentoController.js';

const router = Router();

router.get('/me', autenticarEstabelecimento, getPerfil);
router.put('/me', autenticarEstabelecimento, editarPerfil);
router.post('/eventos', autenticarEstabelecimento, criarEvento);
router.get('/eventos', listarEventos);
router.get('/meus-eventos', autenticarEstabelecimento, meusEventos);
router.get('/eventos/:id/inscritos', autenticarEstabelecimento, getInscritos);
router.post('/eventos/:id/inscrever', autenticar, inscreverEvento);

export default router;
