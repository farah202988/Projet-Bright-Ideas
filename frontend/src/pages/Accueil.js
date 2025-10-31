import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Accueil = () => {
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState('');
  const [showLikedBy, setShowLikedBy] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [editText, setEditText] = useState('');
  const [userStats, setUserStats] = useState({ idees: 0, likes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    if (userData.role === 'admin') {
      navigate('/admin');
      return;
    }

    setUser(userData);
    
    const storedIdeas = localStorage.getItem('ideas');
    if (storedIdeas) {
      setIdeas(JSON.parse(storedIdeas));
    }
  }, [navigate]);

  useEffect(() => {
    if (user && ideas.length > 0) {
      const userIdeas = ideas.filter(idea => idea.authorId === user._id || idea.authorId === user.id);
      const totalLikes = userIdeas.reduce((sum, idea) => sum + idea.likes, 0);
      setUserStats({ idees: userIdeas.length, likes: totalLikes });
    }
  }, [user, ideas]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;

    const idea = {
      id: Date.now(),
      content: newIdea,
      author: user.name || user.nom,
      alias: user.alias,
      authorId: user._id || user.id,
      email: user.email,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };

    const updatedIdeas = [idea, ...ideas];
    setIdeas(updatedIdeas);
    localStorage.setItem('ideas', JSON.stringify(updatedIdeas));
    setNewIdea('');
  };

  const handleLike = (id) => {
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === id && !idea.likedBy.includes(user.email)) {
        return {
          ...idea,
          likes: idea.likes + 1,
          likedBy: [...idea.likedBy, user.email]
        };
      }
      return idea;
    });
    setIdeas(updatedIdeas);
    localStorage.setItem('ideas', JSON.stringify(updatedIdeas));
  };

  const handleDelete = (id) => {
    const updatedIdeas = ideas.filter(idea => idea.id !== id);
    setIdeas(updatedIdeas);
    localStorage.setItem('ideas', JSON.stringify(updatedIdeas));
  };

  const handleEditIdea = (idea) => {
    setEditingIdea(idea.id);
    setEditText(idea.content);
  };

  const handleSaveEdit = (id) => {
    const updatedIdeas = ideas.map(idea => 
      idea.id === id ? { ...idea, content: editText } : idea
    );
    setIdeas(updatedIdeas);
    localStorage.setItem('ideas', JSON.stringify(updatedIdeas));
    setEditingIdea(null);
    setEditText('');
  };

  const userIdeas = ideas.filter(idea => idea.authorId === (user?._id || user?.id));
  const sortedIdeas = [...ideas].sort((a, b) => b.likes - a.likes);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              💡
            </div>
            <span className="font-semibold text-gray-900">Bright Ideas</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 text-xl">🔔</button>
            <button className="text-gray-600 hover:text-gray-900 text-xl">📌</button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
            >
              <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {(user.name || user.nom || '?').charAt(0).toUpperCase()}
              </span>
              {user.alias}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Gauche - Profil */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sticky top-24 text-center cursor-pointer hover:shadow-lg transition" onClick={() => setShowProfileModal(true)}>
              {/* Cover Image */}
              <div className="w-full h-24 bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 rounded-2xl mb-4"></div>

              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto -mt-8 mb-4 border-4 border-white">
                {(user.name || user.nom || '?').charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <h3 className="font-bold text-gray-900 text-lg">{user.name || user.nom}</h3>
              <p className="text-gray-500 text-sm mb-6">@{user.alias}</p>

              {/* Stats en ligne */}
              <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-200 pb-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">{userStats.idees}</p>
                  <p className="text-xs text-gray-500">Postes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{userStats.likes}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
              </div>

              {/* Button */}
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition">
                Mon Profil
              </button>
            </div>
          </aside>

          {/* Centre - Feed */}
          <main className="lg:col-span-2">
            {/* Create Idea */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                  {(user.name || user.nom || '?').charAt(0).toUpperCase()}
                </div>
                <textarea
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  placeholder="Qu'avez-vous en tête ?"
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  rows="1"
                />
              </div>
              <div className="flex gap-3 mt-3 px-3 text-gray-500 text-sm border-b border-gray-200 pb-3">
                <button className="hover:text-blue-500">🖼️ Image/Vidéo</button>
                <button className="hover:text-blue-500">📎 Attachment</button>
                <button className="hover:text-blue-500">🔴 Live</button>
                <button className="hover:text-blue-500">#️⃣ Hashtag</button>
                <button className="hover:text-blue-500">@️ Mention</button>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddIdea}
                  disabled={!newIdea.trim()}
                  className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Partager l'idée
                </button>
              </div>
            </div>

            {/* Ideas Feed */}
            <div className="space-y-4">
              {sortedIdeas.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">Aucune idée pour le moment.</p>
                  <p className="text-gray-400 text-sm">Soyez le premier à partager une idée brillante !</p>
                </div>
              ) : (
                sortedIdeas.map(idea => (
                  <div key={idea.id} className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-gray-300 transition">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(idea.author || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{idea.author}</h4>
                            <span className="text-gray-500 text-sm">@{idea.alias}</span>
                          </div>
                          <p className="text-xs text-gray-500">{idea.createdAt}</p>
                        </div>
                      </div>
                      {idea.authorId === (user._id || user.id) && (
                        <button
                          onClick={() => handleDelete(idea.id)}
                          className="text-gray-400 hover:text-red-500 text-lg"
                        >
                          ⋮
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-gray-900 mb-3 text-sm leading-relaxed">{idea.content}</p>

                    {/* Actions */}
                    <div className="flex gap-6 pt-3 text-gray-500 text-sm border-t border-gray-100">
                      <button
                        onClick={() => handleLike(idea.id)}
                        disabled={idea.likedBy.includes(user.email)}
                        className={`flex items-center gap-2 hover:text-red-500 transition ${
                          idea.likedBy.includes(user.email) ? 'text-red-500' : ''
                        } disabled:cursor-not-allowed`}
                      >
                        <span className="text-lg">❤️</span>
                        <span>{idea.likes}</span>
                      </button>

                      {idea.likedBy.length > 0 && (
                        <button
                          onClick={() => setShowLikedBy(showLikedBy === idea.id ? null : idea.id)}
                          className="flex items-center gap-2 hover:text-blue-500 transition"
                        >
                          <span className="text-lg">👁️</span>
                          <span>Voir</span>
                        </button>
                      )}
                    </div>

                    {/* Liked By */}
                    {showLikedBy === idea.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Aimé par:</p>
                        <div className="space-y-1">
                          {idea.likedBy.map((email, idx) => (
                            <div key={idx} className="text-xs text-gray-600">👤 {email}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </main>

          {/* Sidebar Droit */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <p className="text-gray-500 text-sm text-center">Contenu futur</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                <p className="text-gray-400 text-sm">View all your profile details here.</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-3xl text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Left Column - User Info */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-5xl border-4 border-gray-700 mb-6">
                      {(user.name || user.nom || '?').charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center">{user.name || user.nom}</h2>
                    <p className="text-green-400 text-sm mb-4">Premium User</p>
                  </div>

                  {/* User Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400">@</span>
                      <div>
                        <p className="text-xs text-gray-500">Alias</p>
                        <p className="text-white font-medium">@{user.alias}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-400">📧</span>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-white font-medium break-all">{user.email}</p>
                      </div>
                    </div>
                    {user.address && (
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400">📍</span>
                        <div>
                          <p className="text-xs text-gray-500">Adresse</p>
                          <p className="text-white font-medium">{user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{userStats.idees}</p>
                      <p className="text-xs text-gray-400">Postes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{userStats.likes}</p>
                      <p className="text-xs text-gray-400">Likes</p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    🚪 Déconnexion
                  </button>
                </div>

                {/* Right Column - Stats Details */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Statistiques</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300 text-sm">Idées Publiées</p>
                      <p className="text-3xl font-bold text-blue-400 mt-2">{userStats.idees}</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300 text-sm">Likes Reçus</p>
                      <p className="text-3xl font-bold text-pink-400 mt-2">{userStats.likes}</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300 text-sm">Moyenne de Likes</p>
                      <p className="text-3xl font-bold text-green-400 mt-2">
                        {userStats.idees > 0 ? (userStats.likes / userStats.idees).toFixed(1) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Ideas Section */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Mes Idées ({userIdeas.length})</h3>
                
                {userIdeas.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Vous n'avez pas encore posté d'idée</p>
                ) : (
                  <div className="space-y-4">
                    {userIdeas.map(idea => (
                      <div key={idea.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition">
                        {editingIdea === idea.id ? (
                          <div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(idea.id)}
                                className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition text-sm"
                              >
                                ✓ Enregistrer
                              </button>
                              <button
                                onClick={() => setEditingIdea(null)}
                                className="flex-1 bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-500 transition text-sm"
                              >
                                ✕ Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-100 mb-3">{idea.content}</p>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4 text-gray-400">
                                <span>❤️ {idea.likes} likes</span>
                                <span>{idea.createdAt}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditIdea(idea)}
                                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs"
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  onClick={() => handleDelete(idea.id)}
                                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-xs"
                                >
                                  🗑️ Supprimer
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accueil;