'use client';

import { useEffect, useRef, useState } from 'react';
import GameLayout from './GameLayout';

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Game state
  const birdRef = useRef({
    x: 50,
    y: 200,
    velocity: 0,
    width: 30,
    height: 30
  });
  
  interface Pipe {
    x: number;
    topHeight: number;
    bottomY: number;
    scored?: boolean;
  }

  const pipesRef = useRef<Pipe[]>([]);
  
  const animationRef = useRef<number>();
  const lastPipeTimeRef = useRef(0);
  const gameAreaRef = useRef({ width: 400, height: 600 });
  
  // Constants
  const GRAVITY = 0.5;
  const JUMP_FORCE = -10;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 200;
  const PIPE_SPEED = 2;
  
  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Set canvas size
    const updateCanvasSize = () => {
      const size = Math.min(400, window.innerWidth - 40);
      canvas.width = size;
      canvas.height = 600;
      gameAreaRef.current = { width: size, height: 600 };
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Game loop
  const gameLoop = (timestamp: DOMHighResTimeStamp) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update bird
    const bird = birdRef.current;
    
    // Only update game state if the game is active
    if (gameStarted && !gameOver) {
      bird.velocity += GRAVITY;
      bird.y += bird.velocity;
      
      // Check for collisions with ground/ceiling
      if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        setGameOver(true);
      }
      
      // Update pipes
      const now = Date.now();
      if (now - lastPipeTimeRef.current > 1500) { // Spawn new pipe every 1.5 seconds
        const minHeight = 50;
        const maxHeight = canvas.height - PIPE_GAP - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipesRef.current.push({
          x: canvas.width,
          topHeight,
          bottomY: topHeight + PIPE_GAP
        });
        
        lastPipeTimeRef.current = now;
      }
      
      // Move pipes and check for collisions
      pipesRef.current = pipesRef.current.filter(pipe => {
        pipe.x -= PIPE_SPEED;
        
        // Check for collision with bird
        if (
          bird.x + bird.width > pipe.x && 
          bird.x < pipe.x + PIPE_WIDTH &&
          (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
          setGameOver(true);
        }
        
        // Score point if bird passes a pipe
        if (pipe.x + PIPE_WIDTH < bird.x && !pipe.scored) {
          setScore(prev => prev + 1);
          pipe.scored = true;
        }
        
        // Remove pipes that are off screen
        return pipe.x > -PIPE_WIDTH;
      });
    }
    
    // Draw background
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pipes
    ctx.fillStyle = '#2ecc71';
    pipesRef.current.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    });
    
    // Draw bird
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), canvas.width / 2, 50);
    
    // Draw high score
    ctx.font = '16px Arial';
    ctx.fillText(`High: ${highScore}`, canvas.width / 2, 80);
    
    // Draw game over screen
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '16px Arial';
      ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 50);
      return; // Stop the game loop
    } else if (!gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Flappy Bird', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '16px Arial';
      ctx.fillText('Click or press SPACE to start', canvas.width / 2, canvas.height / 2 + 20);
      
      // Start the game loop when not started
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }
    
    // Continue the game loop if the game is running
    if (gameStarted && !gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Start/restart game
  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Reset game state
    birdRef.current = {
      x: 50,
      y: canvas.height / 2 - 15,
      velocity: 0,
      width: 30,
      height: 30
    };
    
    pipesRef.current = [];
    lastPipeTimeRef.current = 0;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    
    // Clear any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start the game loop
    animationRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Update high score when game is over
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyBirdHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);
  
  // Handle jump
  const jump = () => {
    if (!gameStarted) {
      startGame();
    } else if (!gameOver) {
      birdRef.current.velocity = JUMP_FORCE;
    } else {
      startGame();
    }
  };
  
  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    
    // Mouse/touch controls
    const handlePointerDown = () => {
      jump();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('pointerdown', handlePointerDown);
    
    // Initial game loop start
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [jump, gameLoop]);
  
  return (
    <GameLayout
      title="Flappy Bird"
      description="Navigate the bird through the pipes!"
      instructions="Click or press SPACE to make the bird flap. Avoid the pipes and don't hit the ground or ceiling!"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-300 rounded-lg bg-blue-100 cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Press SPACE or tap to jump</p>
          <p className="text-sm text-gray-500">Avoid the pipes and don't hit the ground!</p>
        </div>
      </div>
    </GameLayout>
  );
}
