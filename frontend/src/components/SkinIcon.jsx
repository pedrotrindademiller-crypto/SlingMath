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
