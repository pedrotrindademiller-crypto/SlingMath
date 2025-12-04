import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import './Account.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Account = ({ playerData, playerId, isGuest, onLogout, onUpdate }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      // First verify current password by trying to login
      await axios.post(`${API}/login`, {
        email: playerData.email,
        password: currentPassword
      });

      // If successful, update password
      await axios.post(`${API}/change-password`, {
        email: playerData.email,
        currentPassword,
        newPassword
      });

      toast.success('Senha alterada com sucesso!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.detail || 'Erro ao alterar senha');
    }
  };

  return (
    <div className="account-container">
      <Card className="account-card">
        <CardHeader>
          <CardTitle className="account-title">
            👤 Minha Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGuest ? (
            <div className="guest-warning">
              <h3>⚠️ Modo Visitante</h3>
              <p>Você está jogando como visitante. Seu progresso não será salvo permanentemente!</p>
              <p className="guest-suggestion">
                Crie uma conta para salvar seu progresso:
              </p>
              <Button 
                onClick={onLogout}
                className="create-account-button"
              >
                Criar Conta Agora
              </Button>
            </div>
          ) : (
            <div className="account-info">
              <div className="info-section">
                <h3>📧 Email</h3>
                <p className="info-value">{playerData?.email || 'Não disponível'}</p>
              </div>

              <div className="info-section">
                <h3>🆔 Player ID</h3>
                <p className="info-value info-id">{playerId}</p>
              </div>

              <div className="info-section">
                <h3>📊 Estatísticas</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Moedas:</span>
                    <span className="stat-value">{playerData?.coins || 0} 🪙</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Questões:</span>
                    <span className="stat-value">{playerData?.questionsAnswered || 0} ✅</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Skins:</span>
                    <span className="stat-value">{playerData?.unlockedSkins?.length || 0} 🎨</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Nível:</span>
                    <span className="stat-value">{playerData?.questionLevel || 1} 📈</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>🔐 Segurança</h3>
                {!showChangePassword ? (
                  <Button 
                    onClick={() => setShowChangePassword(true)}
                    className="change-password-button"
                  >
                    Alterar Senha
                  </Button>
                ) : (
                  <div className="change-password-form">
                    <div className="form-group">
                      <label>Senha Atual:</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nova Senha:</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirmar Nova Senha:</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="form-buttons">
                      <Button 
                        onClick={handleChangePassword}
                        className="confirm-button"
                      >
                        Confirmar
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowChangePassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setError('');
                        }}
                        variant="outline"
                        className="cancel-button"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="account-actions">
            <Button 
              onClick={onLogout}
              variant="outline"
              className="logout-button"
            >
              {isGuest ? 'Sair e Criar Conta' : 'Sair da Conta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
