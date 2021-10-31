import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { sleep } from '../utils';
import TWEEN from '@tweenjs/tween.js'

export default class Particle extends PIXI.Graphics {
    constructor(creatureType, elementType, elementsProps, fillColor) {
        super()
        this.creatureType = creatureType
        this.elementType = elementType        
        this.elementsProps = elementsProps
        this.noElements = elementsProps.length

        this.elements = []
        let xOffset = 0, yOffset = 0
        let prevElement = null
        let connector = null

        this.frame = 0

        //let fillColor = 0xffffff//(Math.random() < 0.5) ? 0x0cef42 : 0xfd880b

        for (let i = 0; i < this.noElements; i++) {
            const { typeKey, nextTypeKey, connectorIndex } = this.elementsProps[i]            
            const svgData = PIXI.Loader.shared.resources[typeKey].data
            
            let element = new SVGCreatureShape(svgData, typeKey, Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors), fillColor)
            
            //const targetScale = 1//Math.random() < 0.5 ? 1 : 0.5
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
            element.alpha = 0.001

            const targetScale = { x: 1, y: 1 }//Math.random() < 0.5 ? 1 : 0.5
            element.targetScale = targetScale

            this.elements.push(elementContainer)
            this.addChild(elementContainer)

            connector = element.getConnectorForType(nextTypeKey, connectorIndex)
            xOffset += connector.x
            yOffset += connector.y

            prevElement = element
        }
    }
    getNumberOfElements() {
        return this.elements.length
    }
    async startAnimatingGrowth(durationPerElement, delayPerElement = 500) {
        for (let i = 0; i < this.elements.length; i++) {
            const el = this.elements[i].children[0]
            el.scale.set(0)
            el.alpha = 1
            const tween = new TWEEN.Tween(el.scale)
            .to({x: el.targetScale.x, y: el.targetScale.y }, durationPerElement)
            .easing(TWEEN.Easing.Quartic.InOut)
            .start()
            await sleep(delayPerElement)
        }            

    }
    stopAnimatingGrowth() {        
    }
    tick(d) {
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