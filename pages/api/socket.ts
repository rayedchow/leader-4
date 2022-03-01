import { Server} from 'socket.io';
import type { NextApiRequest } from 'next'
import { moveData } from '../[player]';

const socketHandler = (req: NextApiRequest, res: any) => {
	if(!res.socket.server.io) {
		const io = new Server(res.socket.server);
		
		io.on('connection', socket => {
			console.log('socket connection from server');

			socket.on('game-connect', (data) => socket.broadcast.emit('game-connection', data));
			socket.on('user-move', (data: moveData) => socket.broadcast.emit('player-move', data));
		});

		res.socket.server.io = io;
	}
	res.end();
}

export default socketHandler;