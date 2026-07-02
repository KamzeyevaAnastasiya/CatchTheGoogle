import {GameStatuses} from '../core/game/gameStatuses.js'
import {MoveDirections} from '../core/moveDirections.js'
import {Google} from "../core/unit.js";

export class View {
    #callbacks = {}
    #infoDialog = null

    #keyBindings = {
        ArrowUp: {player: 1, direction: MoveDirections.UP},
        ArrowDown: {player: 1, direction: MoveDirections.DOWN},
        ArrowLeft: {player: 1, direction: MoveDirections.LEFT},
        ArrowRight: {player: 1, direction: MoveDirections.RIGHT},

        KeyW: {player: 2, direction: MoveDirections.UP},
        KeyS: {player: 2, direction: MoveDirections.DOWN},
        KeyA: {player: 2, direction: MoveDirections.LEFT},
        KeyD: {player: 2, direction: MoveDirections.RIGHT},
    }

    constructor() {
        this.rootElement = document.getElementById('root')
        document.addEventListener('keyup', this.#handleKeyUp)
    }

    #handleKeyUp = (e) => {
        const binding = this.#keyBindings[e.code]
        if (!binding) return
        this.#callbacks.onMove(binding.player, binding.direction)
    }

    setCallbacks(callbacksProps) {
        this.#callbacks = callbacksProps
    }

    render(dto) {
        this.rootElement.innerHTML = ''

        this.rootElement.append(this.#settingsGame(dto))

        if (dto.status === GameStatuses.pending) {
            this.rootElement.append(this.#settingsScreen())
        } else if (dto.status === GameStatuses.in_progress) {
            this.rootElement.append(this.#score(dto))
            this.rootElement.append(this.#gridScreen(dto))
        }
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

    #settingsScreen() {
        const wrapper = document.createElement('div')
        wrapper.className = 'startScreen'

        const startButtonElement = document.createElement('button')
        startButtonElement.textContent = 'Start game'
        startButtonElement.className = 'startButton'

        //subject, publisher; subscribe, on, handle; observer, subscriber, handler
        startButtonElement.addEventListener('click', () => {
            this.#callbacks.onStart()
            this.#showInfoDialog()
        })

        wrapper.append(startButtonElement)
        return wrapper
    }

    #settingsGame(dto) {
        const wrapper = document.createElement('div')
        wrapper.className = 'wrapperSettingsGame'
        wrapper.append(this.#settingsGridSize(dto))
        wrapper.append(this.#settingsPointsToWin(dto))
        wrapper.append(this.#settingsGoogleJumpInterval(dto))
        wrapper.append(this.#stopGame())
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

    #settingsGoogleJumpInterval(dto) {
        return this.#createSelect({
            labelText: 'Google Jump Interval',
            options: dto.googleJumpIntervalSettings,
            value: String(dto.googleJumpInterval),
            disabled: dto.status !== GameStatuses.pending,
            onChange: (option) => {
                this.#callbacks.onChangeGoogleJumpInterval(option.googleJumpInterval)
            },
        })
    }

    #stopGame() {
        const stopButtonElement = document.createElement('button')
        stopButtonElement.className = 'stopButton'

        const imgElement = document.createElement('img')
        imgElement.src = '../img/icons/stopIcon.svg'
        imgElement.alt = 'Stop game'
        stopButtonElement.appendChild(imgElement)
        stopButtonElement.addEventListener('click', () => {
            this.#callbacks.onStop()
            console.log('stop')
        })
        return stopButtonElement
    }

    #info() {
        const dialog = document.createElement('dialog')
        dialog.className = 'info'
        const text = document.createElement('p')
        text.textContent = 'Control is done with “arrows for player 1” and “WASD for player 2”'
        const button = document.createElement('button')
        button.textContent = 'OK'
        button.addEventListener('click', () => {
            dialog.close()
            dialog.remove()
            this.#infoDialog = null
        })
        dialog.append(text, button)
        return dialog
    }

    #showInfoDialog() {
        if (this.#infoDialog) {
            this.#infoDialog.remove()
        }

        this.#infoDialog = this.#info()
        document.body.append(this.#infoDialog)
        this.#infoDialog.showModal()
    }

    #score(dto) {
        const score = document.createElement('div')
        score.className = 'score'
        score.innerHTML = ''

        const scorePlayer1 = document.createElement('div')
        const player1 = '../img/icons/man01.svg'
        scorePlayer1.innerHTML = `Player 1: <img src="${player1}" alt="Player 1" style="width: 48px; height: 48px; vertical-align: middle"> ${dto.score[1].points}`

        const scorePlayer2 = document.createElement('div')
        const player2 = '../img/icons/man02.svg'
        scorePlayer2.innerHTML = `Player 2: <img src="${player2}" alt="Player 2" style="width: 48px; height: 48px; vertical-align: middle"> ${dto.score[2].points}`

        const scoreGoogle = document.createElement('div')
        const google = '../img/icons/googleIcon.svg'
        scoreGoogle.innerHTML = `Google: <img src="${google}" alt="Google" style="width: 48px; height: 48px; vertical-align: middle"> ${dto.score.google.jumps}`

        score.appendChild(scorePlayer1)
        score.appendChild(scorePlayer2)
        score.appendChild(scoreGoogle)

        return score
    }

}
