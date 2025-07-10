'use client';

import { useState, useEffect, useCallback } from 'react';

type Cell = {
  value: number | null;
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isInvalid: boolean;
};

type Board = Cell[][];

const generateEmptyBoard = (): Board => {
  return Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => ({
      value: null,
      isGiven: false,
      isSelected: false,
      isHighlighted: false,
      isInvalid: false,
    }))
  );
};

const generatePuzzle = (): Board => {
  // This is a simple puzzle generator. In a real app, you might want to use a more sophisticated algorithm.
  const puzzle = generateEmptyBoard();
  
  // Fill the diagonal boxes
  for (let box = 0; box < 9; box += 3) {
    fillBox(puzzle, box, box);
  }
  
  // Solve the puzzle to make sure it's valid
  solveSudoku(puzzle);
  
  // Remove some numbers to create the puzzle
  const cellsToRemove = 45; // Adjust difficulty by changing this number
  let cellsRemoved = 0;
  
  while (cellsRemoved < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (puzzle[row][col].value !== null) {
      puzzle[row][col].value = null;
      puzzle[row][col].isGiven = false;
      cellsRemoved++;
    }
  }
  
  // Mark remaining numbers as given
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col].value !== null) {
        puzzle[row][col].isGiven = true;
      }
    }
  }
  
  return puzzle;
};

const fillBox = (board: Board, startRow: number, startCol: number) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle the numbers
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  // Fill the 3x3 box
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[startRow + i][startCol + j].value = nums[index++];
    }
  }
};

const solveSudoku = (board: Board): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col].value = num;
            
            if (solveSudoku(board)) {
              return true;
            }
            
            board[row][col].value = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const isValid = (board: Board, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x].value === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col].value === num) return false;
  }
  
  // Check 3x3 box
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxStartRow + i][boxStartCol + j].value === num) {
        return false;
      }
    }
  }
  
  return true;
};

export default function Sudoku() {
  const [board, setBoard] = useState<Board>(generateEmptyBoard());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initializeGame = useCallback(() => {
    const newBoard = generatePuzzle();
    setBoard(newBoard);
    setSelectedCell(null);
    setMistakes(0);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].isGiven) return;
    
    // Update selected cell
    const newBoard = board.map(r => 
      r.map(cell => ({
        ...cell,
        isSelected: false,
        isHighlighted: false,
        isInvalid: false,
      }))
    );
    
    newBoard[row][col].isSelected = true;
    
    // Highlight same number cells
    const selectedValue = board[row][col].value;
    if (selectedValue !== null) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].value === selectedValue) {
            newBoard[r][c].isHighlighted = true;
          }
        }
      }
    }
    
    setBoard(newBoard);
    setSelectedCell([row, col]);
  };

  const handleNumberClick = (num: number) => {
    if (!selectedCell || isComplete) return;
    
    const [row, col] = selectedCell;
    if (board[row][col].isGiven) return;
    
    // Check if the number is valid
    let isValidMove = true;
    
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c].value === num) {
        isValidMove = false;
        break;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col].value === num) {
        isValidMove = false;
        break;
      }
    }
    
    // Check 3x3 box
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    
    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
      for (let c = boxStartCol; c < boxStartCol + 3; c++) {
        if (r !== row && c !== col && board[r][c].value === num) {
          isValidMove = false;
          break;
        }
      }
    }
    
    // Update the board
    const newBoard = board.map((r, rIdx) =>
      r.map((cell, cIdx) => {
        if (rIdx === row && cIdx === col) {
          return {
            ...cell,
            value: num,
            isInvalid: !isValidMove,
          };
        }
        return cell;
      })
    );
    
    setBoard(newBoard);
    
    // Update mistakes count
    if (!isValidMove) {
      setMistakes(prev => prev + 1);
    }
    
    // Check if the puzzle is complete
    const isPuzzleComplete = newBoard.every(row => 
      row.every(cell => cell.value !== null && !cell.isInvalid)
    );
    
    if (isPuzzleComplete) {
      setIsComplete(true);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    
    // Handle number input
    if (e.key >= '1' && e.key <= '9') {
      handleNumberClick(parseInt(e.key));
    }
    // Handle arrow keys for navigation
    else if (e.key === 'ArrowUp' && row > 0) {
      handleCellClick(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < 8) {
      handleCellClick(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0) {
      handleCellClick(row, col - 1);
    } else if (e.key === 'ArrowRight' && col < 8) {
      handleCellClick(row, col + 1);
    }
    // Clear cell
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      if (!board[row][col].isGiven) {
        const newBoard = [...board];
        newBoard[row][col].value = null;
        newBoard[row][col].isInvalid = false;
        setBoard(newBoard);
      }
    }
  }, [selectedCell, board]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full max-w-md">
        <div className="text-lg font-semibold">Mistakes: {mistakes}/3</div>
        <button
          onClick={initializeGame}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          New Game
        </button>
      </div>
      
      <div className="grid grid-cols-9 gap-0.5 bg-gray-800 p-1 rounded">
        {board.map((row, rowIndex) => (
          <>
            {row.map((cell, colIndex) => {
              const isBoxTop = rowIndex % 3 === 0;
              const isBoxLeft = colIndex % 3 === 0;
              const isSelected = selectedCell?.toString() === [rowIndex, colIndex].toString();
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg font-medium
                    ${cell.isGiven ? 'font-bold bg-white' : 'bg-gray-100'}
                    ${cell.isHighlighted ? 'bg-yellow-100' : ''}
                    ${cell.isInvalid ? 'text-red-500' : cell.isGiven ? 'text-black' : 'text-blue-600'}
                    ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
                    ${isBoxTop ? 'border-t-2 border-gray-800' : 'border-t border-gray-300'}
                    ${isBoxLeft ? 'border-l-2 border-gray-800' : 'border-l border-gray-300'}
                    ${rowIndex === 8 ? 'border-b-2 border-gray-800' : ''}
                    ${colIndex === 8 ? 'border-r-2 border-gray-800' : ''}
                    cursor-pointer select-none
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.value || ''}
                </div>
              );
            })}
          </>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-lg font-medium"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors text-lg font-medium"
          onClick={() => {
            if (selectedCell) {
              const [row, col] = selectedCell;
              if (!board[row][col].isGiven) {
                const newBoard = [...board];
                newBoard[row][col].value = null;
                newBoard[row][col].isInvalid = false;
                setBoard(newBoard);
              }
            }
          }}
        >
          ✕
        </button>
      </div>
      
      {isComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-4">Congratulations! 🎉</h3>
            <p className="mb-4">You solved the Sudoku puzzle with {mistakes} mistakes!</p>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
