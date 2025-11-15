import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/accueil.css';

const Accueil = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setEditData({
      name: userData.name || '',
      alias: userData.alias || '',
      email: userData.email || '',
      dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      address: userData.address || '',
      profilePhoto: userData.profilePhoto || null,
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

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
      
      if (editData.profilePhoto && editData.profilePhoto.startsWith('data:')) {
        bodyData.profilePhoto = editData.profilePhoto;
      }

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
        setShowProfileModal(false);
      }, 1500);

    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Verticale */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>💡</span>
          <span>Bright Ideas</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/accueil" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </a>
          
          <a href="/my-ideas" className="nav-item">
            <span className="nav-icon">💡</span>
            <span>My Ideas</span>
          </a>
          
          <a href="/statistics" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Statistics</span>
          </a>
          
          <div className="profile-dropdown-sidebar">
            <button 
              className="profile-trigger-sidebar" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="nav-icon">👤</span>
              <span>Profile</span>
              <span className={`dropdown-arrow-sidebar ${showDropdown ? 'open' : ''}`}>▼</span>
            </button>
            
            {showDropdown && (
              <div className="dropdown-submenu">
                <button 
                  className="dropdown-submenu-item" 
                  onClick={() => {
                    setShowProfileModal(true);
                    setActiveTab('info');
                  }}
                >
                  <span>•</span>
                  <span>Personal Information</span>
                </button>
                <button 
                  className="dropdown-submenu-item" 
                  onClick={() => {
                    setShowProfileModal(true);
                    setActiveTab('password');
                  }}
                >
                  <span>•</span>
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Share Your Ideas. Inspire the World.</h1>
            <p className="hero-subtitle">Post your ideas, discover others, and connect with creative minds.</p>
          </div>
        </section>

        {/* Main Content */}
        <main className="main-content">
          <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#333' }}>🚀 Contenu à venir</h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>La section de publication d'idées sera disponible très bientôt !</p>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Profile Settings</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-tabs">
                <button 
                  className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('info');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Personal Information
                </button>
                <button 
                  className={`modal-tab ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('password');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Change Password
                </button>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {activeTab === 'info' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="profile-photo-preview">
                        {editData.profilePhoto ? (
                          <img src={editData.profilePhoto} alt="Preview" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={editData.name}
                      onChange={handleInfoChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="alias" className="form-label">Username (Alias)</label>
                    <input
                      id="alias"
                      type="text"
                      value={editData.alias}
                      onChange={handleInfoChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={handleInfoChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={handleInfoChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                      id="address"
                      value={editData.address}
                      onChange={handleInfoChange}
                      rows="3"
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button onClick={handleSaveInfo} disabled={loading} className="btn btn-primary">
                      {loading ? '⏳ Saving...' : '✓ Save Changes'}
                    </button>
                    <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <div className="form-group">
                    <label htmlFor="oldPassword" className="form-label">Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="oldPassword"
                        type={passwordData.showOld ? 'text' : 'password'}
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordData({ ...passwordData, showOld: !passwordData.showOld })}
                        className="toggle-password"
                      >
                        {passwordData.showOld ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="newPassword"
                        type={passwordData.showNew ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })}
                        className="toggle-password"
                      >
                        {passwordData.showNew ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="confirmPassword"
                        type={passwordData.showConfirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })}
                        className="toggle-password"
                      >
                        {passwordData.showConfirm ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleChangePassword} disabled={loading} className="btn btn-primary">
                      {loading ? '⏳ Updating...' : '✓ Update Password'}
                    </button>
                    <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">
                      Cancel
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