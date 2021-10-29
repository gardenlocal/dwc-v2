import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange, lerp, easeInOutQuart, map, constrain } from '../utils';

export default class Particle extends PIXI.Graphics {
    constructor(creatureType, elementType, noElements, elementsProps) {
        super()
        this.creatureType = creatureType
        this.elementType = elementType
        this.noElements = noElements
        this.elementsProps = elementsProps

        this.elements = []
        let xOffset = 0, yOffset = 0
        let prevElement = null
        let connector = null

        let fillColor = (Math.random() < 0.5) ? 0x0cef42 : 0xfd880b

        for (let i = 0; i < this.noElements; i++) {
            const { typeKey, nextTypeKey, connectorIndex } = this.elementsProps[i]            
            const svgData = PIXI.Loader.shared.resources[typeKey].data
            
            let element = new SVGCreatureShape(svgData, typeKey, Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors), fillColor)
            
            //const targetScale = 1//Math.random() < 0.5 ? 1 : 0.5
            const targetScale = Math.random() < 0.5 ? 1 : 0.5
            let pX = 0, pY = 0
            if (connector) {
                let bbox = element.getBounds()
                pX = connector.anchor.x * bbox.width
                pY = connector.anchor.y * bbox.height
            } else {
                let bbox = element.getBounds()
                let { anchor } = DWC_META.creaturesNew[creatureType][elementType]
                pX = anchor.x * bbox.width
                pY = anchor.y * bbox.height
            }
            
            let elementContainer = new PIXI.Container()
            elementContainer.position.set(xOffset, yOffset)
            elementContainer.addChild(element)

            element.pivot.set(pX, pY)
            element.position.set(pX, pY)
            element.scale.set(1)
            element.alpha = 0.01
            element.targetScale = targetScale

            this.elements.push(elementContainer)
            /*
            element.pivot.set(xOffset, yOffset)
            element.x = 0
            element.y = 0
            element.scale.set(1, 1)
            */
            this.addChild(elementContainer)

            connector = element.getConnectorForType(nextTypeKey, connectorIndex)
            console.log('Connector: ', connector)

            xOffset += connector.x
            yOffset += connector.y//element.getConnectorForType(nextTypeKey, connectorIndex).y

            prevElement = element
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
    startAnimatingGrowth(durationPerElement) {
        this.growthAnimation.durationPerElement = durationPerElement
        this.growthAnimation.tHead = 0
        this.growthAnimation.running = true
        this.growthAnimation.currElement = 0
    }
    stopAnimatingGrowth() {        
        this.growthAnimation.tHead = 0
        this.growthAnimation.running = false
        this.growthAnimation.currElement = 0        
    }
    tick(d) {
        //this.elements.forEach(e => e.tick())
        const delta = PIXI.Ticker.shared.elapsedMS
        if (this.growthAnimation.running) {            
            const { tHead, durationPerElement, currElement } = this.growthAnimation
            const alpha = constrain(map(tHead, 0, durationPerElement, 0, 1), 0, 1)
            const targetScale = this.children[currElement].children[0].targetScale

            this.children[currElement].children[0].scale.set(easeInOutQuart(alpha) * targetScale)
            this.children[currElement].children[0].alpha = 1

            if (tHead > durationPerElement) {
                this.growthAnimation.tHead -= durationPerElement
                this.growthAnimation.currElement++                
                if (this.growthAnimation.currElement >= this.children.length) {
                    this.stopAnimatingGrowth()
                }
            }

            this.growthAnimation.tHead += delta
        }        
    }
}