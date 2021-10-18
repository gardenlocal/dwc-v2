import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';

export default class ComplexCreature  extends PIXI.Graphics {
    constructor(svgAssetName) {
        super()
        this.svgAssetName = svgAssetName
        const svgData = PIXI.Loader.shared.resources[this.svgAssetName].data

        const allElements = Object.values(DWC_META.creaturesNew.moss)

        //this.svgShape = new SVGCreatureShape(svgData, DWC_META.creaturesNew.moss, Object.values(DWC_META.creaturesNew.moss))
        //this.addChild(this.svgShape)

        this.noElements = randomIntInRange(2, 16)
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

            console.log('x offset', xOffset, element.getBounds())
            
            xOffset += element.getBounds().width                
            yOffset += element.getConnectorForType(nextTypeKey, connectorIndex).y
        }
    }
}