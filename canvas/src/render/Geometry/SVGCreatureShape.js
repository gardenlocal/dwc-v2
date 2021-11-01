import * as PIXI from 'pixi.js'
import PixiSVG from '../../svg-lib'
import { LayerNames } from './LayerNames'
import SVGCreatureLayer from './SVGCreatureLayer'

let sharedRenderer = PIXI.autoDetectRenderer()
let sharedRenderTexture = PIXI.RenderTexture.create({ width: 2000, height: 2000 })

export default class SVGCreatureShape extends PIXI.Graphics {
    constructor(svgAsset, elementType, connectedElements, fillColor) {
        super()
        this.svgAsset = svgAsset
        this.elementType = elementType
        this.connectedElements = connectedElements
        this.svg = new PixiSVG(this.svgAsset, { unpackTree: true })
        this.fillColor = fillColor

        this.layers = {}
        this.initialized = false
        this.initialize()
    }

    initialize() {        
        if (this.initialized) return
        this.initialized = true
        // First draw the entire SVG onto an off-screen render texture, in order for the geometry to be computed.
        sharedRenderer.render(this.svg, { renderTexture: sharedRenderTexture })

        // Select the layers of the SVG we want to render. For now, it's just the one called "main-shape"
        const layersOfInterest = {
            [LayerNames.mainShape]: this.findLayerByName(LayerNames.mainShape)
        }

        // Create the layers
        for (const [key, value] of Object.entries(layersOfInterest)) {
            console.log('creating layers: ', key, value)
            this.layers[key] = new SVGCreatureLayer(key, value, this.fillColor)
            this.addChild(this.layers[key])
        }

        // Read meta-data from SVG        
        const origin = this.findLayerByName(LayerNames.origin)

        if (origin) {
            this.origin = {
                x: origin.px,
                y: origin.py
            }
        }

        this.connectors = {}

        const connectorsGroup = this.findLayerByName(LayerNames.connectors)
        if (connectorsGroup && this.connectedElements) {
            for (let connectorType of this.connectedElements) {
                const el = this.findChildByName(connectorsGroup, connectorType)
                if (!el) continue

                this.connectors[connectorType] = []
                for (let connector of el.children) {
                    let props = connector.name.split('_')
                    let anchor = { x: 0, y: 0 }
                    if (props.length >= 2) {
                        anchor.x = parseFloat(props[0])
                        anchor.y = parseFloat(props[1])
                    }

                    this.connectors[connectorType].push({ x: connector.px, y: connector.py, anchor })
                }
            }
        }
    }

    getConnectorForType(type, index) {
        return this.connectors[type][index]
    }

    tick() {
        if (!this.initialized) {
            this.initialize()
        }
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
        return this.findChildByName(this.svg, name)
    }

    findChildByName(el, name) {
        // Equal
        if (el.name == name) return el
        // Or prefix
        if (el.name && el.name.indexOf(name) == 0) return el

        for (let child of el.children) {
            let res = this.findChildByName(child, name)
            if (res != null) return res
        }
        return null
    }
}