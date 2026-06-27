import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';
import { getPerfil, getPerfilPublico, editarPerfil, getHistorico } from '../controllers/usuarioController.js';

const router = Router();

router.get('/me', autenticar, getPerfil);
router.put('/me', autenticar, editarPerfil);
router.get('/historico', autenticar, getHistorico);
router.get('/:id', getPerfilPublico);

export default router;
