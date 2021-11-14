import * as PIXI from 'pixi.js'
import { DWC_META, getMossNextChildConnector } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { sleep } from '../utils';
import TWEEN from '@tweenjs/tween.js'

export default class LichenParticle extends PIXI.Graphics {
    constructor(creatureType, { type, children, visibleChildren, parentConnector }, fillColor) {
        super()

        this.creatureType = creatureType
        this.type = type
        this.allChildren = children
        this.visibleChildren = visibleChildren || children.length
        this.parentConnector = parentConnector
        this.fillColor = fillColor

        this.elements = this.allChildren.slice(0, visibleChildren)
        this.elementsIndex = visibleChildren

        this.frame = 0

        const svgParentData = PIXI.Loader.shared.resources[this.type].data
        this.parentElement = new SVGCreatureShape(svgParentData, this.type, Object.keys(DWC_META.creaturesNew[this.creatureType][this.type].connectors), this.fillColor)
        // this.parentElement.alpha = 0.0001
        if (parentConnector == null) {
            const bbox = this.parentElement.getLocalBounds()
            this.pivot.set(bbox.width / 2, bbox.height / 2)
        }
        this.addChild(this.parentElement)

        for (let c of this.elements) {
            // if (this.parentConnector)
            const ch = this.createChildFromConnector(c)
    
            this.addChild(ch)    
        }

        // this.alpha = 0.0001

        this.targetScale = { x: 1, y: 1 }
    }
    createChildFromConnector(c) {
        const ch = new LichenParticle(this.creatureType, c, this.fillColor)
        const connector = ch.parentElement.getConnectorForType(c.type, c.parentConnector)

        const bbox = ch.parentElement.getLocalBounds()
        const pX = bbox.width * connector.anchor.x
        const pY = bbox.height * connector.anchor.y

        ch.position.set(connector.x, connector.y)                        
        ch.parentElement.position.set(0, 0)
        ch.pivot.set(pX, pY)                            
        ch.targetScale = { x: 0.5, y: 0.5 }
        // ch.scale.set(0.0, 0.0)
        ch.alpha = 0.0001

        return ch
    }
    getNumberOfElements() {
        return this.elements.length
    }
    hideAll() {
        this.alpha = 0
        for (let i = 1; i < this.children.length; i++) {
            this.children[i].hideAll()
        }
    }
    async startAnimatingGrowth(durationPerElement, delayPerElement = 200) {
        if (this.parentConnector == null) this.hideAll()
        const el = this
        el.scale.set(0.0)
        el.alpha = 1

        const tween = new TWEEN.Tween(this.scale)
        .to({x: this.targetScale.x, y: this.targetScale.y }, durationPerElement)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        await sleep(delayPerElement)

        for (let i = 1; i < this.children.length; i++) {
            const el = this.children[i]
            await el.startAnimatingGrowth(durationPerElement, delayPerElement)
            await sleep(delayPerElement)
        }
    }
    async evolve(duration) {
        /*
        let el = this.elements[0].children[0]
        const tween = new TWEEN.Tween(el.scale)
        .to({x: 0, y: 0 }, duration)
        .easing(TWEEN.Easing.Quartic.Out)
        .start()
        await sleep(duration / 2)

        this.removeChild(this.children[0])
        this.elements.shift()

        const lastElement = this.elements[this.elements.length - 1].children[0]
        const nextConnector = this.allElementsProps[this.allElementsIndex] //getMossNextChildConnector(this.creatureType, lastElement.nextTypeKey)
        console.log('next connector: ', nextConnector)
        
        const nextElement = this.createChildFromConnector(nextConnector, this.connector)
        this.elements.push(nextElement)
        this.addChild(nextElement)

        el = nextElement.children[0]
        el.scale.set(0)
        el.alpha = 1
        const tween2 = new TWEEN.Tween(el.scale)
        .to({x: el.targetScale.x, y: el.targetScale.y }, duration)
        .easing(TWEEN.Easing.Quartic.In)
        .start()

        this.connector = el.getConnectorForType(nextConnector.nextTypeKey, nextConnector.connectorIndex)         
        this.xOffset += this.connector.x
        this.yOffset += this.connector.y
        this.allElementsIndex++

        await sleep(3 * duration / 2)

        //this.bbox = this.getBounds()
        //this.pivot.set(-this.bbox.x, -this.bbox.y)
        */
    }
    stopAnimatingGrowth() {        
    }
    tick(d) {
        this.children.forEach(c => c.children[0].tick())
        /*
        this.frame++
        if (this.frame % 30 == 0) {
            this.x += 10
            this.y += 5.666
            this.rotation += 0.05
        }
        */       
    }
}