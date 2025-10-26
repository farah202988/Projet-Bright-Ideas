import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Accueil = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les infos utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    // Si c'est un admin, le rediriger vers le dashboard admin
    if (userData.role === 'admin') {
      navigate('/admin');
      return;
    }

    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bright Ideas</h1>
            <p className="text-sm text-gray-500">Where ideas meet innovation</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-4xl font-serif mb-4">
            Bienvenue, <span className="text-purple-600">{user.nom}</span> 🎉
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Partagez vos idées brillantes avec la communauté !
          </p>
          <div className="flex gap-4">
            <div className="p-4 bg-purple-50 rounded-lg flex-1">
              <p className="text-sm text-gray-600">Alias</p>
              <p className="text-xl font-bold text-gray-900">@{user.alias}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg flex-1">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-xl font-bold text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">Mes Idées</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">Likes Reçus</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-semibold">Commentaires</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Create New Idea Button */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-xl p-12 text-center text-white mb-8">
          <h3 className="text-3xl font-bold mb-4">Partagez votre idée brillante</h3>
          <p className="text-lg mb-6 opacity-90">
            Inspirez la communauté avec vos concepts innovants
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
            + Créer une nouvelle idée
          </button>
        </div>

        {/* Recent Ideas Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold mb-6">Idées Récentes</h3>
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">Aucune idée pour le moment.</p>
            <p className="text-sm">Soyez le premier à partager une idée brillante !</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Accueil;