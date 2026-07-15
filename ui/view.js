import {GameStatuses} from '../core/constants/gameStatuses.js'
import {MoveDirections} from '../core/constants/moveDirections.js'

const ICONS_PATH = 'assets/img/icons/'

export class View {
    #callbacks = {}
    #infoDialog = null
    #stopDialog = null
    #finishDialog = null
    #previousStatus = null

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
        this.#callbacks.onMove?.(binding.player, binding.direction)
    }

    setCallbacks(callbacksProps) {
        this.#callbacks = callbacksProps
    }

    render(dto) {
        this.rootElement.innerHTML = ''

        if (
            this.#previousStatus === GameStatuses.pending &&
            dto.status === GameStatuses.in_progress
        ) {
            this.#showInfoDialog()
        }
        this.#previousStatus = dto.status

        if (dto.status !== GameStatuses.finished) {
            this.rootElement.append(this.#settingsGame(dto))
        }

        if (dto.status === GameStatuses.pending) {
            this.rootElement.append(this.#settingsScreen())
            return
        }

        if (dto.status === GameStatuses.in_progress || dto.status === GameStatuses.paused) {
            this.rootElement.append(this.#score(dto))
            this.rootElement.append(this.#gridScreen(dto))
        }

        if (dto.status === GameStatuses.paused) {
            this.#showStopGameDialog()
        }

        if (dto.status === GameStatuses.finished) {
            this.#showFinishGameDialog(dto)
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
                    googleElement.src = `${ICONS_PATH}googleIcon.svg`
                    googleElement.alt = 'Google'
                    cellElement.appendChild(googleElement)
                }
                if (dto.player1Position && x === dto.player1Position.x && y === dto.player1Position.y) {
                    const player1 = document.createElement('img')
                    player1.src = `${ICONS_PATH}man01.svg`
                    player1.alt = 'Player1'
                    cellElement.appendChild(player1)
                }
                if (dto.player2Position && x === dto.player2Position.x && y === dto.player2Position.y) {
                    const player2 = document.createElement('img')
                    player2.src = `${ICONS_PATH}man02.svg`
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
            this.#callbacks.onStart?.()
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

        if (dto.status === GameStatuses.in_progress) {
            wrapper.append(this.#stopGame())
        }

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

        const stopIcon = `${ICONS_PATH}stopIcon.svg`
        stopButtonElement.innerHTML = `<img src="${stopIcon}" alt="Stop game" style="width: 20px; height: 20px; vertical-align: middle">`

        stopButtonElement.addEventListener('click', () => {
            this.#callbacks.onStop?.()
        })
        return stopButtonElement
    }

    #stopGameDialog() {
        const dialog = document.createElement('dialog')
        dialog.className = 'stopGameDialog'

        const text = document.createElement('p')
        text.textContent = 'GAME PAUSED'

        const wrapper = document.createElement('div')
        wrapper.className = 'stopGameDialogWrapper'

        const quitButton = document.createElement('button')
        const quitIcon = `${ICONS_PATH}quitIcon.svg`
        quitButton.innerHTML = `<img src="${quitIcon}" alt="Quit game" style="width: 20px; height: 20px; vertical-align: middle"> QUIT`
        quitButton.className = 'quitButton'
        quitButton.addEventListener('click', () => {
            dialog.close()
            dialog.remove()
            this.#stopDialog = null
            this.#callbacks.onFinish?.()
        })

        const resumeButton = document.createElement('button')
        const resumeIcon = `${ICONS_PATH}resumeIcon.svg`
        resumeButton.innerHTML = `<img src="${resumeIcon}" alt="Resume game" style="width: 20px; height: 20px; vertical-align: middle"> RESUME`
        resumeButton.className = 'resumeButton'
        resumeButton.addEventListener('click', () => {
            dialog.close()
            dialog.remove()
            this.#stopDialog = null
            this.#callbacks.onResume?.()
        })

        wrapper.append(quitButton, resumeButton)
        dialog.append(text, wrapper)
        return dialog
    }

    #showStopGameDialog() {
        if (this.#stopDialog) return
        this.#stopDialog = this.#stopGameDialog()
        document.body.append(this.#stopDialog)
        this.#stopDialog.showModal()
    }

    #infoGameDialog() {
        const dialog = document.createElement('dialog')
        dialog.className = 'infoGameDialog'

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
        this.#infoDialog = this.#infoGameDialog()
        document.body.append(this.#infoDialog)
        this.#infoDialog.showModal()
    }

    #score(dto) {
        const score = document.createElement('div')
        score.className = 'score'
        score.innerHTML = ''

        const scorePlayer1 = document.createElement('div')
        const player1 = `${ICONS_PATH}man01.svg`
        scorePlayer1.innerHTML = `Player 1: <img src="${player1}" alt="Player 1" style="width: 48px; height: 48px; vertical-align: middle"> ${dto.score[1].points}`

        const scorePlayer2 = document.createElement('div')
        const player2 = `${ICONS_PATH}man02.svg`
        scorePlayer2.innerHTML = `Player 2: <img src="${player2}" alt="Player 2" style="width: 48px; height: 48px; vertical-align: middle"> ${dto.score[2].points}`

        const scoreGoogle = document.createElement('div')
        const google = `${ICONS_PATH}googleIcon.svg`
        scoreGoogle.innerHTML = `Google: <img src="${google}" alt="Google" style="width: 48px; height: 48px; vertical-align: middle"> ${dto.score.google.jumps}`

        score.append(
            scorePlayer1,
            scorePlayer2,
            scoreGoogle,
            this.#showTimerGame(dto),
        )
        return score
    }

    #showTimerGame(dto) {
        const timerElement = document.createElement('div')
        timerElement.className = 'timeGame'

        const textElement = document.createElement('span')
        textElement.textContent = 'Time'

        const timer = document.createElement('div')
        timer.className = 'timer'
        let minutes = String(Math.floor(dto.gameTime / 60)).padStart(2, '0')
        let seconds = String(dto.gameTime % 60).padStart(2, '0')
        timer.textContent = `${minutes}:${seconds}`

        timerElement.append(textElement, timer)
        return timerElement
    }

    #finishGameDialog(dto) {
        const dialog = document.createElement('dialog')
        dialog.className = 'finishGameDialog'
        dialog.append(this.#createFinishCard(dto, dialog))
        return dialog
    }

    #showFinishGameDialog(dto) {
        console.log(dto.winnerPlayerId, dto.score)
        if (this.#finishDialog) return
        this.#finishDialog = this.#finishGameDialog(dto)
        document.body.append(this.#finishDialog)
        this.#finishDialog.showModal()
    }

    #createFinishCard(dto, dialog) {
        const finishCard = document.createElement('div')
        finishCard.className = 'finishCard'

        const ellipseImage = document.createElement('img')
        ellipseImage.src = `${ICONS_PATH}ellipseIcon.svg`
        ellipseImage.alt = 'ellipse'
        ellipseImage.className = 'ellipseImage'

        const winImage = document.createElement('img')
        winImage.src = `${ICONS_PATH}winnerIcon.svg`
        winImage.alt = 'You win'
        winImage.className = 'winImage'

        const lossImage = document.createElement('img')
        lossImage.src = `${ICONS_PATH}lossIcon.svg`
        lossImage.alt = 'Google Win'
        lossImage.className = 'winImage'

        const image = document.createElement('img')
        image.src = `${ICONS_PATH}t-ShirtIcon.svg`
        image.alt = 'Results game'
        image.className = 'finishCardImage'

        const resultImage = dto.winnerPlayerId === 'Google' ? lossImage : winImage

        finishCard.append(
            ellipseImage,
            resultImage,
            image,
            this.#createWinnerTitle(dto),
            this.#createWinnerName(dto),
            this.#createWinnerScore(dto),
            this.#createWinnerTime(dto),
            this.#createPlayAgainButton(dialog),
            this.#createMainPageButton(dialog)
        )
        return finishCard
    }

    #createWinnerTitle(dto) {
        const winnerTitle = document.createElement('p')
        winnerTitle.className = 'winnerTitle'
        const title = {
            1: 'You Win!',
            2: 'You Win!',
            Google: 'Google Win!',
            Draw: 'Draw',
        }
        winnerTitle.textContent = title[dto.winnerPlayerId]
        return winnerTitle
    }

    #createWinnerName(dto) {
        const winnerName = document.createElement('p')
        winnerName.className = 'winnerName'
        const names = {
            1: 'Player 1',
            2: 'Player 2',
            Google: 'You\'ll be lucky next time',
            Draw: 'Draw',
        }
        winnerName.textContent = names[dto.winnerPlayerId]
        return winnerName
    }

    #createWinnerScore(dto) {
        const wrapperScore = document.createElement('div')
        wrapperScore.className = 'scoreWrapper'

        const scoreText = document.createElement('span')
        scoreText.className = 'scoreText'
        scoreText.textContent = 'Catch:'

        const score = document.createElement('span')
        score.className = 'scoreFinish'

        const scores = {
            1: dto.score[1].points,
            2: dto.score[2].points,
            Google: dto.score.google.jumps,
            Draw: dto.score[1].points,
        }
        score.textContent = scores[dto.winnerPlayerId]

        wrapperScore.append(scoreText, score)
        return wrapperScore
    }

    #createWinnerTime(dto) {
        const wrapperTime = document.createElement('div')
        wrapperTime.className = 'timeWrapper'

        const timeText = document.createElement('span')
        timeText.className = 'timeText'
        timeText.textContent = 'Time:'

        const time = document.createElement('span')
        time.className = 'time'
        let minutes = Math.floor(dto.gameTime / 60)
        let seconds = String(dto.gameTime % 60).padStart(2, '0')
        time.textContent = `${minutes}m ${seconds}s`

        wrapperTime.append(timeText, time)
        return wrapperTime
    }

    #createPlayAgainButton(dialog) {
        const playAgainButton = document.createElement('button')
        playAgainButton.textContent = 'Play again'
        playAgainButton.className = 'playAgainButton'

        playAgainButton.addEventListener('click', () => {
            dialog.close()
            dialog.remove()
            this.#finishDialog = null
            this.#callbacks.onRestart?.()
            this.#showInfoDialog()
        })
        return playAgainButton
    }

    #createMainPageButton(dialog) {
        const mainPageButton = document.createElement('button')
        mainPageButton.textContent = 'On main page'
        mainPageButton.className = 'mainPageButton'

        mainPageButton.addEventListener('click', () => {
            dialog.close()
            dialog.remove()
            this.#finishDialog = null
            this.#callbacks.onMainPage?.()

        })
        return mainPageButton
    }
}
