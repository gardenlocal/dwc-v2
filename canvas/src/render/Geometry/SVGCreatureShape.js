import * as PIXI from 'pixi.js'
import PixiSVG from '../../svg-lib'
import { LayerNames } from './LayerNames'
import SVGCreatureLayer from './SVGCreatureLayer'

let sharedRenderer = PIXI.autoDetectRenderer()
let sharedRenderTexture = PIXI.RenderTexture.create({ width: 2000, height: 2000 })

export default class SVGCreatureShape extends PIXI.Graphics {
    constructor(svgAsset) {
        super()
        this.svgAsset = svgAsset
        this.svg = new PixiSVG(this.svgAsset, { unpackTree: true })

        this.layers = {}
        this.initialize()
    }

    initialize() {        
        sharedRenderer.render(this.svg, { renderTexture: sharedRenderTexture })

        const layersOfInterest = {
            [LayerNames.mainShape]: this.findLayerByName(LayerNames.mainShape)
        }

        for (const [key, value] of Object.entries(layersOfInterest)) {
            this.layers[key] = new SVGCreatureLayer(key, value)
            this.addChild(this.layers[key])
        }
    }

    tick() {
        Object.values(this.layers).forEach(l => l.tick())
    }

    findLayerByName(name) {
        return this._dfsFindName(this.svg, name)
    }

    _dfsFindName(el, name) {
        if (el.name == name) return el
        for (let child of el.children) {
            let res = this._dfsFindName(child, name)
            if (res != null) return res
        }
        return null
    }
}