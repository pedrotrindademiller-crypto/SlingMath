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
  { id: 4, name: 'Arco-íris', gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' },
  { id: 5, name: 'Espelho', gradient: 'linear-gradient(135deg, #E0E0E0, #FFFFFF, #C0C0C0, #F0F0F0)' },
  { id: 6, name: 'Hacker', gradient: 'linear-gradient(135deg, #00FF00, #00AA00, #003300, #00FF00)' },
  { id: 7, name: 'Pedra + Musgo', gradient: 'linear-gradient(135deg, #696969, #556B2F, #8FBC8F)' },
  { id: 8, name: 'Raio', gradient: 'linear-gradient(135deg, #FFD700, #FFFF00, #4169E1)' },
  { id: 9, name: 'Mecânico', gradient: 'linear-gradient(135deg, #B87333, #8B7355, #CD7F32)' },
  { id: 10, name: 'Tesla', gradient: 'linear-gradient(135deg, #1E90FF, #00BFFF, #87CEEB)' },
  { id: 11, name: 'Neon Cyberpunk', gradient: 'linear-gradient(135deg, #FF00FF, #00FFFF, #FF1493, #00FF00)' },
  { id: 12, name: 'Holográfico', gradient: 'linear-gradient(135deg, #E0BBE4, #957DAD, #D291BC, #FEC8D8)' },
  { id: 13, name: 'Dragão', gradient: 'linear-gradient(135deg, #8B0000, #FF4500, #FFD700)' },
  { id: 14, name: 'Elfico', gradient: 'linear-gradient(135deg, #8B4513, #2E8B57, #3CB371)' },
  { id: 15, name: 'Sombras', gradient: 'linear-gradient(135deg, #1A1A1A, #4B0082, #8B008B)' },
  { id: 16, name: 'Cristal Arcano', gradient: 'linear-gradient(135deg, #9370DB, #BA55D3, #DA70D6)' },
  { id: 17, name: 'Picolé', gradient: 'linear-gradient(135deg, #FF6B9D, #FEC368, #96E6A1)' },
  { id: 18, name: 'Banana', gradient: 'linear-gradient(135deg, #FFE135, #FFEB3B, #FDD835)' },
  { id: 19, name: 'Canetinha', gradient: 'linear-gradient(135deg, #FF0000, #00FF00, #0000FF, #FFFF00)' },
  { id: 20, name: 'Inflável', gradient: 'linear-gradient(135deg, #00CED1, #48D1CC, #40E0D0)' },
  { id: 21, name: 'Tubos de Ensaio', gradient: 'linear-gradient(135deg, #00CED1, #20B2AA, #5F9EA0)' },
  { id: 22, name: 'Impressão 3D', gradient: 'linear-gradient(135deg, #FF6347, #FF7F50, #FFA07A)' },
  { id: 23, name: 'Bioluminescente', gradient: 'linear-gradient(135deg, #00FF7F, #7FFFD4, #AFEEEE)' },
  { id: 24, name: 'Atômico', gradient: 'linear-gradient(135deg, #00FA9A, #00FF7F, #7CFC00)' },
  { id: 25, name: 'Ouro Maciço', gradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)' },
  { id: 26, name: 'Fibra de Carbono', gradient: 'linear-gradient(135deg, #2F4F4F, #696969, #808080)' },
  { id: 27, name: 'Titânio', gradient: 'linear-gradient(135deg, #C0C0C0, #A9A9A9, #D3D3D3)' },
  { id: 28, name: 'Madeira Petrificada', gradient: 'linear-gradient(135deg, #8B7355, #A0826D, #BC8F8F)' },
  { id: 29, name: 'Ossos', gradient: 'linear-gradient(135deg, #F5F5DC, #FFFAF0, #FFE4B5)' },
  { id: 30, name: 'Abóbora', gradient: 'linear-gradient(135deg, #FF8C00, #FFA500, #FF7F50)' },
  { id: 31, name: 'Bengala Doce', gradient: 'linear-gradient(135deg, #FF0000, #FFFFFF, #FF0000)' },
  { id: 32, name: 'Neve e Luzes', gradient: 'linear-gradient(135deg, #FFFFFF, #87CEEB, #1E90FF)' },
  { id: 33, name: 'Futurista', gradient: 'linear-gradient(135deg, #00FFFF, #0080FF, #0040FF)' },
  { id: 34, name: 'Pirata', gradient: 'linear-gradient(135deg, #8B4513, #A0522D, #D2691E)' }
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
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 250, 0.95))',
                  border: isSelected ? '3px solid #FFD700' : '2px solid rgba(102, 126, 234, 0.3)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)'
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
