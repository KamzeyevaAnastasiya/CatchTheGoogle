import {Controller} from './ui/controller.js'
import {View} from './ui/view.js'
import {GameRemoteProxy} from "./back/game-remote-proxy.js";

const view = new View()

let controller
const model = new GameRemoteProxy({
    onChange: () => {
        controller.render()
    },
})

controller = new Controller(view, model)