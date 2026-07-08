export class Api {
    constructor(socket) {
        this.socket = socket

        this.resolvers = {}

        this.socket.addEventListener('message', (event) => {
            const response = JSON.parse(event.data)
            if (this.resolvers[response.procedure] && this.resolvers[response.procedure].length > 0) {
                const resolve = this.resolvers[response.procedure].shift()
                resolve(response.result)
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