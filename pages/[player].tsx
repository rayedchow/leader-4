import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { server } from '.';
import styles from '../styles/Board.module.css';

let socket: Socket;

const Board: NextPage = ({ socketCreated }: InferGetServerSidePropsType<GetServerSideProps>) => {
  const router = useRouter();
  const { player } = router.query;
  const [user, setUser] = useState('');
  const [board, setBoard] = useState<string[][]>([[], [], [], [], [], [], []]);
  const [turn, setTurn] = useState(Math.random() < 0.5);

  useEffect(() => {
    if(typeof window !== 'undefined') {
        const id = window.localStorage.getItem('user');
        if(!id) return;
        setUser(id);
    }
    initSocket();
  }, []);
  
  const initSocket = () => {
    if(!socketCreated) return;
    socket = io();
    socket.on('connect', () => console.log('socket connected from client'));
    socket.on('player-move', data => console.log(data));
  }

  const onBoardClick = (i: number) => {
    if(board[i].length >= 6) return;
    if(!turn) return;
    setBoard(currBoard => {
      let newBoard: string[][] = currBoard.map((column, j) => {
        if(i === j) {
          return currBoard[j].concat('blue');
        } else return column;
      });
      console.log(checkBoard(newBoard, i, board[i].length, 'blue'));
      socket.emit('user-move', { x: i, y: board[i].length, winMove: false });
      return newBoard;
    });
    setTurn(false);
  }

  return (
    <div className={styles.main}>
      <div className={styles.game}>
        <div className={styles.header}>
          you vs {player}
        </div>
        <div className={styles.status}>
          {turn ? 'your turn' : "opponent's turn"}
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

const checkBoard = (board: string[][], x: number, y: number, color: string): string | null => {
  let stack = 0;
  
  // checking vertically
  if(y>=3) {
    for(let i = 0; i < board[x].length; i++) {
      if(board[x][i] === color) stack++;
      else stack = 0;
      if(stack === 4) return color;
    }
  }

  stack = 0;
  // checking horizontally
  for(let i = 0; i < board.length; i++) {
    if(board[i][y] === color) stack++;
    else stack = 0;
    if(stack === 4) return color;
  }

  stack = 0;
  // checking m=1
  let [x2, y2] = [x-y, 0];
  while((x2 < 6) && (y2 < 5)) {
    if(board[x2] && board[x2][y2] === color) stack++;
    else stack = 0;
    if(stack === 4) return color;
    x2++; y2++;
  }

  stack = 0;
  // checking m=-1
  let [x3, y3] = [x+y, 0];
  while((x3 > 1) && (y3 < 5)) {
    if(board[x3] && board[x3][y3] === color) stack++;
    else stack = 0;
    if(stack === 4) return color;
    x3--; y3++;
  }

  return null;
}

export const getServerSideProps: GetServerSideProps = async(context) => {
  await fetch(`${server}/api/socket`);
  return { props: { socketCreated: true } };
}

export default Board;