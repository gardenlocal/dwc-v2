import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';

export default class Particle extends PIXI.Graphics {
    constructor(svgAssetName, noElements, elementsProps) {
        super()
        this.svgAssetName = svgAssetName
        this.noElements = noElements
        this.elementsProps = elementsProps

        /*
        this.noElements = randomIntInRange(2, 5)
        this.elementsProps = []
        let typeKey, nextTypeKey

        nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew.moss))
        for (let i = 0; i < this.noElements; i++) {
            typeKey = nextTypeKey
            nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew.moss))

            this.elementsProps.push({
                typeKey: typeKey,
                nextTypeKey: nextTypeKey,
                connectorIndex: randomIntInRange(0, DWC_META.creaturesNew.moss[typeKey].connectors[nextTypeKey])
            })
        }
        */

        this.elements = []
        let xOffset = 0, yOffset = 0

        for (let i = 0; i < this.noElements; i++) {
            const { typeKey, nextTypeKey, connectorIndex } = this.elementsProps[i]            
            const svgData = PIXI.Loader.shared.resources[typeKey].data

            let element = new SVGCreatureShape(svgData, typeKey, Object.keys(DWC_META.creaturesNew.moss))
            this.elements.push(element)
            element.x = xOffset
            element.y = yOffset

            this.addChild(element)
            
            xOffset += element.getBounds().width                
            yOffset += element.getConnectorForType(nextTypeKey, connectorIndex).y
        }
    }
}