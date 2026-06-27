import { Router } from 'express';
import {
  cadastrarUsuario, loginUsuario,
  cadastrarEstabelecimento, loginEstabelecimento
} from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /auth/usuario/cadastro:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *               data_nascimento: { type: string }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/usuario/cadastro', cadastrarUsuario);

/**
 * @swagger
 * /auth/usuario/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 */
router.post('/usuario/login', loginUsuario);

router.post('/estabelecimento/cadastro', cadastrarEstabelecimento);
router.post('/estabelecimento/login', loginEstabelecimento);

export default router;
