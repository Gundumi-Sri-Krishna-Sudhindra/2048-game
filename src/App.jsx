import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

const GRID_SIZE = 4;
const START_TILES = 2;

function getEmptyGrid() {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function addRandomTile(grid) {
  const empty = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const [r, c] = empty[getRandomInt(empty.length)];
  const newGrid = grid.map(row => row.slice());
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function transpose(grid) {
  return grid[0].map((_, i) => grid.map(row => row[i]));
}

function operate(row) {
  let arr = row.filter(val => val);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(val => val);
  while (arr.length < GRID_SIZE) arr.push(0);
  return arr;
}

function moveLeft(grid) {
  let moved = false;
  let score = 0;
  const newGrid = grid.map(row => {
    const original = row.slice();
    const operated = operate(row);
    for (let i = 0; i < GRID_SIZE; i++) {
      if (operated[i] !== original[i]) moved = true;
      if (operated[i] !== 0 && operated[i] !== original[i]) score += operated[i];
    }
    return operated;
  });
  return { newGrid, moved, score };
}

function moveRight(grid) {
  let moved = false;
  let score = 0;
  const newGrid = grid.map(row => {
    const original = row.slice();
    const reversed = row.slice().reverse();
    const operated = operate(reversed).reverse();
    for (let i = 0; i < GRID_SIZE; i++) {
      if (operated[i] !== original[i]) moved = true;
      if (operated[i] !== 0 && operated[i] !== original[i]) score += operated[i];
    }
    return operated;
  });
  return { newGrid, moved, score };
}

function moveUp(grid) {
  let moved = false;
  let score = 0;
  let transposed = transpose(grid);
  const { newGrid, moved: m, score: s } = moveLeft(transposed);
  moved = m;
  score = s;
  return { newGrid: transpose(newGrid), moved, score };
}

function moveDown(grid) {
  let moved = false;
  let score = 0;
  let transposed = transpose(grid);
  const { newGrid, moved: m, score: s } = moveRight(transposed);
  moved = m;
  score = s;
  return { newGrid: transpose(newGrid), moved, score };
}

function isGameOver(grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return false;
      if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

const App = () => {
  const [grid, setGrid] = useState(getEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Initialize grid
  useEffect(() => {
    let newGrid = getEmptyGrid();
    for (let i = 0; i < START_TILES; i++) {
      newGrid = addRandomTile(newGrid);
    }
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOver) return;
      let result;
      if (e.key === 'ArrowLeft') {
        result = moveLeft(grid);
      } else if (e.key === 'ArrowRight') {
        result = moveRight(grid);
      } else if (e.key === 'ArrowUp') {
        result = moveUp(grid);
      } else if (e.key === 'ArrowDown') {
        result = moveDown(grid);
      } else {
        return;
      }
      if (result.moved) {
        let newGrid = addRandomTile(result.newGrid);
        setGrid(newGrid);
        setScore(score + result.score);
        if (isGameOver(newGrid)) setGameOver(true);
      }
    },
    [grid, score, gameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleRestart = () => {
    let newGrid = getEmptyGrid();
    for (let i = 0; i < START_TILES; i++) {
      newGrid = addRandomTile(newGrid);
    }
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="game2048-container">
      <h1 className="game2048-main-heading">Welcome! This game is developed by Sri krishna Sudhindra</h1>
      <div className="game2048-subtitle">Enjoy playing 2048 below!</div>
      <h2 className="game2048-title">2048 Game</h2>
      <div className="game2048-score">Score: {score}</div>
      <div className="game2048-board">
        {grid.map((row, r) => (
          <div key={r} className="game2048-row">
            {row.map((cell, c) => (
              <div
                key={c}
                className={`game2048-cell game2048-cell--${cell}`}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="game2048-over">
          Game Over!
        </div>
      )}
      <button
        onClick={handleRestart}
        className="game2048-restart"
      >
        Restart
      </button>
      <div className="game2048-instructions">
        Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!
      </div>
    </div>
  );
}

export default App