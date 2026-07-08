import {WebSocketServer} from 'ws';
import {Game} from '../core/game/game.js'
import {EventEmitter} from 'events'

const game = new Game({
    onChange: () => {
        console.log('Game changed')
    }
})

game.startGame()

const wss = new WebSocketServer({port: 8080});

wss.on('connection', (socket) => {
    socket.on('error', console.error)

    socket.on('message', async function message(data) {
        const action = JSON.parse(data)
        if (!game[action.procedure]) {
            socket.send(JSON.stringify({
                error: 'Unknown procedure'
            }))
            return
        }
        const result = await game[action.procedure]()
        const response = {
            procedure: action.procedure,
            result: result,
            type: 'response',
        }
        socket.send(JSON.stringify(response))
    })
})