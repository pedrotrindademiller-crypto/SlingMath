import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SkinIcon from './SkinIcon';
import './Inventory.css';

const SKINS = [
  { id: 0, name: 'Clássico', color: '#8B4513' },
  { id: 1, name: 'Fogo', color: '#FF4500' },
  { id: 2, name: 'Gelo', color: '#00CED1' },
  { id: 3, name: 'Ouro', color: '#FFD700' },
  { id: 4, name: 'Arco-íris', gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' }
];

const Inventory = ({ playerData }) => {
  const unlockedSkins = playerData?.unlockedSkins || [0];
  const selectedSkin = playerData?.selectedSkin || 0;

  const unlockedSkinsData = SKINS.filter(skin => unlockedSkins.includes(skin.id));
  const lockedSkinsCount = SKINS.length - unlockedSkinsData.length;

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
