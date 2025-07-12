'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import GameLayout from './GameLayout';

const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 8;

interface Brick {
  x: number;
  y: number;
  status: number;
}

export default function Breakout() {
  const { updateScore } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const animationRef = useRef<number>();
  const paddleX = useRef(0);
  const ballX = useRef(0);
  const ballY = useRef(0);
  const ballDX = useRef(4);
  const ballDY = useRef(-4);
  const rightPressed = useRef(false);
  const leftPressed = useRef(false);
  const bricks = useRef<Brick[][]>([]);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('breakoutHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    initGame();
    initBricks();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed.current = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed.current = true;
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed.current = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas.current) return;
      const relativeX = e.clientX - canvas.current.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.current.width) {
        paddleX.current = relativeX - PADDLE_WIDTH / 2;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused && !gameOver && !gameWon) {
      animationRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, gameOver, gameWon]);

  const initGame = () => {
    if (!canvasRef.current) return;
    
    canvas.current = canvasRef.current;
    ctx.current = canvas.current.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.current.getBoundingClientRect();
    
    canvas.current.width = rect.width * dpr;
    canvas.current.height = 400 * dpr;
    
    if (ctx.current) {
      ctx.current.scale(dpr, dpr);
    }

    ballX.current = canvas.current.width / (2 * dpr);
    ballY.current = canvas.current.height / (2 * dpr);
    paddleX.current = (canvas.current.width / (2 * dpr)) - (PADDLE_WIDTH / 2);
  };

  const initBricks = () => {
    const bricksArray: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricksArray[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricksArray[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    bricks.current = bricksArray;
  };

  const collisionDetection = () => {
    if (!canvas.current || !ctx.current) return;
    
    const dpr = window.devicePixelRatio || 1;
    const brickWidth = (canvas.current.width / dpr - BRICK_OFFSET_LEFT * 2) / BRICK_COLUMN_COUNT - BRICK_PADDING;
    const brickHeight = 20;
    
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = bricks.current[c][r];
        if (b.status === 1) {
          const brickX = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (brickHeight + BRICK_PADDING) + BRICK_OFFSET_TOP;
          
          if (
            ballX.current > brickX &&
            ballX.current < brickX + brickWidth &&
            ballY.current > brickY &&
            ballY.current < brickY + brickHeight
          ) {
            ballDY.current = -ballDY.current;
            b.status = 0;
            const points = 10;
            setScore(prev => {
                const newScore = prev + points;
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('breakoutHighScore', newScore.toString());
                  updateScore('breakout', newScore, 'highScore');
                }
                updateScore('breakout', points, 'score');
                return newScore;
              });
            
            // Check if all bricks are destroyed
            if (bricks.current.every(column => column.every(brick => brick.status === 0))) {
              setGameWon(true);
            }
          }
        }
      }
    }
  };

  const drawBall = () => {
    if (!ctx.current) return;
    
    ctx.current.beginPath();
    ctx.current.arc(ballX.current, ballY.current, BALL_RADIUS, 0, Math.PI * 2);
    ctx.current.fillStyle = '#0095DD';
    ctx.current.fill();
    ctx.current.closePath();
  };

  const drawPaddle = () => {
    if (!ctx.current || !canvas.current) return;
    
    const dpr = window.devicePixelRatio || 1;
    const paddleY = (canvas.current.height / dpr) - PADDLE_HEIGHT - 10;
    
    ctx.current.beginPath();
    ctx.current.rect(paddleX.current, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.current.fillStyle = '#0095DD';
    ctx.current.fill();
    ctx.current.closePath();
    
    // Paddle collision detection
    if (
      ballX.current > paddleX.current &&
      ballX.current < paddleX.current + PADDLE_WIDTH &&
      ballY.current + BALL_RADIUS > paddleY &&
      ballY.current < paddleY + PADDLE_HEIGHT
    ) {
      // Calculate angle based on where ball hits paddle
      const hitPosition = (ballX.current - paddleX.current) / PADDLE_WIDTH;
      const angle = hitPosition * Math.PI - Math.PI / 2; // -45 to 45 degrees
      const speed = Math.sqrt(ballDX.current ** 2 + ballDY.current ** 2);
      
      ballDX.current = Math.sin(angle) * speed * 1.1;
      ballDY.current = -Math.abs(Math.cos(angle) * speed) * 1.1;
      
      // Ensure ball doesn't get stuck in paddle
      ballY.current = paddleY - BALL_RADIUS - 1;
    }
  };

  const drawBricks = () => {
    if (!ctx.current || !canvas.current) return;
    
    const dpr = window.devicePixelRatio || 1;
    const brickWidth = (canvas.current.width / dpr - BRICK_OFFSET_LEFT * 2) / BRICK_COLUMN_COUNT - BRICK_PADDING;
    const brickHeight = 20;
    
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        if (bricks.current[c][r].status === 1) {
          const brickX = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (brickHeight + BRICK_PADDING) + BRICK_OFFSET_TOP;
          
          ctx.current.beginPath();
          ctx.current.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.current.fillStyle = `hsl(${r * 60 + c * 10}, 70%, 50%)`;
          ctx.current.fill();
          ctx.current.closePath();
        }
      }
    }
  };

  const drawScore = () => {
    if (!ctx.current) return;
    
    ctx.current.font = '16px Arial';
    ctx.current.fillStyle = '#0095DD';
    ctx.current.fillText(`Score: ${score}`, 8, 20);
    ctx.current.fillText(`High Score: ${highScore}`, 100, 20);
    
    if (isPaused) {
      ctx.current.font = '30px Arial';
      ctx.current.fillStyle = '#0095DD';
      ctx.current.textAlign = 'center';
      ctx.current.fillText('PAUSED', canvas.current!.width / (2 * (window.devicePixelRatio || 1)), 200);
      ctx.current.textAlign = 'start';
    }
    
    if (gameOver) {
      ctx.current.font = '30px Arial';
      ctx.current.fillStyle = '#FF0000';
      ctx.current.textAlign = 'center';
      ctx.current.fillText('GAME OVER', canvas.current!.width / (2 * (window.devicePixelRatio || 1)), 200);
      ctx.current.font = '20px Arial';
      ctx.current.fillText('Click to Restart', canvas.current!.width / (2 * (window.devicePixelRatio || 1)), 240);
      ctx.current.textAlign = 'start';
    }
    
    if (gameWon) {
      ctx.current.font = '30px Arial';
      ctx.current.fillStyle = '#00FF00';
      ctx.current.textAlign = 'center';
      ctx.current.fillText('YOU WIN!', canvas.current!.width / (2 * (window.devicePixelRatio || 1)), 200);
      ctx.current.font = '20px Arial';
      ctx.current.fillText('Click to Play Again', canvas.current!.width / (2 * (window.devicePixelRatio || 1)), 240);
      ctx.current.textAlign = 'start';
    }
  };

  const draw = () => {
    if (!ctx.current || !canvas.current) return;
    
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.current.width / dpr;
    const canvasHeight = canvas.current.height / dpr;
    
    // Clear canvas
    ctx.current.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw game elements
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    
    // Collision detection
    collisionDetection();
    
    // Ball movement
    if (!isPaused && !gameOver && !gameWon) {
      // Wall collision (left/right)
      if (ballX.current + ballDX.current > canvasWidth - BALL_RADIUS || ballX.current + ballDX.current < BALL_RADIUS) {
        ballDX.current = -ballDX.current;
      }
      
      // Wall collision (top)
      if (ballY.current + ballDY.current < BALL_RADIUS) {
        ballDY.current = -ballDY.current;
      }
      // Bottom collision (game over)
      else if (ballY.current + ballDY.current > canvasHeight - BALL_RADIUS) {
        if (ballX.current > paddleX.current && ballX.current < paddleX.current + PADDLE_WIDTH) {
          // Ball hits paddle
          ballDY.current = -ballDY.current;
        } else {
          // Ball hits bottom
          setGameOver(true);
        }
      }
      
      // Paddle movement
      if (rightPressed.current && paddleX.current < canvasWidth - PADDLE_WIDTH) {
        paddleX.current += 7;
      } else if (leftPressed.current && paddleX.current > 0) {
        paddleX.current -= 7;
      }
      
      // Update ball position
      ballX.current += ballDX.current;
      ballY.current += ballDY.current;
    }
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(draw);
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    initGame();
    initBricks();
    
    // Reset ball position and direction
    if (canvas.current) {
      const dpr = window.devicePixelRatio || 1;
      ballX.current = canvas.current.width / (2 * dpr);
      ballY.current = canvas.current.height / (2 * dpr);
      ballDX.current = 4 * (Math.random() > 0.5 ? 1 : -1);
      ballDY.current = -4;
    }
    
    // Start the game
    setIsPaused(false);
  };

  const handleCanvasClick = () => {
    if (gameOver || gameWon) {
      resetGame();
    } else {
      setIsPaused(prev => !prev);
    }
  };

  return (
    <GameLayout
      title="Breakout"
      description="Destroy all the bricks with the ball!"
      instructions="Use arrow keys or mouse to move the paddle. Press SPACE to pause. Don't let the ball fall!"
      score={score}
      highScore={highScore}
      onRestart={resetGame}
      isPaused={isPaused}
      onPauseToggle={() => setIsPaused(prev => !prev)}
    >
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg"
          style={{ width: '100%', height: '400px', touchAction: 'none' }}
        />
      </div>
    </GameLayout>
  );
}