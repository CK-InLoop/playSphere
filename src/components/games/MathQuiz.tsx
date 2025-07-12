'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import GameLayout from './GameLayout';

type Operator = '+' | '-' | '*' | '/';

interface Question {
  num1: number;
  num2: number;
  operator: Operator;
  answer: number;
  options: number[];
}

export default function MathQuiz() {
  const { updateScore } = useGame();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('mathQuizHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Game timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Generate a random number between min and max (inclusive)
  const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate a new math question
  const generateQuestion = useCallback((): Question => {
    const operators: Operator[] = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operator) {
      case '+':
        num1 = getRandomNumber(5, 50);
        num2 = getRandomNumber(5, 50);
        answer = num1 + num2;
        break;
      case '-':
        num1 = getRandomNumber(10, 100);
        num2 = getRandomNumber(1, num1);
        answer = num1 - num2;
        break;
      case '*':
        num1 = getRandomNumber(2, 12);
        num2 = getRandomNumber(2, 12);
        answer = num1 * num2;
        break;
      case '/':
        num2 = getRandomNumber(2, 12);
        answer = getRandomNumber(2, 12);
        num1 = num2 * answer; // Ensure division results in whole number
        break;
    }

    // Generate options (3 wrong answers + correct answer)
    const options = [answer];
    while (options.length < 4) {
      let wrongAnswer: number;
      do {
        // Generate wrong answers that are somewhat close to the correct answer
        const offset = getRandomNumber(1, 10) * (Math.random() > 0.5 ? 1 : -1);
        wrongAnswer = Math.max(1, answer + offset);
      } while (options.includes(wrongAnswer));
      options.push(wrongAnswer);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return { num1, num2, operator, answer, options };
  }, []);

  // Start a new game
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setSelectedAnswer(null);
    setFeedback(null);
    setCurrentQuestion(generateQuestion());
  };

  // Handle answer selection
  const handleAnswer = (selectedOption: number) => {
    if (!currentQuestion || gameOver) return;
    
    setSelectedAnswer(selectedOption);
    setTotalQuestions(prev => prev + 1);
    
    const isCorrect = selectedOption === currentQuestion.answer;
    
    if (isCorrect) {
      const points = 10;
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setFeedback({ correct: true, message: 'Correct! +10 points' });
      
      // Update high score if needed
      if (score + points > highScore) {
        const newHighScore = score + points;
        setHighScore(newHighScore);
        localStorage.setItem('mathQuizHighScore', newHighScore.toString());
        updateScore('mathQuiz', newHighScore, 'highScore');
      }
      
      updateScore('mathQuiz', points, 'score');
    } else {
      setFeedback({ correct: false, message: `Incorrect! The answer was ${currentQuestion.answer}` });
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setFeedback(null);
    }, 1500);
  };

  // Start the game on component mount
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get operator symbol
  const getOperatorSymbol = (op: Operator) => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return op;
    }
  };

  return (
    <GameLayout
      title="Math Quiz"
      description="Solve as many math problems as you can in 30 seconds!"
      score={score}
      highScore={highScore}
      onRestart={startGame}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        {gameOver ? (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-2">Your score: {score}</p>
            <p className="mb-6">You answered {correctAnswers} out of {totalQuestions} correctly!</p>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        ) : (
          <>
            <div className="w-full flex justify-between items-center mb-8">
              <div className="text-lg font-semibold">Time: {timeLeft}s</div>
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            {currentQuestion && (
              <motion.div 
                className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                key={`${currentQuestion.num1}-${currentQuestion.operator}-${currentQuestion.num2}`}
              >
                <div className="text-4xl font-bold text-center mb-8">
                  {currentQuestion.num1} {getOperatorSymbol(currentQuestion.operator)} {currentQuestion.num2} = ?
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 text-lg font-medium rounded-lg transition-colors ${
                        selectedAnswer === null
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                          : option === currentQuestion.answer
                          ? 'bg-green-100 text-green-800 border-2 border-green-400'
                          : selectedAnswer === option
                          ? 'bg-red-100 text-red-800 border-2 border-red-400'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      whileHover={{ scale: selectedAnswer === null ? 1.03 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {feedback && (
              <motion.div 
                className={`mt-4 p-3 rounded-lg text-center font-medium ${
                  feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {feedback.message}
              </motion.div>
            )}
          </>
        )}
      </div>
    </GameLayout>
  );
}