import {Game} from './core/game/game.js'
import {Controller} from './ui/controller.js'
import {View} from './ui/view.js'

const view = new View()

let controller
const model = new Game({
    onChange: () => {
        controller.render()
    },
})

controller = new Controller(view, model)