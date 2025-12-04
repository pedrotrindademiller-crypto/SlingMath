import React from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SkinIcon from './SkinIcon';
import './Inventory.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SKINS = [
  { id: 0, name: 'Clássico', color: '#8B4513' },
  { id: 1, name: 'Fogo', color: '#FF4500' },
  { id: 2, name: 'Gelo', color: '#00CED1' },
  { id: 3, name: 'Ouro', color: '#FFD700' },
  { id: 4, name: 'Arco-íris', gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' }
];

const Inventory = ({ playerData, playerId, onUpdate }) => {
  const unlockedSkins = playerData?.unlockedSkins || [0];
  const selectedSkin = playerData?.selectedSkin || 0;

  const unlockedSkinsData = SKINS.filter(skin => unlockedSkins.includes(skin.id));
  const lockedSkinsCount = SKINS.length - unlockedSkinsData.length;

  const handleEquipSkin = async (skinId) => {
    if (skinId === selectedSkin) {
      toast.info('Esta skin já está equipada!');
      return;
    }

    try {
      await axios.post(`${API}/select-skin/${playerId}/${skinId}`);
      toast.success(`Skin ${SKINS[skinId].name} equipada! 🎨`);
      await onUpdate();
    } catch (error) {
      console.error('Error equipping skin:', error);
      toast.error('Erro ao equipar skin');
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2 className="inventory-title" data-testid="inventory-title">
          📦 Meu Inventário
        </h2>
        <div className="inventory-stats">
          <Badge className="stats-badge owned">
            ✓ {unlockedSkinsData.length}/{SKINS.length} Skins
          </Badge>
          <Badge className="stats-badge locked">
            🔒 {lockedSkinsCount} Bloqueadas
          </Badge>
        </div>
      </div>

      <div className="inventory-grid">
        {unlockedSkinsData.map((skin) => {
          const isSelected = skin.id === selectedSkin;

          return (
            <Card 
              key={skin.id} 
              className={`inventory-card ${isSelected ? 'inventory-selected' : ''}`}
              data-testid={`inventory-skin-${skin.id}`}
            >
              <CardHeader>
                <div className="inventory-icon-wrapper" style={{
                  background: skin.gradient || skin.color,
                  border: isSelected ? '3px solid #FFD700' : '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <SkinIcon skinId={skin.id} size={100} />
                  {isSelected && (
                    <Badge className="using-badge" data-testid={`using-badge-${skin.id}`}>
                      Em Uso
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="inventory-skin-name">{skin.name}</CardTitle>
              </CardContent>
              <CardFooter>
                {isSelected ? (
                  <Button 
                    className="equip-button equipped"
                    disabled
                    data-testid={`equipped-button-${skin.id}`}
                  >
                    ✓ Equipada
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleEquipSkin(skin.id)}
                    className="equip-button"
                    data-testid={`equip-button-${skin.id}`}
                  >
                    Equipar
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {lockedSkinsCount > 0 && (
        <div className="locked-skins-info">
          <p>💡 Jogue mais e ganhe moedas para desbloquear todas as skins!</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
