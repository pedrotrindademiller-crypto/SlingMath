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
  const [currentView, setCurrentView] = useState('game'); // 'game', 'shop', 'inventory'
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [coinsToAdd, setCoinsToAdd] = useState(100);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');

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
      // Get or create player ID
      let id = localStorage.getItem('slingmath_player_id');
      if (!id) {
        id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('slingmath_player_id', id);
      }
      setPlayerId(id);

      // Get or create player data
      const response = await axios.post(`${API}/player`, { playerId: id });
      setPlayerData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing player:', error);
      toast.error('Erro ao carregar dados do jogador');
      setLoading(false);
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
    </div>
  );
}

export default App;