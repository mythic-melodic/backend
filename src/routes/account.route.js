import express from "express";
const router = express.Router();
import accountController from "../controller/AccountController.js";
import tokenMiddleware from '../middlewares/token.middleware.js';
import multer from "multer";
const upload = multer({ dest: 'uploads/' });



router.post("/register", accountController.signup);
router.post("/login", accountController.login);
router.get("/logout", accountController.logout);
router.delete("/delete/:id", accountController.deleteUser);
router.get("/all", accountController.getAllUsers);

router.get('/:id', accountController.getInfo);
router.get('/profile/:id', tokenMiddleware.authenticateToken, accountController.getInfo);
router.put('/:id', upload.single('avatar'), tokenMiddleware.authenticateToken, accountController.updateUser);
router.put('/update-password/:id', tokenMiddleware.authenticateToken, accountController.changePassword);
router.put("/update-balance/:id", accountController.updateBalance);
router.put("/add-to-balance/:id", accountController.addToBalance);

export default router;


