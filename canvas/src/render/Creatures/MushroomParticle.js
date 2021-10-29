import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange, lerp, easeInOutQuart, map, constrain, easeInOutBounce, easeOutBounce, sleep } from '../utils';
import TWEEN from '@tweenjs/tween.js'

export default class MushroomParticle extends PIXI.Graphics {
    constructor(creatureType, elementType, childrenDimensions) {
        super()
        this.creatureType = creatureType
        this.elementType = elementType
        this.childrenDimensions = childrenDimensions
        this.svgData = PIXI.Loader.shared.resources[elementType].data

        this.elements = []
        let xOffset = 0, yOffset = 0
        let prevElement = null
        let connector = null

        let fillColor = 0xffffff//(Math.random() < 0.5) ? 0x0cef42 : 0xfd880b

        const parent = new SVGCreatureShape(this.svgData, elementType, Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors), fillColor)
        const parentBbox = parent.getBounds()
        parent.pivot.set(0, parentBbox.height / 2)
        parent.position.set(0, parentBbox.height / 2)
        parent.targetScale = { x: 1, y: 1 }
        parent.alpha = 0.001
        this.addChild(parent)
        this.elements.push(parent)        

        let yPosition = 0
        console.log(childrenDimensions)
        for (let i = 0; i < childrenDimensions.length; i++) {
            const s = childrenDimensions[i]
            const child = new SVGCreatureShape(this.svgData, elementType, Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors), fillColor)            
            const bbox = child.getBounds()
            child.pivot.set(bbox.width, bbox.height / 2)
            child.scale.set(-s, s)            
            child.position.set(parentBbox.width, parentBbox.height * yPosition + bbox.height / 2 * s)
            child.targetScale = { x: -s, y: s }
            child.alpha = 0.001

            yPosition += s
    
            this.addChild(child)
            this.elements.push(child)
        }

        this.growthAnimation = {
            running: false,
            tHead: 0,
            durationPerElement: 0,
            currElement: 0
        }
    }
    getNumberOfElements() {
        return this.elements.length
    }
    async startAnimatingGrowth(durationPerElement, delayPerElement = 250) {
        const el = this.elements[0]
        el.scale.set(0)
        el.alpha = 1
        console.log('tween is: ', TWEEN)
        const tween = new TWEEN.Tween(this.elements[0].scale)
            .to({x: el.targetScale.x, y: el.targetScale.y }, durationPerElement)
            .easing(TWEEN.Easing.Quartic.InOut)
            .start()

        await sleep(durationPerElement)

        for (let i = 1; i < this.elements.length; i++) {
            const el = this.elements[i]
            el.scale.set(0)
            el.alpha = 1
            const tween = new TWEEN.Tween(el.scale)
            .to({x: el.targetScale.x, y: el.targetScale.y }, durationPerElement)
            .easing(TWEEN.Easing.Quartic.InOut)
            .start()
            await sleep(delayPerElement)
        }
            
        /*
        this.growthAnimation.delayPerElement = delayPerElement || durationPerElement
        this.growthAnimation.durationPerElement = durationPerElement
        this.growthAnimation.tHead = 0
        this.growthAnimation.running = true
        this.growthAnimation.currElement = 0
        this.growthAnimation.animTimes = []

        let t = 0
        for (let i = 0; i < this.elements.length; i++) {
            this.growthAnimation.animTimes.push(t)
            t += this.growthAnimation.delayPerElement
        }
        */
    }
    stopAnimatingGrowth() {        
        this.growthAnimation.tHead = 0
        this.growthAnimation.running = false
        this.growthAnimation.currElement = 0        
    }
    tick(d) {
        /*
        //this.elements.forEach(e => e.tick())
        const delta = PIXI.Ticker.shared.elapsedMS
        if (this.growthAnimation.running) {            
            const { tHead, durationPerElement, currElement } = this.growthAnimation
            const alpha = constrain(map(tHead, 0, durationPerElement, 0, 1), 0, 1)
            const targetScale = this.children[currElement].targetScale

            this.children[currElement].scale.set(easeInOutQuart(alpha) * targetScale.x, easeInOutQuart(alpha) * targetScale.y)
            this.children[currElement].alpha = 1

            if (tHead > durationPerElement) {
                this.growthAnimation.tHead -= durationPerElement
                this.growthAnimation.currElement++                
                if (this.growthAnimation.currElement >= this.children.length) {
                    this.stopAnimatingGrowth()
                }
            }

            this.growthAnimation.tHead += delta
        }  
        */      
    }
}