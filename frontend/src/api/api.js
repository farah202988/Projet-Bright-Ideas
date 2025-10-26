// src/api/api.js

// Configuration de l'URL de base de votre API backend
const API_BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Fonction pour l'inscription d'un nouvel utilisateur
 * @param {Object} userData - Les données de l'utilisateur
 * @param {string} userData.name - Nom complet
 * @param {string} userData.alias - Nom d'utilisateur unique
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mot de passe
 * @param {string} userData.confirmPassword - Confirmation du mot de passe
 * @returns {Promise<Object>} Réponse du serveur avec les données utilisateur
 */
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour les cookies JWT
      body: JSON.stringify({
        name: userData.name,
        alias: userData.alias,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      }),
    });

    const data = await response.json();

    // Si la réponse n'est pas OK, lancer une erreur avec le message du serveur
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    return data;
  } catch (error) {
    console.error('❌ Erreur API signup:', error);
    throw error;
  }
};

/**
 * Fonction pour la connexion d'un utilisateur
 * @param {Object} credentials - Les identifiants de connexion
 * @param {string} credentials.email - Email de l'utilisateur
 * @param {string} credentials.password - Mot de passe
 * @returns {Promise<Object>} Réponse du serveur avec les données utilisateur
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour les cookies JWT
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });

    const data = await response.json();

    // Si la réponse n'est pas OK, lancer une erreur avec le message du serveur
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }

    return data;
  } catch (error) {
    console.error('❌ Erreur API login:', error);
    throw error;
  }
};

/**
 * Fonction pour la déconnexion d'un utilisateur
 * Supprime le cookie JWT côté serveur
 * @returns {Promise<Object>} Réponse du serveur confirmant la déconnexion
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include', // Important pour envoyer le cookie
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la déconnexion');
    }

    return data;
  } catch (error) {
    console.error('❌ Erreur API logout:', error);
    throw error;
  }
};