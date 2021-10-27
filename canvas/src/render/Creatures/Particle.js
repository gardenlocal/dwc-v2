import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';

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

        for (let i = 0; i < this.noElements; i++) {
            const { typeKey, nextTypeKey, connectorIndex } = this.elementsProps[i]            
            const svgData = PIXI.Loader.shared.resources[typeKey].data

            let element = new SVGCreatureShape(svgData, typeKey, Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors))
            this.elements.push(element)
            element.x = xOffset
            element.y = yOffset

            this.addChild(element)

            const connector = element.getConnectorForType(nextTypeKey, connectorIndex)
            console.log('Connector: ', connector)

            xOffset += connector.x
            yOffset += connector.y//element.getConnectorForType(nextTypeKey, connectorIndex).y

            prevElement = element
        }
    }
}