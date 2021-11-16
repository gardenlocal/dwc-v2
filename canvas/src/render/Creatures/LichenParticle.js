import * as PIXI from 'pixi.js'
import { DWC_META, getMossNextChildConnector } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { sleep } from '../utils';
import TWEEN from '@tweenjs/tween.js'

export default class LichenParticle extends PIXI.Container {
    constructor(creatureType, { type, children, visibleChildren, parentConnector, evolutionIndex }, fillColor) {
        super()

        this.creatureType = creatureType
        this.type = type
        this.allChildren = children
        this.visibleChildren = visibleChildren || children.length
        this.parentConnector = parentConnector
        this.fillColor = fillColor        

        if (this.parentConnector == null) {
            // top level
            this.elementsIndex = (evolutionIndex % this.allChildren.length)
            this.elements = []

            for (let i = this.elementsIndex - this.visibleChildren; i < this.elementsIndex; i++) {
                const index = (i + this.allChildren.length) % this.allChildren.length
                this.elements.push(this.allChildren[index])
            }
        } else {
            this.elementsIndex = visibleChildren
            this.elements = this.allChildren.slice(0, visibleChildren)
        }        

        this.frame = 0

        const svgParentData = PIXI.Loader.shared.resources[this.type].data
        this.parentElement = new SVGCreatureShape(svgParentData, this.type, Object.keys(DWC_META.creaturesNew[this.creatureType][this.type].connectors), this.fillColor)
        // this.parentElement.alpha = 0.0001
        if (parentConnector == null) {
            const bbox = this.parentElement.getLocalBounds()
            this.pivot.set(bbox.width / 2, bbox.height / 2)
        }
        this.addChild(this.parentElement)

        this.onlyChildren = []
        for (let c of this.elements) {
            const ch = this.createChildFromConnector(c)
            this.addChild(ch)
            this.onlyChildren.push(ch)   
        }

        // this.alpha = 0.0001

        this.targetScale = { x: 1, y: 1 }
    }
    createChildFromConnector(c) {
        const ch = new LichenParticle(this.creatureType, { ...c, evolutionIndex: -1 }, this.fillColor)
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
    async startAnimatingGrowth(durationPerElement, delayPerElement = 350) {
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
    async startAnimatingDeath(durationPerElement, delayPerElement = 200) {
        for (let i = 1; i < this.children.length; i++) {
            const el = this.children[i]
            await el.startAnimatingDeath(durationPerElement, delayPerElement)
            // await sleep(delayPerElement)
        }

        const tween = new TWEEN.Tween(this.scale)
        .to({x: 0, y: 0 }, durationPerElement)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()

        await sleep(durationPerElement)
    }
    async evolve(duration) {
        let el = this.onlyChildren[0]
        await el.startAnimatingDeath(1000)
        this.removeChild(el)
        this.onlyChildren.shift()

        const newChild = this.createChildFromConnector(this.allChildren[this.elementsIndex])
        this.addChild(newChild)
        this.onlyChildren.push(newChild)
        await newChild.startAnimatingGrowth(1500)

        this.elementsIndex = (this.elementsIndex + 1) % this.allChildren.length
    }
    tick(d) {
        this.children.forEach(c => c.children[0].tick())
    }
}