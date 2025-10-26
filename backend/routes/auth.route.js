import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// Routes d'authentification
router.post("/signup", signup);   // POST pour créer un nouvel utilisateur
router.post("/login", login);     // POST pour se connecter
router.post("/logout", logout);   // POST pour se déconnecter

export default router;
