import driveController from "../controller/DriveController.js";
import express from "express";
const router = express.Router();

import multer from "multer";
const upload = multer({ dest: 'uploads/' });
router.post("/upload", upload.single('file'), driveController.upload); 
// router.post("/download", downloadFile);
// router.post("/delete", deleteFile);
// router.get("/list", getAllFiles);
//
router.get('/load-file', (req, res) => {
    res.sendFile('upload.html', { root: 'D:/Github/MythicProject/backend/src/templates' });
});



export default router;