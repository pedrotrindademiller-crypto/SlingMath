import React, { useState, useEffect } from 'react';
import '@/App.css';
import axios from 'axios';
import Game from '@/components/Game';
import Shop from '@/components/Shop';
import Inventory from '@/components/Inventory';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [playerId, setPlayerId] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [currentView, setCurrentView] = useState('game'); // 'game', 'shop', 'inventory', 'account'
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false); // Modo visitante
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [coinsToAdd, setCoinsToAdd] = useState(100);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSignup, setIsSignup] = useState(true); // true = signup, false = login
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false); // Para migração de contas antigas

  useEffect(() => {
    initializePlayer();
  }, []);

  // Admin panel shortcut: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminPanel(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initializePlayer = async () => {
    try {
      // Check if user is logged in or guest
      const savedPlayerId = localStorage.getItem('slingmath_player_id');
      const savedEmail = localStorage.getItem('slingmath_email');
      const savedIsGuest = localStorage.getItem('slingmath_is_guest') === 'true';

      if (!savedPlayerId) {
        // Show login modal if not logged in
        setLoading(false);
        setShowLoginModal(true);
        return;
      }

      setPlayerId(savedPlayerId);
      setIsGuest(savedIsGuest);

      // Get player data
      const response = await axios.get(`${API}/player/${savedPlayerId}`);
      setPlayerData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing player:', error);
      // If error, show login modal
      localStorage.removeItem('slingmath_player_id');
      localStorage.removeItem('slingmath_email');
      localStorage.removeItem('slingmath_is_guest');
      setLoading(false);
      setShowLoginModal(true);
    }
  };

  const handlePlayAsGuest = async () => {
    try {
      // Create guest player
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await axios.post(`${API}/player`, { 
        playerId: guestId
      });
      
      // Save as guest
      localStorage.setItem('slingmath_player_id', guestId);
      localStorage.setItem('slingmath_is_guest', 'true');
      
      setPlayerId(guestId);
      setPlayerData(response.data);
      setIsGuest(true);
      setShowLoginModal(false);
      toast.info('Jogando como visitante. Seu progresso será temporário! 🎮');
    } catch (error) {
      console.error('Error creating guest:', error);
      toast.error('Erro ao criar sessão de visitante');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('slingmath_player_id');
    localStorage.removeItem('slingmath_email');
    localStorage.removeItem('slingmath_is_guest');
    setPlayerId(null);
    setPlayerData(null);
    setIsGuest(false);
    setShowLoginModal(true);
    toast.success('Logout realizado com sucesso!');
  };

  const checkEmail = async () => {
    setLoginError('');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setLoginError('Por favor, insira um email válido');
      return;
    }

    try {
      const response = await axios.post(`${API}/check-email`, { email });
      
      if (response.data.exists && response.data.needsPassword) {
        // Conta antiga sem senha - precisa definir senha
        setNeedsPasswordSetup(true);
        setIsSignup(false);
        toast.info('Defina uma senha para sua conta existente!');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  const handleAuth = async () => {
    setLoginError('');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setLoginError('Por favor, insira um email válido');
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setLoginError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      if (needsPasswordSetup) {
        // Definir senha para conta antiga
        const response = await axios.post(`${API}/set-password`, { 
          email,
          password
        });
        
        // Save credentials
        localStorage.setItem('slingmath_player_id', response.data.playerId);
        localStorage.setItem('slingmath_email', response.data.email);
        
        setPlayerId(response.data.playerId);
        setPlayerData(response.data.player);
        setShowLoginModal(false);
        setNeedsPasswordSetup(false);
        toast.success(`Senha definida! Bem-vindo de volta, ${email}! 🎮`);
      } else if (isSignup) {
        // Signup
        const response = await axios.post(`${API}/signup`, { 
          email,
          password
        });
        
        // Save credentials
        localStorage.setItem('slingmath_player_id', response.data.playerId);
        localStorage.setItem('slingmath_email', response.data.email);
        
        setPlayerId(response.data.playerId);
        setPlayerData(response.data.player);
        setShowLoginModal(false);
        toast.success(`Conta criada! Bem-vindo, ${email}! 🎮`);
      } else {
        // Login
        const response = await axios.post(`${API}/login`, { 
          email,
          password
        });
        
        // Save credentials
        localStorage.setItem('slingmath_player_id', response.data.playerId);
        localStorage.setItem('slingmath_email', response.data.email);
        
        setPlayerId(response.data.playerId);
        setPlayerData(response.data.player);
        setShowLoginModal(false);
        toast.success(`Bem-vindo de volta, ${email}! 🎮`);
      }
    } catch (error) {
      console.error('Error authenticating:', error);
      setLoginError(error.response?.data?.detail || 'Erro ao autenticar. Tente novamente.');
    }
  };

  const refreshPlayerData = async () => {
    if (!playerId) return;
    try {
      const response = await axios.get(`${API}/player/${playerId}`);
      setPlayerData(response.data);
    } catch (error) {
      console.error('Error refreshing player data:', error);
    }
  };

  const handleAdminAddCoins = async () => {
    // Código secreto: PEPEMILLER2013
    if (adminCode !== 'PEPEMILLER2013') {
      toast.error('Código de administrador inválido!');
      return;
    }

    try {
      const response = await axios.put(`${API}/player/${playerId}`, {
        coins: (playerData?.coins || 0) + coinsToAdd
      });
      
      setPlayerData(response.data);
      toast.success(`✅ ${coinsToAdd} moedas adicionadas! Total: ${response.data.coins} 🪙`);
      setShowAdminPanel(false);
      setAdminCode('');
      setCoinsToAdd(100);
    } catch (error) {
      console.error('Error adding coins:', error);
      toast.error('Erro ao adicionar moedas');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Carregando SlingMath...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="game-header">
        <div className="header-content">
          <h1 className="game-title" data-testid="game-title">SlingMath</h1>
          <div className="header-stats">
            <div className="coin-display" data-testid="coin-display">
              <span className="coin-icon">🪙</span>
              <span className="coin-amount">{playerData?.coins || 0}</span>
            </div>
            <div className="header-buttons">
              <Button 
                onClick={() => setCurrentView('game')}
                variant={currentView === 'game' ? 'default' : 'outline'}
                className="nav-button"
                data-testid="game-button"
              >
                🎯 Jogar
              </Button>
              <Button 
                onClick={() => setCurrentView('inventory')}
                variant={currentView === 'inventory' ? 'default' : 'outline'}
                className="nav-button"
                data-testid="inventory-button"
              >
                📦 Inventário
              </Button>
              <Button 
                onClick={() => setCurrentView('shop')}
                variant={currentView === 'shop' ? 'default' : 'outline'}
                className="nav-button"
                data-testid="shop-button"
              >
                🛒 Loja
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="game-content">
        {currentView === 'game' && (
          <Game 
            playerData={playerData}
            playerId={playerId}
            onUpdate={refreshPlayerData}
          />
        )}
        
        {currentView === 'inventory' && (
          <Inventory 
            playerData={playerData}
            playerId={playerId}
            onUpdate={refreshPlayerData}
          />
        )}
        
        {currentView === 'shop' && (
          <Shop 
            playerData={playerData}
            playerId={playerId}
            onUpdate={refreshPlayerData}
            onClose={() => setCurrentView('game')}
          />
        )}
      </main>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="admin-overlay" onClick={() => setShowAdminPanel(false)}>
          <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-title">🔧 Painel de Administrador</h2>
            <p className="admin-subtitle">Adicionar moedas para testes</p>
            
            <div className="admin-form">
              <div className="admin-input-group">
                <label>Código de Admin:</label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Digite o código secreto"
                  className="admin-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminAddCoins()}
                />
              </div>

              <div className="admin-input-group">
                <label>Quantidade de Moedas:</label>
                <input
                  type="number"
                  value={coinsToAdd}
                  onChange={(e) => setCoinsToAdd(parseInt(e.target.value) || 0)}
                  className="admin-input"
                  min="1"
                  max="10000"
                />
              </div>

              <div className="admin-info">
                <p>Moedas atuais: <strong>{playerData?.coins || 0} 🪙</strong></p>
                <p>Após adicionar: <strong>{(playerData?.coins || 0) + coinsToAdd} 🪙</strong></p>
              </div>

              <div className="admin-buttons">
                <Button 
                  onClick={handleAdminAddCoins}
                  className="admin-button-confirm"
                >
                  Adicionar Moedas
                </Button>
                <Button 
                  onClick={() => setShowAdminPanel(false)}
                  variant="outline"
                  className="admin-button-cancel"
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <p className="admin-hint">💡 Atalho: Ctrl + Shift + A</p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-overlay">
          <div className="login-modal">
            <div className="login-header">
              <h1 className="login-title">🎯 SlingMath</h1>
              <p className="login-subtitle">Bem-vindo ao jogo de matemática!</p>
            </div>

            {!needsPasswordSetup && (
              <div className="login-tabs">
                <button 
                  className={`login-tab ${isSignup ? 'active' : ''}`}
                  onClick={() => {
                    setIsSignup(true);
                    setLoginError('');
                  }}
                >
                  Criar Conta
                </button>
                <button 
                  className={`login-tab ${!isSignup ? 'active' : ''}`}
                  onClick={() => {
                    setIsSignup(false);
                    setLoginError('');
                  }}
                >
                  Entrar
                </button>
              </div>
            )}

            <div className="login-content">
              <p className="login-description">
                {needsPasswordSetup
                  ? '🔐 Sua conta existe! Defina uma senha para proteger seu progresso.'
                  : isSignup 
                    ? 'Crie sua conta para salvar seu progresso e competir!'
                    : 'Entre com sua conta para continuar jogando!'
                }
              </p>

              <div className="login-form">
                <div className="login-input-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError('');
                    }}
                    onBlur={checkEmail}
                    placeholder="seu@email.com"
                    className="login-input"
                    autoFocus
                    disabled={needsPasswordSetup}
                  />
                </div>

                <div className="login-input-group">
                  <label>Senha:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="••••••••"
                    className="login-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  />
                  <p className="login-hint">Mínimo 6 caracteres</p>
                </div>

                {loginError && (
                  <p className="login-error">{loginError}</p>
                )}

                <Button 
                  onClick={handleAuth}
                  className="login-button"
                  disabled={!email || !password}
                >
                  {needsPasswordSetup 
                    ? 'Definir Senha e Continuar'
                    : isSignup 
                      ? 'Criar Conta' 
                      : 'Entrar'
                  }
                </Button>

                <p className="login-privacy">
                  🔒 Seus dados são protegidos e não serão compartilhados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;