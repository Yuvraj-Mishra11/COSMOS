import { useEffect, useRef } from 'react';

const CursorParticles = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const trailRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticles = () => {
      const count = 150;
      const particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          radius: Math.random() * 3 + 2,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          twinkleOffset: Math.random() * Math.PI * 2,
          hue: 220 + Math.random() * 30 // Blue-white tint
        });
      }
      particlesRef.current = particles;
    };
    createParticles();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      for (let i = 0; i < 3; i++) {
        trailRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          life: 1,
          radius: Math.random() * 4 + 2
        });
      }
      if (trailRef.current.length > 30) {
        trailRef.current = trailRef.current.slice(-30);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      particlesRef.current.forEach((p) => {
        // Twinkle/blink effect
        p.twinkleOffset += p.twinkleSpeed;
        const blink = 0.5 + 0.5 * Math.sin(p.twinkleOffset);
        const glowPulse = 0.6 + 0.4 * Math.sin(p.twinkleOffset * 0.7);

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120 && mouseX > 0) {
          const force = (120 - dist) / 120;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.3;
          p.vy += Math.sin(angle) * force * 0.3;
        }

        p.vx += (p.baseX - p.x) * 0.005;
        p.vy += (p.baseY - p.y) * 0.005;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        const finalOpacity = p.opacity * (0.4 + 0.6 * blink);
        const glowSize = p.radius * (3 + 2 * glowPulse);

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.9})`);
        gradient.addColorStop(0.2, `rgba(220, 235, 255, ${finalOpacity * 0.5})`);
        gradient.addColorStop(0.6, `rgba(180, 200, 255, ${finalOpacity * 0.2})`);
        gradient.addColorStop(1, `rgba(180, 200, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core star (bright center)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.fill();

        // Tiny bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 1.2})`;
        ctx.fill();
      });

      // Trail
      trailRef.current.forEach((t) => {
        t.life -= 0.025;
        if (t.life <= 0) return;
        const alpha = t.life * 0.6;
        const radius = t.radius * t.life * 1.5;
        
        const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(200, 215, 255, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(200, 215, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      trailRef.current = trailRef.current.filter(t => t.life > 0);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
};

export default CursorParticles;
