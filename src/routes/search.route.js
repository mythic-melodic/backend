import express from "express";
const router = express.Router();
import SearchController from "../controller/SearchController";

router.get("/all", SearchController.getAllSearches);

export default router;