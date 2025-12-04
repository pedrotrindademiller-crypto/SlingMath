import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QuestionModal from './QuestionModal';
import { toast } from 'sonner';
import './Game.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SKINS = {
  0: { 
    name: 'Clássico', 
    color: '#8B4513',
    slingshotColors: { base: '#654321', arms: '#654321', band: '#333333' }
  },
  1: { 
    name: 'Fogo', 
    color: '#FF4500',
    slingshotColors: { base: '#DC143C', arms: '#FF4500', band: '#FF6347' },
    effect: 'fire'
  },
  2: { 
    name: 'Gelo', 
    color: '#00CED1',
    slingshotColors: { base: '#4682B4', arms: '#87CEEB', band: '#B0E0E6' },
    effect: 'ice'
  },
  3: { 
    name: 'Ouro', 
    color: '#FFD700',
    slingshotColors: { base: '#DAA520', arms: '#FFD700', band: '#FFA500' },
    effect: 'gold'
  },
  4: { 
    name: 'Arco-íris', 
    gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A, #98D8C8)',
    slingshotColors: { base: '#FF1493', arms: '#00CED1', band: '#FFD700' },
    effect: 'rainbow'
  },
  5: {
    name: 'Espelho',
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #E0E0E0, #FFFFFF, #C0C0C0, #F0F0F0)',
    slingshotColors: { base: '#C0C0C0', arms: '#E0E0E0', band: '#A0A0A0' },
    effect: 'mirror',
    ricochet: true
  },
  6: {
    name: 'Hacker',
    color: '#00FF00',
    gradient: 'linear-gradient(135deg, #00FF00, #00AA00, #003300, #00FF00)',
    slingshotColors: { base: '#003300', arms: '#00AA00', band: '#00FF00' },
    effect: 'hacker',
    instantKill: true
  }
};

const Game = ({ playerData, playerId, onUpdate }) => {
  const canvasRef = useRef(null);
  const targetsRef = useRef([]);
  const projectileRef = useRef(null);
  const slingshotRef = useRef({ x: 0, y: 0, pulling: false, pullX: 0, pullY: 0 });
  const particlesRef = useRef([]);
  const skinEffectParticlesRef = useRef([]); // Partículas de efeito da skin
  const lastHitPositionRef = useRef(null); // Guardar posição do alvo acertado
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const animationFrameRef = useRef(null);

  // Update slingshot position when canvas size changes
  const updateSlingshotPosition = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    slingshotRef.current = {
      ...slingshotRef.current,
      x: canvas.width / 2,
      y: canvas.height - 80
    };
  };

  const createTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const radius = 30;
    const margin = radius + 10; // Margem de segurança
    const slingshotZone = 120; // Área reservada para o estilingue na parte inferior
    
    // Garantir que os alvos sejam criados apenas na área visível
    const minX = margin;
    const maxX = canvas.width - margin;
    const minY = margin;
    const maxY = canvas.height - slingshotZone - margin;

    return {
      id: Math.random(),
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
      radius: radius,
      velocityX: (Math.random() - 0.5) * 2.5, // Velocidade um pouco reduzida
      velocityY: (Math.random() - 0.5) * 2.5,
      hit: false
    };
  };

  // Explosão vermelha quando acerta o alvo
  const createTargetHitExplosion = (x, y) => {
    const particles = [];
    const particleCount = 40; // Aumentado de 15 para 40 - explosão mais densa
    const redColors = ['#FF0000', '#DC143C', '#8B0000', '#B22222', '#CD5C5C', '#FF6347', '#FF4500', '#FF1493'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 3 + Math.random() * 5; // Velocidade aumentada (era 2-5, agora 3-8)
      
      particles.push({
        x: x,
        y: y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: 5 + Math.random() * 8, // Partículas maiores (era 4-10, agora 5-13)
        color: redColors[Math.floor(Math.random() * redColors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.01, // Decay reduzido (era 0.03-0.05, agora 0.015-0.025) - dura ~40-66 frames
        type: 'target-hit'
      });
    }
    
    return particles;
  };

  // Explosão verde Matrix quando usa skin Hacker
  const createHackerExplosion = (x, y) => {
    const particles = [];
    const particleCount = 25;
    const hackColors = ['#00FF00', '#00AA00', '#00FF41', '#00DD00'];
    const hackChars = ['0', '1', 'H', 'A', 'C', 'K'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 3 + Math.random() * 4;
      
      particles.push({
        x: x,
        y: y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: 6 + Math.random() * 8,
        color: hackColors[Math.floor(Math.random() * hackColors.length)],
        life: 1.0,
        decay: 0.02 + Math.random() * 0.015,
        type: 'hacker',
        char: hackChars[Math.floor(Math.random() * hackChars.length)]
      });
    }
    
    return particles;
  };

  // Explosão de confetes quando acerta a questão
  const createConfettiExplosion = (x, y) => {
    const particles = [];
    const particleCount = 30;
    const confettiColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#FFD700', '#FF69B4', '#00CED1',
      '#FF1493', '#00FF7F', '#FFB6C1', '#87CEEB'
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
      const speed = 4 + Math.random() * 5;
      
      particles.push({
        x: x,
        y: y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 2, // Impulso para cima
        size: 5 + Math.random() * 8,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        type: 'confetti'
      });
    }
    
    return particles;
  };

  // Criar efeitos visuais para as skins do estilingue
  const createSkinEffectParticle = (skinId, x, y) => {
    const effect = SKINS[skinId]?.effect;
    if (!effect) return null;

    const particle = { x, y, life: 1.0 };

    switch (effect) {
      case 'fire': // Chamas
        return {
          ...particle,
          velocityX: (Math.random() - 0.5) * 0.5,
          velocityY: -1 - Math.random() * 2,
          size: 3 + Math.random() * 4,
          color: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'][Math.floor(Math.random() * 4)],
          decay: 0.04 + Math.random() * 0.02,
          type: 'fire'
        };
      
      case 'ice': // Flocos de neve
        return {
          ...particle,
          velocityX: (Math.random() - 0.5) * 1,
          velocityY: 0.5 + Math.random() * 1,
          size: 2 + Math.random() * 3,
          color: ['#FFFFFF', '#E0FFFF', '#B0E0E6'][Math.floor(Math.random() * 3)],
          decay: 0.02 + Math.random() * 0.01,
          type: 'ice'
        };
      
      case 'gold': // Partículas douradas brilhantes
        return {
          ...particle,
          velocityX: (Math.random() - 0.5) * 2,
          velocityY: -0.5 - Math.random() * 1,
          size: 2 + Math.random() * 3,
          color: ['#FFD700', '#FFA500', '#FFFF00'][Math.floor(Math.random() * 3)],
          decay: 0.03 + Math.random() * 0.02,
          type: 'gold'
        };
      
      case 'rainbow': // Partículas coloridas cromadas
        return {
          ...particle,
          velocityX: (Math.random() - 0.5) * 1.5,
          velocityY: -0.5 - Math.random() * 1.5,
          size: 2 + Math.random() * 4,
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FF1493'][Math.floor(Math.random() * 6)],
          decay: 0.025 + Math.random() * 0.015,
          type: 'rainbow'
        };
      
      case 'mirror': // Partículas de cristal brilhantes
        return {
          ...particle,
          velocityX: (Math.random() - 0.5) * 1,
          velocityY: -0.3 - Math.random() * 1,
          size: 2 + Math.random() * 3,
          color: ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#F0F0F0'][Math.floor(Math.random() * 4)],
          decay: 0.02 + Math.random() * 0.01,
          type: 'mirror'
        };
      
      case 'hacker': // Partículas de código verde Matrix
        const numbers = ['0', '1'];
        return {
          ...particle,
          velocityX: (Math.random() - 0.5) * 0.5,
          velocityY: 1 + Math.random() * 2, // Caindo como Matrix
          size: 8 + Math.random() * 4,
          color: ['#00FF00', '#00AA00', '#00FF41'][Math.floor(Math.random() * 3)],
          decay: 0.015 + Math.random() * 0.01,
          type: 'hacker',
          char: numbers[Math.floor(Math.random() * numbers.length)]
        };
      
      default:
        return null;
    }
  };

  // Initialize targets and slingshot position
  useEffect(() => {
    const initialTargets = [];
    for (let i = 0; i < 3; i++) {
      const target = createTarget();
      if (target) initialTargets.push(target);
    }
    targetsRef.current = initialTargets;
    
    // Set initial slingshot position
    updateSlingshotPosition();
    
    // Update on window resize
    const handleResize = () => {
      updateSlingshotPosition();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add global mouse/touch listeners to handle events outside canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleGlobalMove = (e) => {
      if (!gameActive) return;
      const slingshot = slingshotRef.current;
      if (!slingshot.pulling) return;

      // Obter posição considerando eventos fora do canvas
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      const pos = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
      
      // Definir limites para puxar o estilingue
      const maxPullDistance = 150;
      const minY = slingshot.y; // Não deixar puxar PARA CIMA do estilingue
      const maxY = canvas.height - 20; // NÃO deixar puxar para fora embaixo (20px de margem)
      const minX = 20; // Margem esquerda
      const maxX = canvas.width - 20; // Margem direita
      
      let pullX = pos.x;
      let pullY = pos.y;
      
      // Aplicar limites: Só pode puxar para baixo mas NÃO além da tela
      pullY = Math.max(minY, Math.min(maxY, pullY)); // Entre o estilingue e o fim da tela
      pullX = Math.max(minX, Math.min(maxX, pullX)); // Dentro dos limites laterais
      
      // Calcular distância do centro do estilingue
      const dx = pullX - slingshot.x;
      const dy = pullY - slingshot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Se ultrapassar a distância máxima, limitar ao raio máximo
      if (distance > maxPullDistance) {
        const angle = Math.atan2(dy, dx);
        pullX = slingshot.x + Math.cos(angle) * maxPullDistance;
        pullY = slingshot.y + Math.sin(angle) * maxPullDistance;
        
        // Garantir que está dentro dos limites após aplicar distância máxima
        pullY = Math.max(minY, Math.min(maxY, pullY));
        pullX = Math.max(minX, Math.min(maxX, pullX));
      }
      
      slingshotRef.current = { ...slingshot, pullX, pullY };
    };

    const handleGlobalUp = (e) => {
      if (!gameActive) return;
      const slingshot = slingshotRef.current;
      if (!slingshot.pulling) return;

      const skinConfig = SKINS[playerData?.selectedSkin || 0];
      
      // Skin Hacker: Destrói TODOS os alvos instantaneamente
      if (skinConfig?.instantKill) {
        // Marcar todos os alvos como atingidos
        targetsRef.current = targetsRef.current.map(target => {
          if (!target.hit) {
            // Criar explosão verde em cada alvo
            const hackExplosion = createHackerExplosion(target.x, target.y);
            particlesRef.current = [...particlesRef.current, ...hackExplosion];
          }
          return { ...target, hit: true };
        });
        
        // Pegar o primeiro alvo para a questão
        const firstTarget = targetsRef.current[0];
        if (firstTarget) {
          lastHitPositionRef.current = { x: firstTarget.x, y: firstTarget.y };
        }
        
        slingshotRef.current = { ...slingshot, pulling: false, pullX: 0, pullY: 0 };
        handleTargetHit();
        return;
      }

      const dx = slingshot.x - slingshot.pullX;
      const dy = slingshot.y - slingshot.pullY;

      // Aumentar a força do tiro
      const powerMultiplier = 5;

      projectileRef.current = {
        x: slingshot.pullX,
        y: slingshot.pullY,
        radius: 10,
        velocityX: dx / powerMultiplier,
        velocityY: dy / powerMultiplier
      };

      slingshotRef.current = { ...slingshot, pulling: false, pullX: 0, pullY: 0 };
    };

    // Add listeners to document to catch events outside canvas
    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalUp);
    document.addEventListener('touchend', handleGlobalUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalUp);
      document.removeEventListener('touchend', handleGlobalUp);
    };
  }, [gameActive]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Update slingshot position for current canvas size
    if (slingshotRef.current.x === 0 || slingshotRef.current.y === 0) {
      slingshotRef.current = {
        ...slingshotRef.current,
        x: canvas.width / 2,
        y: canvas.height - 80
      };
    }

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw targets (somente se o jogo estiver ativo)
      if (gameActive) {
        targetsRef.current = targetsRef.current.map(target => {
          // NÃO desenha alvos que foram acertados (explodidos)
          if (target.hit) {
            return target; // Mantém no array mas não desenha
          }

        // Update position
        let newX = target.x + target.velocityX;
        let newY = target.y + target.velocityY;

        const slingshotZone = 120; // Área reservada para o estilingue
        const minX = target.radius;
        const maxX = canvas.width - target.radius;
        const minY = target.radius;
        const maxY = canvas.height - slingshotZone;

        // Bounce off walls - mantém alvos na área visível
        if (newX < minX) {
          target.velocityX = Math.abs(target.velocityX);
          newX = minX;
        } else if (newX > maxX) {
          target.velocityX = -Math.abs(target.velocityX);
          newX = maxX;
        }
        
        if (newY < minY) {
          target.velocityY = Math.abs(target.velocityY);
          newY = minY;
        } else if (newY > maxY) {
          target.velocityY = -Math.abs(target.velocityY);
          newY = maxY;
        }

        // Draw target (APENAS alvos não acertados)
        ctx.save();
        ctx.beginPath();
        ctx.arc(newX, newY, target.radius, 0, Math.PI * 2);
        
        // Gradient fill
        const gradient = ctx.createRadialGradient(newX, newY, 0, newX, newY, target.radius);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#FF8E53');
        gradient.addColorStop(1, '#FE6B8B');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Bullseye
        ctx.beginPath();
        ctx.arc(newX, newY, target.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(newX, newY, target.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#FF6B6B';
        ctx.fill();
        ctx.restore();

        return { ...target, x: newX, y: newY };
        });
      }

      // Update and draw projectile (somente se o jogo estiver ativo)
      if (gameActive && projectileRef.current) {
        const proj = projectileRef.current;
        const newX = proj.x + proj.velocityX;
        const newY = proj.y + proj.velocityY;
        const newVelocityY = proj.velocityY + 0.3; // Gravity

        // Check collision with targets
        let hit = false;
        targetsRef.current = targetsRef.current.map(target => {
          if (target.hit) return target;

          const dx = newX - target.x;
          const dy = newY - target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < target.radius + proj.radius) {
            hit = true;
            // Salvar posição do alvo acertado para usar depois
            lastHitPositionRef.current = { x: target.x, y: target.y };
            
            // 💥 Explosão VERMELHA ao acertar o alvo
            const hitExplosion = createTargetHitExplosion(target.x, target.y);
            particlesRef.current = [...particlesRef.current, ...hitExplosion];
            
            handleTargetHit();
            
            return { ...target, hit: true };
          }
          return target;
        });

        if (hit) {
          projectileRef.current = null;
        } else {
          // Check for ricochet (Skin Espelho)
          const skinConfig = SKINS[playerData?.selectedSkin || 0];
          const canRicochet = skinConfig?.ricochet && !proj.hasRicocheted;
          
          let shouldRemove = false;
          let newVelocityX = proj.velocityX;
          
          // Ricochet nas paredes laterais
          if (canRicochet && (newX < proj.radius || newX > canvas.width - proj.radius)) {
            newVelocityX = -proj.velocityX; // Inverte direção horizontal
            proj.hasRicocheted = true;
          } else if (newX < 0 || newX > canvas.width || newY > canvas.height) {
            // Remove if out of bounds (sem ricochete ou já ricocheteou)
            shouldRemove = true;
          }
          
          if (shouldRemove) {
            projectileRef.current = null;
          } else {
          // Draw projectile
          ctx.save();
          ctx.beginPath();
          ctx.arc(newX, newY, proj.radius, 0, Math.PI * 2);
          
          const skinConfig = SKINS[playerData?.selectedSkin || 0];
          if (skinConfig.gradient) {
            const grad = ctx.createRadialGradient(newX, newY, 0, newX, newY, proj.radius);
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            colors.forEach((color, i) => {
              grad.addColorStop(i / colors.length, color);
            });
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = skinConfig.color;
          }
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();

            projectileRef.current = {
              ...proj,
              x: newX,
              y: newY,
              velocityX: newVelocityX,
              velocityY: newVelocityY
            };
          }
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update particle position
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityY += 0.2; // Gravity
        particle.life -= particle.decay;

        // Update rotation for confetti
        if (particle.type === 'confetti' && particle.rotation !== undefined) {
          particle.rotation += particle.rotationSpeed;
        }

        // Draw particle if still alive
        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          
          if (particle.type === 'confetti') {
            // Draw confetti as rotating rectangles
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillRect(-particle.size / 2, -particle.size, particle.size, particle.size * 2);
          } else {
            // Draw regular explosion particles as circles
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
          return true;
        }
        return false;
      });

      // Update and draw skin effect particles
      const skinId = playerData?.selectedSkin || 0;
      const skinConfig = SKINS[skinId];
      
      // Create new skin effect particles
      if (skinConfig?.effect && Math.random() < 0.3) {
        const slingshot = slingshotRef.current;
        // Criar partículas ao redor do estilingue
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = Math.random() * 60 - 20;
        const newParticle = createSkinEffectParticle(skinId, slingshot.x + offsetX, slingshot.y + offsetY);
        if (newParticle) {
          skinEffectParticlesRef.current.push(newParticle);
        }
      }

      // Update and draw skin effect particles
      skinEffectParticlesRef.current = skinEffectParticlesRef.current.filter(particle => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.life -= particle.decay;

        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          
          if (particle.type === 'ice') {
            // Flocos de neve (estrelinhas)
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI * 2 * i) / 6;
              const x = particle.x + Math.cos(angle) * particle.size;
              const y = particle.y + Math.sin(angle) * particle.size;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
          } else if (particle.type === 'mirror') {
            // Cristais brilhantes
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Adicionar brilho extra
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Outros efeitos como círculos brilhantes
            ctx.shadowBlur = particle.type === 'gold' ? 10 : 5;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
          return true;
        }
        return false;
      });

      // Draw slingshot (Y shape) com cores personalizadas - somente se o jogo estiver ativo
      if (gameActive) {
        const slingshot = slingshotRef.current;
        const colors = skinConfig?.slingshotColors || { base: '#654321', arms: '#654321', band: '#333333' };
        
        ctx.save();
      
      // Handle (base do Y)
      ctx.strokeStyle = colors.base;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      
      // Efeito especial arco-íris
      if (skinConfig?.effect === 'rainbow') {
        const gradient = ctx.createLinearGradient(slingshot.x, slingshot.y + 40, slingshot.x, slingshot.y - 40);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.25, '#4ECDC4');
        gradient.addColorStop(0.5, '#45B7D1');
        gradient.addColorStop(0.75, '#FFA07A');
        gradient.addColorStop(1, '#98D8C8');
        ctx.strokeStyle = gradient;
      }
      
      ctx.beginPath();
      ctx.moveTo(slingshot.x, slingshot.y + 40);
      ctx.lineTo(slingshot.x, slingshot.y);
      ctx.stroke();
      
      // Left arm of Y
      ctx.strokeStyle = colors.arms;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(slingshot.x, slingshot.y);
      ctx.lineTo(slingshot.x - 30, slingshot.y - 40);
      ctx.stroke();
      
      // Right arm of Y
      ctx.beginPath();
      ctx.moveTo(slingshot.x, slingshot.y);
      ctx.lineTo(slingshot.x + 30, slingshot.y - 40);
      ctx.stroke();

      // Band (elástico)
      ctx.strokeStyle = colors.band;
      if (slingshot.pulling) {
        // Desenhar linha de previsão para Skin Espelho
        const projSkinConfig = SKINS[playerData?.selectedSkin || 0];
        if (projSkinConfig?.ricochet) {
          ctx.save();
          ctx.strokeStyle = 'rgba(192, 192, 192, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          // Calcular trajetória
          const dx = (slingshot.x - slingshot.pullX) / 5;
          const dy = (slingshot.y - slingshot.pullY) / 5;
          
          let predX = slingshot.pullX;
          let predY = slingshot.pullY;
          let predVX = dx;
          let predVY = dy;
          let hasRicocheted = false;
          
          ctx.beginPath();
          ctx.moveTo(predX, predY);
          
          // Simular trajetória
          for (let i = 0; i < 100; i++) {
            predX += predVX;
            predY += predVY;
            predVY += 0.3; // Gravidade
            
            // Ricochet nas paredes
            if (!hasRicocheted && (predX < 10 || predX > canvas.width - 10)) {
              predVX = -predVX;
              hasRicocheted = true;
              
              // Marcar ponto de ricochete
              ctx.lineTo(predX, predY);
              ctx.stroke();
              
              // Nova linha após ricochete
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
              ctx.beginPath();
              ctx.moveTo(predX, predY);
            }
            
            ctx.lineTo(predX, predY);
            
            // Parar se sair da tela
            if (predY > canvas.height || predX < 0 || predX > canvas.width) break;
          }
          
          ctx.stroke();
          ctx.restore();
        }
        
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(slingshot.x - 30, slingshot.y - 40);
        ctx.lineTo(slingshot.pullX, slingshot.pullY);
        ctx.lineTo(slingshot.x + 30, slingshot.y - 40);
        ctx.stroke();

        // Projectile on sling (com cor da skin)
        ctx.beginPath();
        ctx.arc(slingshot.pullX, slingshot.pullY, 10, 0, Math.PI * 2);
        
        if (projSkinConfig?.effect === 'rainbow') {
          const grad = ctx.createRadialGradient(slingshot.pullX, slingshot.pullY, 0, slingshot.pullX, slingshot.pullY, 10);
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
          colors.forEach((color, i) => {
            grad.addColorStop(i / colors.length, color);
          });
          ctx.fillStyle = grad;
        } else if (projSkinConfig?.effect === 'mirror') {
          const grad = ctx.createRadialGradient(slingshot.pullX, slingshot.pullY, 0, slingshot.pullX, slingshot.pullY, 10);
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.5, '#E0E0E0');
          grad.addColorStop(1, '#C0C0C0');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = projSkinConfig.color || '#8B4513';
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(slingshot.x - 30, slingshot.y - 40);
        ctx.lineTo(slingshot.x + 30, slingshot.y - 40);
        ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playerData]); // Removido gameActive das dependências para que o loop continue sempre

  const handleTargetHit = async () => {
    setGameActive(false);
    
    // Aguardar 2 segundos para ver a explosão vermelha completamente ANTES de mostrar a questão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await axios.get(`${API}/question/${playerData.questionLevel}`);
      setCurrentQuestion(response.data);
      setShowQuestion(true);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Erro ao carregar questão');
      setGameActive(true);
    }
  };

  const handleAnswerSubmit = async (selectedAnswer) => {
    try {
      const response = await axios.post(`${API}/answer`, {
        playerId,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        level: currentQuestion.level
      });

      if (response.data.correct) {
        toast.success(`Correto! +5 moedas 🪙`);
        // Sem animação ao acertar a questão
        // Apenas ganha as moedas
      } else {
        toast.error(`Incorreto! A resposta era ${currentQuestion.correctAnswer}`);
      }
      
      // Limpar posição salva
      lastHitPositionRef.current = null;

      await onUpdate();
      setShowQuestion(false);
      setCurrentQuestion(null);
      
      // Remove hit targets and add new ones
      const remaining = targetsRef.current.filter(t => !t.hit);
      const newTargets = [...remaining];
      while (newTargets.length < 3) {
        const target = createTarget();
        if (target) newTargets.push(target);
      }
      targetsRef.current = newTargets;
      
      setGameActive(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const getEventPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (!gameActive) return; // Não permite atirar se o jogo não estiver ativo
    e.preventDefault();
    const pos = getEventPosition(e);

    const slingshot = slingshotRef.current;
    const dx = pos.x - slingshot.x;
    const dy = pos.y - slingshot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 80 && !projectileRef.current) {
      slingshotRef.current = { ...slingshot, pulling: true, pullX: pos.x, pullY: pos.y };
    }
  };

  const handleMouseMove = (e) => {
    // Movimento no canvas - os listeners globais já cuidam de tudo
    if (e.cancelable) e.preventDefault();
  };

  const handleMouseUp = (e) => {
    if (!gameActive) return; // Não permite atirar se o jogo não estiver ativo
    e.preventDefault();
    const slingshot = slingshotRef.current;
    if (!slingshot.pulling) return;

    const dx = slingshot.x - slingshot.pullX;
    const dy = slingshot.y - slingshot.pullY;

    // Aumentar a força do tiro (divisor menor = mais força)
    const powerMultiplier = 5; // Era 10, agora é 5 = 2x mais força

    projectileRef.current = {
      x: slingshot.pullX,
      y: slingshot.pullY,
      radius: 10,
      velocityX: dx / powerMultiplier,
      velocityY: dy / powerMultiplier
    };

    slingshotRef.current = { ...slingshot, pulling: false, pullX: 0, pullY: 0 };
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="info-card" data-testid="level-display">
          <span className="info-label">Nível</span>
          <span className="info-value">{playerData?.questionLevel || 1}</span>
        </div>
        <div className="info-card" data-testid="skin-display">
          <span className="info-label">Skin</span>
          <span className="info-value">{SKINS[playerData?.selectedSkin || 0].name}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="game-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        data-testid="game-canvas"
        style={{ touchAction: 'none' }}
      />

      <div className="game-instructions">
        <p>🎯 Arraste e solte o estilingue para atirar nos alvos!</p>
        <p>📚 Acerte questões matemáticas para ganhar moedas</p>
      </div>

      {showQuestion && currentQuestion && (
        <QuestionModal
          question={currentQuestion}
          onAnswer={handleAnswerSubmit}
          onClose={() => {
            setShowQuestion(false);
            setGameActive(true);
          }}
        />
      )}
    </div>
  );
};

export default Game;