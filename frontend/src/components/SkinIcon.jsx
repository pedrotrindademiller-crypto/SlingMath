import React, { useEffect, useRef } from 'react';

const SkinIcon = ({ skinId, size = 120 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const scale = size / 120;

    // Desenhar estilingue em miniatura
    const drawSlingshot = (baseColor, armsColor, bandColor, effect) => {
      ctx.save();
      ctx.lineCap = 'round';

      // Base do Y
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 8 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 25 * scale);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // Braço esquerdo
      ctx.strokeStyle = armsColor;
      ctx.lineWidth = 6 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - 20 * scale, centerY - 25 * scale);
      ctx.stroke();

      // Braço direito
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
      ctx.stroke();

      // Elástico
      ctx.strokeStyle = bandColor;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX - 20 * scale, centerY - 25 * scale);
      ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
      ctx.stroke();

      // Efeitos especiais
      if (effect === 'fire') {
        // Chamas
        for (let i = 0; i < 3; i++) {
          const flameX = centerX + (Math.random() - 0.5) * 30 * scale;
          const flameY = centerY + (Math.random() - 0.5) * 20 * scale;
          const flameSize = 4 + Math.random() * 4;
          
          ctx.fillStyle = ['#FF4500', '#FFD700', '#FF6347'][Math.floor(Math.random() * 3)];
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (effect === 'ice') {
        // Flocos de neve
        for (let i = 0; i < 4; i++) {
          const snowX = centerX + (Math.random() - 0.5) * 30 * scale;
          const snowY = centerY + (Math.random() - 0.5) * 20 * scale;
          const snowSize = 3 + Math.random() * 3;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          for (let j = 0; j < 6; j++) {
            const angle = (Math.PI * 2 * j) / 6;
            const x = snowX + Math.cos(angle) * snowSize * scale;
            const y = snowY + Math.sin(angle) * snowSize * scale;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        }
      } else if (effect === 'gold') {
        // Brilhos dourados
        for (let i = 0; i < 5; i++) {
          const sparkX = centerX + (Math.random() - 0.5) * 35 * scale;
          const sparkY = centerY + (Math.random() - 0.5) * 25 * scale;
          const sparkSize = 2 + Math.random() * 3;
          
          ctx.shadowBlur = 8 * scale;
          ctx.shadowColor = '#FFD700';
          ctx.fillStyle = ['#FFD700', '#FFA500', '#FFFF00'][Math.floor(Math.random() * 3)];
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (effect === 'rainbow') {
        // Partículas coloridas
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FF1493'];
        for (let i = 0; i < 6; i++) {
          const rainbowX = centerX + (Math.random() - 0.5) * 35 * scale;
          const rainbowY = centerY + (Math.random() - 0.5) * 25 * scale;
          const rainbowSize = 2 + Math.random() * 3;
          
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.beginPath();
          ctx.arc(rainbowX, rainbowY, rainbowSize * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    // Desenhar cada skin específica
    switch (skinId) {
      case 0: // Clássico
        drawSlingshot('#654321', '#654321', '#333333', null);
        break;
      case 1: // Fogo
        drawSlingshot('#DC143C', '#FF4500', '#FF6347', 'fire');
        break;
      case 2: // Gelo
        drawSlingshot('#4682B4', '#87CEEB', '#B0E0E6', 'ice');
        break;
      case 3: // Ouro
        drawSlingshot('#DAA520', '#FFD700', '#FFA500', 'gold');
        break;
      case 4: // Arco-íris
        // Gradiente no braço
        const gradient = ctx.createLinearGradient(centerX, centerY + 25 * scale, centerX, centerY - 25 * scale);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.33, '#4ECDC4');
        gradient.addColorStop(0.66, '#45B7D1');
        gradient.addColorStop(1, '#FFA07A');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 25 * scale);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Braços coloridos
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        ctx.strokeStyle = '#00CED1';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX - 20 * scale, centerY - 25 * scale);
        ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        drawSlingshot(null, null, null, 'rainbow');
        break;
      case 5: // Espelho
        // Gradiente prateado/cristal
        const mirrorGradient = ctx.createLinearGradient(centerX, centerY + 25 * scale, centerX, centerY - 25 * scale);
        mirrorGradient.addColorStop(0, '#E0E0E0');
        mirrorGradient.addColorStop(0.5, '#FFFFFF');
        mirrorGradient.addColorStop(1, '#C0C0C0');
        
        ctx.strokeStyle = mirrorGradient;
        ctx.lineWidth = 8 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 25 * scale);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Braços prateados
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        ctx.strokeStyle = '#F0F0F0';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        ctx.strokeStyle = '#A0A0A0';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX - 20 * scale, centerY - 25 * scale);
        ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        // Efeito de brilho cristalino
        for (let i = 0; i < 5; i++) {
          const sparkX = centerX + (Math.random() - 0.5) * 35 * scale;
          const sparkY = centerY + (Math.random() - 0.5) * 25 * scale;
          const sparkSize = 2 + Math.random() * 2;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 6: // Hacker
        // Gradiente verde Matrix
        const hackerGradient = ctx.createLinearGradient(centerX, centerY + 25 * scale, centerX, centerY - 25 * scale);
        hackerGradient.addColorStop(0, '#003300');
        hackerGradient.addColorStop(0.5, '#00AA00');
        hackerGradient.addColorStop(1, '#00FF00');
        
        ctx.strokeStyle = hackerGradient;
        ctx.lineWidth = 8 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 25 * scale);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Braços verdes
        ctx.strokeStyle = '#00AA00';
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        ctx.strokeStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        ctx.strokeStyle = '#00FF41';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX - 20 * scale, centerY - 25 * scale);
        ctx.lineTo(centerX + 20 * scale, centerY - 25 * scale);
        ctx.stroke();

        // Números binários Matrix
        ctx.font = `bold ${8 * scale}px "Courier New", monospace`;
        ctx.fillStyle = '#00FF00';
        ctx.textAlign = 'center';
        const binaryNumbers = ['0', '1', '0', '1', '1'];
        for (let i = 0; i < binaryNumbers.length; i++) {
          const x = centerX + (i - 2) * 8 * scale;
          const y = centerY + (Math.random() - 0.5) * 20 * scale;
          ctx.fillText(binaryNumbers[i], x, y);
        }
        
        // Efeito de brilho
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = '#00FF00';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      
      // Novas Skins (7-34)
      case 7: // Pedra + Musgo
        drawSlingshot('#696969', '#556B2F', '#8FBC8F', null);
        // Adicionar musgo
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#8FBC8F';
          ctx.beginPath();
          ctx.arc(centerX + (i - 1) * 10 * scale, centerY + 5 * scale, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      
      case 8: // Raio
        drawSlingshot('#FFD700', '#FFFF00', '#4169E1', null);
        // Adicionar raios
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2 * scale;
        ctx.shadowBlur = 5 * scale;
        ctx.shadowColor = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(centerX - 15 * scale, centerY - 10 * scale);
        ctx.lineTo(centerX - 10 * scale, centerY);
        ctx.lineTo(centerX - 5 * scale, centerY - 5 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      
      case 9: // Mecânico
        drawSlingshot('#B87333', '#8B7355', '#CD7F32', null);
        // Adicionar engrenagem
        ctx.strokeStyle = '#CD7F32';
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * 8 * scale, centerY + Math.sin(angle) * 8 * scale);
          ctx.stroke();
        }
        break;
      
      case 10: // Tesla
        drawSlingshot('#1E90FF', '#00BFFF', '#87CEEB', null);
        // Faíscas
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2 * scale;
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = '#00BFFF';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX + (i - 1) * 10 * scale, centerY - 15 * scale);
          ctx.lineTo(centerX + (i - 1) * 10 * scale, centerY + 15 * scale);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        break;
      
      case 11: // Neon Cyberpunk
        drawSlingshot('#FF00FF', '#00FFFF', '#FF1493', null);
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = '#FF00FF';
        ctx.fillStyle = '#FF00FF';
        ctx.beginPath();
        ctx.arc(centerX - 10 * scale, centerY, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = '#00FFFF';
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(centerX + 10 * scale, centerY, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      
      case 12: // Holográfico
        drawSlingshot('#E0BBE4', '#957DAD', '#D291BC', null);
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = '#D291BC';
        ctx.fillStyle = '#FEC8D8';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;
      
      case 13: // Dragão
        drawSlingshot('#8B0000', '#FF4500', '#FFD700', null);
        // Olhos de dragão
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = '#FF4500';
        ctx.beginPath();
        ctx.arc(centerX - 8 * scale, centerY - 15 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 8 * scale, centerY - 15 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      
      case 14: // Elfico
        drawSlingshot('#8B4513', '#2E8B57', '#3CB371', null);
        // Runas
        ctx.strokeStyle = '#3CB371';
        ctx.lineWidth = 2 * scale;
        ctx.shadowBlur = 5 * scale;
        ctx.shadowColor = '#2E8B57';
        ctx.font = `${10 * scale}px serif`;
        ctx.fillStyle = '#3CB371';
        ctx.textAlign = 'center';
        ctx.fillText('⟁', centerX, centerY);
        ctx.shadowBlur = 0;
        break;
      
      case 15: // Sombras
        drawSlingshot('#1A1A1A', '#4B0082', '#8B008B', null);
        // Fumaça púrpura
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#8B008B';
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = '#8B008B';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX + (i - 1) * 8 * scale, centerY + 10 * scale, 6 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;
      
      case 16: // Cristal Arcano
        drawSlingshot('#9370DB', '#BA55D3', '#DA70D6', null);
        // Cristais
        ctx.fillStyle = '#DA70D6';
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = '#BA55D3';
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.translate(centerX + (i - 1) * 10 * scale, centerY);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-3 * scale, -3 * scale, 6 * scale, 6 * scale);
          ctx.restore();
        }
        ctx.shadowBlur = 0;
        break;
      
      case 17: // Picolé
        drawSlingshot('#FF6B9D', '#FEC368', '#96E6A1', null);
        // Gotas derretendo
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.arc(centerX - 5 * scale, centerY + 20 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#96E6A1';
        ctx.beginPath();
        ctx.arc(centerX + 5 * scale, centerY + 20 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 18: // Banana
        drawSlingshot('#FFE135', '#FFEB3B', '#FDD835', null);
        // Manchas de banana
        ctx.fillStyle = '#8B7355';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(centerX + (i - 1) * 8 * scale, centerY, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      
      case 19: // Canetinha
        drawSlingshot('#FF0000', '#00FF00', '#0000FF', null);
        // Traços coloridos
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = colors[i];
          ctx.beginPath();
          ctx.moveTo(centerX + (i - 1.5) * 6 * scale, centerY - 10 * scale);
          ctx.lineTo(centerX + (i - 1.5) * 6 * scale, centerY + 10 * scale);
          ctx.stroke();
        }
        break;
      
      case 20: // Inflável
        drawSlingshot('#00CED1', '#48D1CC', '#40E0D0', null);
        // Bolhas
        ctx.strokeStyle = '#40E0D0';
        ctx.lineWidth = 2 * scale;
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX + (i - 1) * 8 * scale, centerY + 15 * scale, 4 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
      
      case 21: // Tubos de Ensaio
        drawSlingshot('#00CED1', '#20B2AA', '#5F9EA0', null);
        // Tubos
        ctx.strokeStyle = '#20B2AA';
        ctx.lineWidth = 3 * scale;
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.rect((centerX - 5 + i * 10) * scale, (centerY - 10) * scale, 3 * scale, 15 * scale);
          ctx.stroke();
        }
        break;
      
      case 22: // Impressão 3D
        drawSlingshot('#FF6347', '#FF7F50', '#FFA07A', null);
        // Camadas
        ctx.strokeStyle = '#FFA07A';
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX - 15 * scale, (centerY - 10 + i * 5) * scale);
          ctx.lineTo(centerX + 15 * scale, (centerY - 10 + i * 5) * scale);
          ctx.stroke();
        }
        break;
      
      case 23: // Bioluminescente
        drawSlingshot('#00FF7F', '#7FFFD4', '#AFEEEE', null);
        ctx.shadowBlur = 20 * scale;
        ctx.shadowColor = '#00FF7F';
        ctx.fillStyle = '#00FF7F';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      
      case 24: // Atômico
        drawSlingshot('#00FA9A', '#00FF7F', '#7CFC00', null);
        // Núcleo e órbitas
        ctx.fillStyle = '#7CFC00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00FF7F';
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, 12 * scale, 6 * scale, i * Math.PI / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      
      case 25: // Ouro Maciço
        drawSlingshot('#FFD700', '#FFA500', '#FF8C00', null);
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      
      case 26: // Fibra de Carbono
        drawSlingshot('#2F4F4F', '#696969', '#808080', null);
        // Textura de fibra
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 1 * scale;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.moveTo((centerX - 10 + i * 2) * scale, (centerY - 15) * scale);
          ctx.lineTo((centerX - 10 + i * 2) * scale, (centerY + 15) * scale);
          ctx.stroke();
        }
        break;
      
      case 27: // Titânio
        drawSlingshot('#C0C0C0', '#A9A9A9', '#D3D3D3', null);
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = '#FFFFFF';
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.arc(centerX - 5 * scale, centerY - 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      
      case 28: // Madeira Petrificada
        drawSlingshot('#8B7355', '#A0826D', '#BC8F8F', null);
        // Anéis de madeira
        ctx.strokeStyle = '#A0826D';
        ctx.lineWidth = 1 * scale;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, i * 4 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      
      case 29: // Ossos
        drawSlingshot('#F5F5DC', '#FFFAF0', '#FFE4B5', null);
        // Caveira mini
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 5 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX - 3 * scale, centerY - 6 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 3 * scale, centerY - 6 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 30: // Abóbora
        drawSlingshot('#FF8C00', '#FFA500', '#FF7F50', null);
        // Cara de abóbora
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        // Olhos
        ctx.beginPath();
        ctx.moveTo(centerX - 5 * scale, centerY - 3 * scale);
        ctx.lineTo(centerX - 2 * scale, centerY - 5 * scale);
        ctx.lineTo(centerX - 5 * scale, centerY - 7 * scale);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + 5 * scale, centerY - 3 * scale);
        ctx.lineTo(centerX + 2 * scale, centerY - 5 * scale);
        ctx.lineTo(centerX + 5 * scale, centerY - 7 * scale);
        ctx.fill();
        break;
      
      case 31: // Bengala Doce
        drawSlingshot('#FF0000', '#FFFFFF', '#FF0000', null);
        // Listras
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect((centerX - 10) * scale, (centerY - 15 + i * 10) * scale, 20 * scale, 4 * scale);
        }
        break;
      
      case 32: // Neve e Luzes
        drawSlingshot('#FFFFFF', '#87CEEB', '#1E90FF', null);
        // Flocos de neve
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2 * scale;
        for (let i = 0; i < 3; i++) {
          const sx = centerX + (i - 1) * 10 * scale;
          const sy = centerY + 15 * scale;
          for (let j = 0; j < 6; j++) {
            const angle = (Math.PI * 2 * j) / 6;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(angle) * 4 * scale, sy + Math.sin(angle) * 4 * scale);
            ctx.stroke();
          }
        }
        break;
      
      case 33: // Futurista
        drawSlingshot('#00FFFF', '#0080FF', '#0040FF', null);
        // HUD
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2 * scale;
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = '#00FFFF';
        ctx.beginPath();
        ctx.rect((centerX - 12) * scale, (centerY - 12) * scale, 24 * scale, 24 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo((centerX - 10) * scale, centerY * scale);
        ctx.lineTo((centerX + 10) * scale, centerY * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      
      case 34: // Pirata
        drawSlingshot('#8B4513', '#A0522D', '#D2691E', null);
        // Corda
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 3 * scale;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX + (i - 1) * 8 * scale, centerY + 15 * scale, 2 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      
      default:
        drawSlingshot('#654321', '#654321', '#333333', null);
    }
  }, [skinId, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        imageRendering: 'crisp-edges'
      }}
    />
  );
};

export default SkinIcon;
