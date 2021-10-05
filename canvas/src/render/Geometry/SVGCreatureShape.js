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
        // First draw the entire SVG onto an off-screen render texture, in order for the geometry to be computed.
        sharedRenderer.render(this.svg, { renderTexture: sharedRenderTexture })

        // Select the layers of the SVG we want to render. For now, it's just the one called "main-shape"
        const layersOfInterest = {
            [LayerNames.mainShape]: this.findLayerByName(LayerNames.mainShape)
        }

        // Create the layers
        for (const [key, value] of Object.entries(layersOfInterest)) {
            this.layers[key] = new SVGCreatureLayer(key, value)
            this.addChild(this.layers[key])
        }
    }

    tick() {
        Object.values(this.layers).forEach(l => l.tick())
    }

    morph(fromKey, toKey, alpha) {
        //console.log('morph: ', window.DWCCreatureShapes)
        let fromCreature = window.DWCCreatureShapes[fromKey]
        let toCreature = window.DWCCreatureShapes[toKey]
        Object.keys(this.layers).forEach(k => {
            if (fromCreature.layers[k] && toCreature.layers[k]) {
                this.layers[k].morph(fromCreature.layers[k], fromKey, toCreature.layers[k], toKey, alpha)
            }
        })
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