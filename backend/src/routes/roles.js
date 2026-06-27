import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';
import {
  listarRoles, getRoleById, criarRole, editarRole, deletarRole,
  inscreverRole, cancelarInscricao, comentar, getRolesParaMapa
} from '../controllers/roleController.js';

const router = Router();

router.get('/', listarRoles);
router.get('/mapa', getRolesParaMapa);
router.get('/:id', getRoleById);
router.post('/', autenticar, criarRole);
router.put('/:id', autenticar, editarRole);
router.delete('/:id', autenticar, deletarRole);
router.post('/:id/inscrever', autenticar, inscreverRole);
router.delete('/:id/inscrever', autenticar, cancelarInscricao);
router.post('/:id/comentar', autenticar, comentar);

export default router;
