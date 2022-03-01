import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import styles from '../styles/Board.module.css';

let socket: Socket;
let globalX: number = -1;

export interface moveData {
  x: number
  y: number
  game: string
  winMove: boolean
}

const Board: NextPage = ({ player }: InferGetServerSidePropsType<GetServerSideProps>) => {
  const [user, setUser] = useState('');
  const [board, setBoard] = useState<string[][]>([[], [], [], [], [], [], []]);
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4>(0);

  if((typeof window !== 'undefined') && (user === '')) {
      const id = window.localStorage.getItem('user');
      if(id) setUser(id);
  }

  useEffect(() => { initSocket() }, []);
  useEffect(() => {
    console.log('woah');
    // if(status === 2) {
    //   console.log(globalX);
    //   const winMove = checkBoard(board, globalX, board[globalX].length, 'blue');
    //   socket.emit('user-move', { x: global, y: board[globalX].length, game: `${user}-${player}`, winMove });
    // }
  }, [board, status]);
  
  const initSocket = async () => {
    await fetch('/api/socket');
    socket = io();
    socket.on('connect', () => {
      console.log('socket connected from client');
      socket.emit('game-connect', { game: `${user}-${player}`, turn: Math.random() < .5 });
    });
    socket.on('game-connection', (data: { game: string, turn: boolean }) => {
      if(data.game !== `${player}-${user}`) return;
      setStatus(data.turn ? 2 : 1);
      socket.emit('connection-receive', { game: `${user}-${player}`, turn: data.turn });
    });
    socket.on('receive-connect', (data: { game: string, turn: boolean }) => {
      if(data.game !== `${player}-${user}`) return;
      setStatus(data.turn ? 1 : 2);
    });
    socket.on('player-move', (data: moveData) => {
      if(data.game !== `${player}-${user}`) return;
      onPlayerMove(data);
    });
  }

  const onPlayerMove = (data: moveData) => {
    setBoard(currBoard => {
      let newBoard: string[][] = currBoard.map((column, j) => {
        if(data.x === j) {
          return currBoard[j].concat('red');
        } else return column;
      });
      setStatus(1);
      return newBoard;
    });
  }

  const onBoardClick = (i: number) => {
    if(board[i].length >= 6) return;
    if(status !== 1) return;
    setBoard((currBoard) => {
      let newBoard: string[][] = currBoard.map((column, j) => {
        if(i === j) {
          return currBoard[j].concat('blue');
        } else return column;
      });
      setStatus(2);
      globalX = i;
      return newBoard;
    });
    const tmpBoard = board;
    tmpBoard[i].push('blue');
    
  }

  return (
    <div className={styles.main}>
      <div className={styles.game}>
        <div className={styles.header}>
          {user} vs {player}
        </div>
        <div className={styles.status}>
          {(() => {
            switch(status) {
              case 0:
                return 'waiting...';
              case 1:
                return 'your turn';
              case 2:
                return "opponent's turn";
              case 3:
                return "L you're hot garbo";
              case 4:
                return "W you still hot garbo tho";
            }
          })()}
        </div>
      </div>
      <div className={styles.board}>
        {board.map((column, i) => 
          <div key={`column-${i}`} className={styles.column} onClick={() => onBoardClick(i)}>
            {column.map((color, j) => 
              <div key={`piece-${i}${j}`} className={`${color} piece`}>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const checkBoard = (board: string[][], x: number, y: number, color: string): boolean => {
  let stack = 0;
  
  // checking vertically
  if(y>=3) {
    for(let i = 0; i < board[x].length; i++) {
      if(board[x][i] === color) stack++;
      else stack = 0;
      if(stack === 4) return true;
    }
  }

  stack = 0;
  // checking horizontally
  for(let i = 0; i < board.length; i++) {
    if(board[i][y] === color) stack++;
    else stack = 0;
    if(stack === 4) return true;
  }

  stack = 0;
  // checking m=1
  let [x2, y2] = [x-y, 0];
  while((x2 < 6) && (y2 < 5)) {
    if(board[x2] && board[x2][y2] === color) stack++;
    else stack = 0;
    if(stack === 4) return true;
    x2++; y2++;
  }

  stack = 0;
  // checking m=-1
  let [x3, y3] = [x+y, 0];
  while((x3 > 1) && (y3 < 5)) {
    if(board[x3] && board[x3][y3] === color) stack++;
    else stack = 0;
    if(stack === 4) return true;
    x3--; y3++;
  }

  return false;
}

export const getServerSideProps: GetServerSideProps = async(context) => {
  return { props: { player: context.query.player } };
}

export default Board;