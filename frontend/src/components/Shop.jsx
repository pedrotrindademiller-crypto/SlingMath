import React from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import SkinIcon from './SkinIcon';
import './Shop.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SKINS = [
  // Básicas
  { id: 0, name: 'Clássico', description: 'O estilingue tradicional', price: 0, color: '#8B4513' },
  { id: 1, name: 'Fogo', description: 'Queime seus alvos com estilo', price: 50, color: '#FF4500' },
  { id: 2, name: 'Gelo', description: 'Congele a competição', price: 50, color: '#00CED1' },
  { id: 3, name: 'Ouro', description: 'Para os verdadeiros campeões', price: 50, color: '#FFD700' },
  { id: 4, name: 'Arco-íris', description: 'Mágico e colorido', price: 50, gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' },
  { id: 5, name: 'Espelho', description: 'Ricochete nas paredes com precisão', price: 75, gradient: 'linear-gradient(135deg, #E0E0E0, #FFFFFF, #C0C0C0, #F0F0F0)' },
  { id: 6, name: 'Hacker', description: 'Destrói TODOS os alvos instantaneamente', price: 10000, gradient: 'linear-gradient(135deg, #00FF00, #00AA00, #003300, #00FF00)' },
  
  // Natureza
  { id: 7, name: 'Pedra + Musgo', description: 'Da natureza para as mãos', price: 60, gradient: 'linear-gradient(135deg, #696969, #556B2F, #8FBC8F)' },
  
  // Elétrico
  { id: 8, name: 'Raio', description: 'Poder elétrico nas suas mãos', price: 75, gradient: 'linear-gradient(135deg, #FFD700, #FFFF00, #4169E1)' },
  
  // Steampunk / Tech
  { id: 9, name: 'Mecânico', description: 'Engrenagens girando ao puxar', price: 85, gradient: 'linear-gradient(135deg, #B87333, #8B7355, #CD7F32)' },
  { id: 10, name: 'Tesla', description: 'Faíscas elétricas entre os braços', price: 85, gradient: 'linear-gradient(135deg, #1E90FF, #00BFFF, #87CEEB)' },
  { id: 11, name: 'Neon Cyberpunk', description: 'Luzes RGB e cabos fluorescentes', price: 100, gradient: 'linear-gradient(135deg, #FF00FF, #00FFFF, #FF1493, #00FF00)' },
  { id: 12, name: 'Holográfico', description: 'Feito de luz sólida', price: 100, gradient: 'linear-gradient(135deg, #E0BBE4, #957DAD, #D291BC, #FEC8D8)' },
  
  // Fantasia / Mágico
  { id: 13, name: 'Dragão', description: 'Braços como chifres, olhos brilhando', price: 85, gradient: 'linear-gradient(135deg, #8B0000, #FF4500, #FFD700)' },
  { id: 14, name: 'Elfico', description: 'Madeira elegante com runas verdes', price: 75, gradient: 'linear-gradient(135deg, #8B4513, #2E8B57, #3CB371)' },
  { id: 15, name: 'Sombras', description: 'Textura preta com fumaça púrpura', price: 85, gradient: 'linear-gradient(135deg, #1A1A1A, #4B0082, #8B008B)' },
  { id: 16, name: 'Cristal Arcano', description: 'Cristais flutuantes mágicos', price: 100, gradient: 'linear-gradient(135deg, #9370DB, #BA55D3, #DA70D6)' },
  
  // Comédia / Divertidos
  { id: 17, name: 'Picolé', description: 'Madeira colorida derretendo', price: 50, gradient: 'linear-gradient(135deg, #FF6B9D, #FEC368, #96E6A1)' },
  { id: 18, name: 'Banana', description: 'Dois pedaços de banana como braços', price: 50, gradient: 'linear-gradient(135deg, #FFE135, #FFEB3B, #FDD835)' },
  { id: 19, name: 'Canetinha', description: 'Estilingue escolar colorido', price: 60, gradient: 'linear-gradient(135deg, #FF0000, #00FF00, #0000FF, #FFFF00)' },
  { id: 20, name: 'Inflável', description: 'Brinquedo de piscina', price: 60, gradient: 'linear-gradient(135deg, #00CED1, #48D1CC, #40E0D0)' },
  
  // Científico / Laboratório
  { id: 21, name: 'Tubos de Ensaio', description: 'Ciência em ação', price: 75, gradient: 'linear-gradient(135deg, #00CED1, #20B2AA, #5F9EA0)' },
  { id: 22, name: 'Impressão 3D', description: 'Design moderno em camadas', price: 85, gradient: 'linear-gradient(135deg, #FF6347, #FF7F50, #FFA07A)' },
  { id: 23, name: 'Bioluminescente', description: 'Brilha no escuro', price: 100, gradient: 'linear-gradient(135deg, #00FF7F, #7FFFD4, #AFEEEE)' },
  { id: 24, name: 'Atômico', description: 'Núcleo com órbitas girando', price: 100, gradient: 'linear-gradient(135deg, #00FA9A, #00FF7F, #7CFC00)' },
  
  // Premium
  { id: 25, name: 'Ouro Maciço', description: 'Luxo supremo', price: 100, gradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)' },
  { id: 26, name: 'Fibra de Carbono', description: 'Leve e resistente', price: 85, gradient: 'linear-gradient(135deg, #2F4F4F, #696969, #808080)' },
  { id: 27, name: 'Titânio', description: 'Metal espacial fosco', price: 85, gradient: 'linear-gradient(135deg, #C0C0C0, #A9A9A9, #D3D3D3)' },
  { id: 28, name: 'Madeira Petrificada', description: 'Antiga e poderosa', price: 75, gradient: 'linear-gradient(135deg, #8B7355, #A0826D, #BC8F8F)' },
  
  // Temáticos
  { id: 29, name: 'Ossos', description: 'Halloween assustador', price: 60, gradient: 'linear-gradient(135deg, #F5F5DC, #FFFAF0, #FFE4B5)' },
  { id: 30, name: 'Abóbora', description: 'Espírito de Halloween', price: 60, gradient: 'linear-gradient(135deg, #FF8C00, #FFA500, #FF7F50)' },
  { id: 31, name: 'Bengala Doce', description: 'Doçura natalina', price: 60, gradient: 'linear-gradient(135deg, #FF0000, #FFFFFF, #FF0000)' },
  { id: 32, name: 'Neve e Luzes', description: 'Magia do Natal', price: 75, gradient: 'linear-gradient(135deg, #FFFFFF, #87CEEB, #1E90FF)' },
  { id: 33, name: 'Futurista', description: 'HUD projetado avançado', price: 100, gradient: 'linear-gradient(135deg, #00FFFF, #0080FF, #0040FF)' },
  { id: 34, name: 'Pirata', description: 'Pedaços de navio e cordas', price: 75, gradient: 'linear-gradient(135deg, #8B4513, #A0522D, #D2691E)' }
];

const Shop = ({ playerData, playerId, onUpdate }) => {
  const handlePurchase = async (skinId) => {
    try {
      await axios.post(`${API}/purchase`, {
        playerId,
        skinId
      });
      
      toast.success('Skin comprada com sucesso! 🎉');
      await onUpdate();
    } catch (error) {
      if (error.response?.status === 400) {
        if (error.response.data.detail === 'Skin already owned') {
          toast.error('Você já possui esta skin!');
        } else if (error.response.data.detail === 'Not enough coins') {
          toast.error('Moedas insuficientes! Continue jogando para ganhar mais.');
        }
      } else {
        toast.error('Erro ao comprar skin');
      }
    }
  };

  const isOwned = (skinId) => playerData?.unlockedSkins?.includes(skinId);
  const canAfford = (price) => playerData?.coins >= price;

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h2 className="shop-title" data-testid="shop-title">Loja de Skins</h2>
        <p className="shop-description">
          Customize seu estilingue com skins incríveis!
        </p>
      </div>

      <div className="skins-grid">
        {SKINS.map((skin) => {
          const owned = isOwned(skin.id);
          const affordable = canAfford(skin.price);

          return (
            <Card 
              key={skin.id} 
              className={`skin-card ${owned ? 'skin-owned' : ''}`}
              data-testid={`skin-card-${skin.id}`}
            >
              <CardHeader>
                <div className="skin-preview-container">
                  <div className="skin-icon-wrapper" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 250, 0.95))',
                    border: owned ? '3px solid #4ECDC4' : '3px solid rgba(102, 126, 234, 0.3)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <SkinIcon skinId={skin.id} size={120} />
                    {owned && (
                      <Badge className="owned-badge" data-testid={`owned-badge-${skin.id}`}>
                        ✓ Possui
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="skin-name">{skin.name}</CardTitle>
                <CardDescription className="skin-description">
                  {skin.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="skin-price" data-testid={`skin-price-${skin.id}`}>
                  {skin.price === 0 ? (
                    <span className="price-free">Gratuito</span>
                  ) : (
                    <>
                      <span className="coin-icon">🪙</span>
                      <span className="price-amount">{skin.price}</span>
                    </>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {owned ? (
                  <Button 
                    className="skin-button owned"
                    disabled
                    data-testid={`owned-button-${skin.id}`}
                  >
                    ✓ Já Possui
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(skin.id)}
                    disabled={!affordable && skin.price > 0}
                    className="skin-button purchase"
                    data-testid={`purchase-button-${skin.id}`}
                  >
                    {skin.price === 0 ? 'Obter Grátis' : affordable ? 'Comprar' : 'Moedas Insuficientes'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;