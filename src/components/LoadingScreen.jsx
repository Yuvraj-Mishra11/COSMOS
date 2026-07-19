import React, { useEffect, useRef, useState } from 'react';

const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const LoadingScreen = ({ onLoadingComplete }) => {
  const canvasRef = useRef(null);
  const [showTagline, setShowTagline] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const stateRef = useRef({ taglineShown: false, fadeStarted: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;
    let startTime = null;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    const generateTextPoints = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      tempCanvas.width = window.innerWidth;
      tempCanvas.height = window.innerHeight;
      
      const fontSize = Math.min(window.innerWidth * 0.15, 140);
      tempCtx.font = `900 ${fontSize}px "Inter", sans-serif`;
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      
      tempCtx.fillText('COSMOS', tempCanvas.width / 2, tempCanvas.height / 2 - 30);
      
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      const points = [];
      
      for (let y = 0; y < tempCanvas.height; y += 4) {
        for (let x = 0; x < tempCanvas.width; x += 4) {
          if (data[(y * tempCanvas.width + x) * 4 + 3] > 128) {
            points.push({ x, y });
          }
        }
      }
      return points.sort(() => Math.random() - 0.5);
    };

    let textPoints = generateTextPoints();
    if (textPoints.length === 0) {
      textPoints = [{ x: canvas.width / 2, y: canvas.height / 2 }];
    }

    class Star {
      constructor(index, totalStars) {
        this.index = index;
        this.startX = Math.random() * canvas.width;
        this.startY = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.size = Math.random() * 1 + 1; // 1 to 2px
        this.baseAlpha = Math.random() * 0.5 + 0.3; // 0.3 to 0.8

        const arm = index % 2;
        const angle = (index / totalStars) * Math.PI * 6; // 3 wraps
        this.spiralRadius = Math.pow(index / totalStars, 0.8) * Math.min(canvas.width, canvas.height) * 0.35;
        this.spiralAngleBase = angle + arm * Math.PI;

        const pt = textPoints[index % textPoints.length];
        this.textX = pt.x;
        this.textY = pt.y;

        this.p0EndX = this.startX + this.vx * 2000;
        this.p0EndY = this.startY + this.vy * 2000;
        
        const rotAt4k = 2000 * 0.0005; // spiral rotation at t=4000
        this.p1EndX = canvas.width / 2 + Math.cos(this.spiralAngleBase + rotAt4k) * this.spiralRadius;
        this.p1EndY = canvas.height / 2 + Math.sin(this.spiralAngleBase + rotAt4k) * this.spiralRadius;
      }

      updateAndDraw(ctx, t) {
        let x, y, alpha;

        if (t < 2000) {
          const p = t / 2000;
          alpha = p * this.baseAlpha;
          x = this.startX + this.vx * t;
          y = this.startY + this.vy * t;
        } else if (t < 4000) {
          const p = easeInOutCubic((t - 2000) / 2000);
          const rot = (t - 2000) * 0.0005;
          const targetX = canvas.width / 2 + Math.cos(this.spiralAngleBase + rot) * this.spiralRadius;
          const targetY = canvas.height / 2 + Math.sin(this.spiralAngleBase + rot) * this.spiralRadius;
          
          alpha = this.baseAlpha;
          x = this.p0EndX + (targetX - this.p0EndX) * p;
          y = this.p0EndY + (targetY - this.p0EndY) * p;
        } else if (t < 6000) {
          const p = easeInOutCubic((t - 4000) / 2000);
          alpha = this.baseAlpha;
          x = this.p1EndX + (this.textX - this.p1EndX) * p;
          y = this.p1EndY + (this.textY - this.p1EndY) * p;
        } else {
          const p = Math.min(1, Math.max(0, (t - 6000) / 1000));
          alpha = this.baseAlpha * (1 - p);
          x = this.textX;
          y = this.textY;
        }

        if (alpha > 0) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const initStars = () => {
      let currentPoints = generateTextPoints();
      if (currentPoints.length === 0) currentPoints = [{ x: canvas.width / 2, y: canvas.height / 2 }];
      return Array.from({ length: 200 }, (_, i) => new Star(i, 200));
    };
    
    let stars = initStars();

    const handleResize = () => {
      setSize();
    };
    window.addEventListener('resize', handleResize);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const t = timestamp - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => star.updateAndDraw(ctx, t));

      if (t >= 6000) {
        const textAlpha = Math.min(1, (t - 6000) / 1000);
        ctx.globalAlpha = textAlpha;
        const fontSize = Math.min(window.innerWidth * 0.15, 140);
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 - 30;

        ctx.shadowBlur = 15; // Soft glow
        ctx.fillText('COSMOS', cx, cy);
        ctx.shadowBlur = 0;
      }

      if (t >= 7000 && !stateRef.current.taglineShown) {
        stateRef.current.taglineShown = true;
        setShowTagline(true);
      }

      if (t >= 8000 && !stateRef.current.fadeStarted) {
        stateRef.current.fadeStarted = true;
        setIsFadingOut(true);
      }

      if (t >= 9000) {
        if (onLoadingComplete) onLoadingComplete();
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onLoadingComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-[#0a0a0a] transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <style>{`
        @keyframes subtleFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tagline-anim {
          animation: subtleFadeUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
      
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      
      <div className="absolute top-1/2 left-0 w-full text-center mt-[60px] pointer-events-none">
        {showTagline && (
          <p className="tagline-anim font-['Inter'] font-light text-[1.2rem] text-[#888899] tracking-[0.15em] m-0">
            Explore the Universe of Knowledge
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
