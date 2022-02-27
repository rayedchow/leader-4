import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';

const Board = () => {
  const router = useRouter();
  const { player } = router.query;
  const [user, setUser] = useState('');

  useEffect(() => {
    if(typeof window !== 'undefined') {
        const id = window.localStorage.getItem('user');
        if(!id) return;
        setUser(id);
    }
  }, []);

  return <p>Game: {user} vs {player}</p>
}

export default Board