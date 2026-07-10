export class Api {
    constructor(socket) {
        this.socket = socket

        this.resolvers = {}
        this.onStateChanged = null

        this.socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data)
            if (message.type === 'response') {
                if (
                    this.resolvers[message.procedure] &&
                    this.resolvers[message.procedure].length > 0
                ) {
                    const resolve = this.resolvers[message.procedure].shift()
                    resolve(message.result)
                }
            }

            if (message.type === 'stateChanged') {
                this.onStateChanged?.()
            }
        })
    }

    send(procedureName, params = {}) {
        return new Promise((resolve) => {
            this.socket.send(JSON.stringify({
                procedure: procedureName,
                params
            }))
            if (!this.resolvers[procedureName]) {
                this.resolvers[procedureName] = []
            }
            this.resolvers[procedureName].push(resolve)
        })
    }
}