import express from 'express';
const router = express.Router();
import accountController from '../controller/AccountController.js';

import tokenMiddleware from '../middlewares/token.middleware.js';

router.post('/register', accountController.signup );
router.post('/login', accountController.login);
router.get('/logout', accountController.logout);
router.get('/info', accountController.getInfo);

export default router;