export const GameStatuses = {
    pending: 'pending',
    in_progress: 'in_progress',
    paused: 'paused',
    finished: 'finished',
}

export const MoveDirections = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
}

const WS_URL =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
        ? 'ws://localhost:8080'
        : 'wss://your-project.onrender.com';