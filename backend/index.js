import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config();

//Création d'une instance de l'application Express
const app = express();

// Si le fichier .env contient une variable PORT, on l’utilise, sinon on prend 5000 par défaut
const PORT=process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000", // URL de votre frontend React
  credentials: true, // Important pour les cookies JWT
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//  Middleware pour analyser le JSON dans les requêtes entrantes
app.use(express.json());//transforme le texte JSON envoyé par Postman en objet JavaScript utilisable


app.use("/api/auth", authRoutes);//Déclaration des routes d'authentification

// Démarrage du serveur sur le port défini
app.listen(5000,()=>{
 
  connectDB();//Connexion à la base de données MongoDB quand le serveur démarre
  console.log(`Server is running on port ${PORT}`);
})