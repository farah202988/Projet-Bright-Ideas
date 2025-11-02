import React, { useEffect, useState } from 'react';

const Accueil = () => {
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // States pour l'édition de profil
  const [editData, setEditData] = useState({
    name: '',
    alias: '',
    email: '',
    dateOfBirth: '',
    address: '',
    profilePhoto: null,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOld: false,
    showNew: false,
    showConfirm: false,
  });

  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }

    const userData = JSON.parse(storedUser);
    
    if (userData.role === 'admin') {
      window.location.href = '/admin';
      return;
    }

    setUser(userData);
    setEditData({
      name: userData.name || '',
      alias: userData.alias || '',
      email: userData.email || '',
      dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      address: userData.address || '',
      profilePhoto: userData.profilePhoto || null,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  // Fonctions pour l'édition de profil
  const handleInfoChange = (e) => {
    setEditData({ ...editData, [e.target.id]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  const handleSaveInfo = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const bodyData = {
        name: editData.name,
        alias: editData.alias,
        email: editData.email,
        dateOfBirth: editData.dateOfBirth,
        address: editData.address,
      };
      
      // Ajouter la photo si elle a été changée et qu'elle est en base64
      if (editData.profilePhoto && editData.profilePhoto.startsWith('data:')) {
        bodyData.profilePhoto = editData.profilePhoto;
      }

      console.log('Envoi des données:', bodyData);

      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      setSuccess('Informations mises à jour avec succès !');
      setLoading(false);
      
      const updatedUser = {
        ...data.user,
        profilePhoto: editData.profilePhoto || data.user.profilePhoto
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        setShowEditModal(false);
        setShowProfileModal(false);
      }, 1500);

    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!passwordData.oldPassword) {
      setError('Veuillez saisir votre ancien mot de passe');
      return;
    }

    if (!passwordData.newPassword) {
      setError('Veuillez saisir votre nouveau mot de passe');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur lors du changement de mot de passe");
      }

      setSuccess('Mot de passe changé avec succès !');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        showOld: false,
        showNew: false,
        showConfirm: false,
      });
      setLoading(false);

      setTimeout(() => {
        setShowEditModal(false);
        setShowProfileModal(false);
      }, 1500);

    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe");
      setLoading(false);
    }
  };

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
              <span className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.alias} className="w-full h-full object-cover" />
                ) : (
                  (user.name || user.nom || '?').charAt(0).toUpperCase()
                )}
              </span>
              {user.alias}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Gauche */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sticky top-24 text-center cursor-pointer hover:shadow-lg transition" onClick={() => setShowProfileModal(true)}>
              <div className="w-full h-24 bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 rounded-2xl mb-4"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto -mt-8 mb-4 border-4 border-white overflow-hidden">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.alias} className="w-full h-full object-cover" />
                ) : (
                  (user.name || user.nom || '?').charAt(0).toUpperCase()
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-lg">{user.name || user.nom}</h3>
              <p className="text-gray-500 text-sm mb-6">@{user.alias}</p>

              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-full hover:bg-blue-600 transition">
                Mon Profil
              </button>
            </div>
          </aside>

          {/* Centre - Contenu Futur */}
          <main className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">📝 Contenu futur</p>
              <p className="text-gray-500">La section de publication d'idées sera disponible très bientôt !</p>
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
      {showProfileModal && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                <p className="text-gray-400 text-sm">Consultez vos informations de profil ici.</p>
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
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-5xl border-4 border-gray-700 mb-6 overflow-hidden">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.alias} className="w-full h-full object-cover" />
                      ) : (
                        (user.name || user.nom || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center">{user.name || user.nom}</h2>
                    <p className="text-green-400 text-sm mb-4">Premium User</p>
                  </div>

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
                    {user.dateOfBirth && (
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400">🎂</span>
                        <div>
                          <p className="text-xs text-gray-500">Date de naissance</p>
                          <p className="text-white font-medium">
                            {new Date(user.dateOfBirth).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
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

                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition mb-3"
                  >
                    ✏️ Modifier mes informations
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    🚪 Déconnexion
                  </button>
                </div>

                {/* Right Column - Contenu Futur */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex items-center justify-center">
                  <p className="text-gray-400 text-center">Contenu futur</p>
                </div>
              </div>

              {/* Contenu Futur Section */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">📊 Contenu futur</h3>
                <p className="text-gray-400 text-center py-8">Les statistiques et autres informations seront affichées ici prochainement.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Modifier le profil</h1>
                <p className="text-gray-400 text-sm">Mettez à jour vos informations</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-3xl text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <div className="flex gap-4 mb-8 border-b border-gray-700">
                <button
                  onClick={() => {
                    setActiveTab('info');
                    setError('');
                    setSuccess('');
                  }}
                  className={`px-4 py-2 font-semibold transition ${
                    activeTab === 'info'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Informations personnelles
                </button>
                <button
                  onClick={() => {
                    setActiveTab('password');
                    setError('');
                    setSuccess('');
                  }}
                  className={`px-4 py-2 font-semibold transition ${
                    activeTab === 'password'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Mot de passe
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-900 border border-green-600 text-green-200 rounded-lg mb-4">
                  {success}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="profilePhoto" className="block text-sm font-semibold text-gray-300 mb-2">
                      Photo de profil
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-gray-700 flex-shrink-0">
                        {editData.profilePhoto ? (
                          <img src={editData.profilePhoto} alt="Preview" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          (user.name || user.nom || '?').charAt(0).toUpperCase()
                        )}
                      </div>
                      <input
                        id="profilePhoto"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={editData.name}
                      onChange={handleInfoChange}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="alias" className="block text-sm font-semibold text-gray-300 mb-2">
                      Alias (nom d'utilisateur)
                    </label>
                    <input
                      id="alias"
                      type="text"
                      value={editData.alias}
                      onChange={handleInfoChange}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={handleInfoChange}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-300 mb-2">
                      Date de naissance
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={handleInfoChange}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-300 mb-2">
                      Adresse
                    </label>
                    <textarea
                      id="address"
                      value={editData.address}
                      onChange={handleInfoChange}
                      rows="3"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveInfo}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sauvegarde...' : '✓ Enregistrer les modifications'}
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                      Ancien mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="oldPassword"
                        type={passwordData.showOld ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordData({ ...passwordData, showOld: !passwordData.showOld })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {passwordData.showOld ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={passwordData.showNew ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {passwordData.showNew ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={passwordData.showConfirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {passwordData.showConfirm ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Changement...' : '✓ Changer le mot de passe'}
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accueil;