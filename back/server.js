import {WebSocketServer} from 'ws';
import {Game} from '../core/game/game.js'

const clients = new Set()

const game = new Game({
    onChange: async () => {
        const state = await game.getState()

        const message = {
            type: 'stateChanged',
            state,
        }

        for (const client of clients) {
            client.send(JSON.stringify(message))
        }
    }
})

const wss = new WebSocketServer({port: 8080});

wss.on('connection', (socket) => {
    socket.on('error', console.error)
    clients.add(socket)

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

    socket.on('close', () => {
        clients.delete(socket)
    })
})