import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

//SIGNUP 
export const signup = async (req, res) => {
  const { name, alias, email, password, confirmPassword } = req.body;

  try {
    // Validation des champs
    if (!name|| !alias || !email || !password || !confirmPassword) {
      throw new Error("Tous les champs sont obligatoires");
    }
     // Validation du format de l'email avec regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Format d'email invalide" 
      });
    }

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Les mots de passe ne correspondent pas" 
      });
    }

    // Vérification de la longueur du mot de passe
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Le mot de passe doit contenir au moins 8 caractères" 
      });
    }

    // Vérifier si l'email existe déjà
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Un utilisateur avec cet email existe déjà" 
      });
    }

    // Vérifier si l'alias existe déjà
    const aliasAlreadyExists = await User.findOne({ alias });
    if (aliasAlreadyExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Cet alias est déjà utilisé" 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Générer un token de vérification
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Créer le nouvel utilisateur
    const user = new User({
      name,
      alias,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });

    await user.save();

    // Générer JWT et cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//LOGIN 
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error("Tous les champs sont obligatoires");
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Format d'email invalide" 
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Identifiants invalides" });
    }

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Générer JWT et cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      user: {
        _id: user._id,
        nom: user.nom,
        alias: user.alias,
        email: user.email,
        role: user.role,  // ← IMPORTANT : Renvoyer le rôle
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token"); // Supprime le cookie JWT
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
};