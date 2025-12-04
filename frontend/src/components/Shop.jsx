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
  { id: 0, name: 'Clássico', description: 'O estilingue tradicional', price: 0, color: '#8B4513' },
  { id: 1, name: 'Fogo', description: 'Queime seus alvos com estilo', price: 50, color: '#FF4500' },
  { id: 2, name: 'Gelo', description: 'Congele a competição', price: 50, color: '#00CED1' },
  { id: 3, name: 'Ouro', description: 'Para os verdadeiros campeões', price: 50, color: '#FFD700' },
  { id: 4, name: 'Arco-íris', description: 'Mágico e colorido', price: 50, gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' },
  { id: 5, name: 'Espelho', description: 'Ricochete nas paredes com precisão', price: 75, gradient: 'linear-gradient(135deg, #E0E0E0, #FFFFFF, #C0C0C0, #F0F0F0)' },
  { id: 6, name: 'Hacker', description: 'Destrói TODOS os alvos instantaneamente', price: 10000, gradient: 'linear-gradient(135deg, #00FF00, #00AA00, #003300, #00FF00)' }
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