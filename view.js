import {GameStatuses} from './gameStatuses.js'
import {MoveDirections} from './moveDirections.js'

export class View {
    #callbacks = {}

    constructor() {
        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowUp':
                    this.#callbacks.onMove(1, MoveDirections.UP)
                    break
                case 'ArrowDown':
                    this.#callbacks.onMove(1, MoveDirections.DOWN)
                    break
                case 'ArrowLeft':
                    this.#callbacks.onMove(1, MoveDirections.LEFT)
                    break
                case 'ArrowRight':
                    this.#callbacks.onMove(1, MoveDirections.RIGHT)
                    break
                case 'KeyW':
                    this.#callbacks.onMove(2, MoveDirections.UP)
                    break
                case 'KeyS':
                    this.#callbacks.onMove(2, MoveDirections.DOWN)
                    break
                case 'KeyA':
                    this.#callbacks.onMove(2, MoveDirections.LEFT)
                    break
                case 'KeyD':
                    this.#callbacks.onMove(2, MoveDirections.RIGHT)
                    break
            }
        })
    }

    setCallbacks(callbacksProps) {
        this.#callbacks = callbacksProps
    }

    render(dto) {
        const rootElement = document.getElementById('root')
        const scoreElement = document.querySelector('#score')

        rootElement.innerHTML = ''
        scoreElement.innerHTML = ''

        if (dto.status === GameStatuses.pending) {
            const startButtonElement = this.#settingsScreen()
            rootElement.append(startButtonElement)
        } else if (dto.status === GameStatuses.in_progress) {
            const tableElement = this.#gridScreen(dto)
            rootElement.append(tableElement)
        }

        scoreElement.innerText = `player1: ${dto.score[1].points} // player2: ${dto.score[2].points}`;
    }

    #settingsScreen() {
        const startButtonElement = document.createElement('button')
        startButtonElement.textContent = 'start'

        //subject, publisher; subscribe, on, handle; observer, subscriber, handler
        startButtonElement.addEventListener('click', (e) => {
            this.#callbacks.onStart()
        })
        return startButtonElement
    }

    #gridScreen(dto) {
        const tableElement = document.createElement('table')

        for (let y = 0; y < dto.rowsCount; y++) {
            const rowElement = document.createElement('tr')
            for (let x = 0; x < dto.columnsCount; x++) {
                const cellElement = document.createElement('td')
                if (dto.googlePosition && x === dto.googlePosition.x && y === dto.googlePosition.y) {
                    const googleElement = document.createElement('img')
                    googleElement.src = './img/icons/googleIcon.svg'
                    googleElement.alt = 'Google'
                    cellElement.appendChild(googleElement)
                }
                if (dto.googlePosition && x === dto.player1Position.x && y === dto.player1Position.y) {
                    const player1 = document.createElement('img')
                    player1.src = './img/icons/man01.svg'
                    player1.alt = 'Player1'
                    cellElement.appendChild(player1)
                }
                if (dto.player2Position && x === dto.player2Position.x && y === dto.player2Position.y) {
                    const player2 = document.createElement('img')
                    player2.src = './img/icons/man02.svg'
                    player2.alt = 'Player2'
                    cellElement.appendChild(player2)
                }
                rowElement.append(cellElement)
            }
            tableElement.append(rowElement)
        }
        return tableElement
    }
}
