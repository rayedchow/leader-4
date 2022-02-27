import { Server} from 'socket.io';
import type { NextApiRequest } from 'next'

const socketHandler = (req: NextApiRequest, res: any) => {
	if(!res.socket.server.io) {
		const io = new Server(res.socket.server);
		
		io.on('connection', socket => {
			console.log('lesa goo');

			socket.on('disconnect', () => console.log('nooo'));
		});

		res.socket.server.io = io;
	}
	res.end();
}

export default socketHandler;