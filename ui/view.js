import {GameStatuses} from '../core/game/gameStatuses.js'
import {MoveDirections} from '../core/moveDirections.js'

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

        rootElement.append(this.#settingsGame(dto))

        if (dto.status === GameStatuses.pending) {
            rootElement.append(this.#settingsScreen())
        } else if (dto.status === GameStatuses.in_progress) {
            rootElement.append(this.#gridScreen(dto))
        }

        scoreElement.innerText = `player1: ${dto.score[1].points} // player2: ${dto.score[2].points}`
    }

    #settingsScreen() {
        const startButtonElement = document.createElement('button')
        startButtonElement.textContent = 'start game'
        startButtonElement.className = 'startButton'

        //subject, publisher; subscribe, on, handle; observer, subscriber, handler
        startButtonElement.addEventListener('click', (e) => {
            this.#callbacks.onStart()
        })
        return startButtonElement
    }

    #settingsGame(dto) {
        const wrapper = document.createElement('div')
        wrapper.className = 'wrapperSettingsGame'
        wrapper.append(this.#settingsGridSize(dto))
        wrapper.append(this.#settingsPointsToWin(dto))
        return wrapper
    }

    #createSelect({
                      labelText,
                      options,
                      value,
                      disabled,
                      onChange,
                  }) {
        const wrapper = document.createElement('div')
        wrapper.className = 'settingsWrapper'

        const label = document.createElement('label')
        label.textContent = labelText
        label.className = 'label'

        const select = document.createElement('select')
        select.className = 'select'
        select.disabled = disabled

        options.forEach((option) => {
            select.add(new Option(option.text, option.value))
        })

        if (value !== undefined) {
            select.value = value
        }

        select.addEventListener('change', (e) => {
            const selectedOption = options.find(
                (option) => option.value === e.target.value,
            )

            if (!selectedOption) return

            onChange(selectedOption)
        })

        wrapper.append(label, select)

        return wrapper
    }


    #settingsGridSize(dto) {
        return this.#createSelect({
            labelText: 'Grid size',
            options: dto.gridSizeSettings,
            value: `${dto.gridSize.columnCount}x${dto.gridSize.rowCount}`,
            disabled: dto.status !== GameStatuses.pending,
            onChange: (option) => {
                this.#callbacks.onChangeGridSize(
                    option.columnCount,
                    option.rowCount,
                )
            },
        })
    }

    #settingsPointsToWin(dto) {
        return this.#createSelect({
            labelText: 'Points to win',
            options: dto.pointsToWinSettings,
            value: `${dto.pointsToWin}pts`,
            disabled: dto.status !== GameStatuses.pending,
            onChange: (option) => {
                this.#callbacks.onChangePointsToWin(option.pointsToWin)
            },
        })
    }


    #gridScreen(dto) {
        const tableElement = document.createElement('table')

        for (let y = 0; y < dto.gridSize.rowCount; y++) {
            const rowElement = document.createElement('tr')
            for (let x = 0; x < dto.gridSize.columnCount; x++) {
                const cellElement = document.createElement('td')
                if (dto.googlePosition && x === dto.googlePosition.x && y === dto.googlePosition.y) {
                    const googleElement = document.createElement('img')
                    googleElement.src = '../img/icons/googleIcon.svg'
                    googleElement.alt = 'Google'
                    cellElement.appendChild(googleElement)
                }
                if (dto.googlePosition && x === dto.player1Position.x && y === dto.player1Position.y) {
                    const player1 = document.createElement('img')
                    player1.src = '../img/icons/man01.svg'
                    player1.alt = 'Player1'
                    cellElement.appendChild(player1)
                }
                if (dto.player2Position && x === dto.player2Position.x && y === dto.player2Position.y) {
                    const player2 = document.createElement('img')
                    player2.src = '../img/icons/man02.svg'
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
