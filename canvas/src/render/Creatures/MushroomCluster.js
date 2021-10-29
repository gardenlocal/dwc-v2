import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';
import MushroomParticle from './MushroomParticle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";

export default class MushroomCluster extends PIXI.Graphics {
    constructor(creatureType, elementAIndex, mirrorScale = 0.4) {
        super()
        this.creatureType = creatureType        
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[elementAIndex].name

        let creatureTopChildren = this.getElementParams(this.elementA, 3, 8)
        let creatureBottomChildren = this.getElementParams(this.elementA, 3, 8)

        this.creatureTop = new MushroomParticle(this.creatureType, this.elementType, creatureTopChildren)
        const topBBox = this.creatureTop.getBounds()

        this.creatureBottom = new MushroomParticle(this.creatureType, this.elementType, creatureBottomChildren)

        this.creatureBottom.scale.set(-mirrorScale, mirrorScale)
        const bottomBBox = this.creatureBottom.getBounds()        
        this.creatureBottom.position.set(0, topBBox.height / 2 - bottomBBox.height / 2)        

        this.creature = new PIXI.Container()
        this.creature.addChild(this.creatureTop)
        this.creature.addChild(this.creatureBottom)
        const bbox = this.creature.getBounds()
        this.creature.pivot.set(-bbox.width / 2, 0)

        this.addChild(this.creature)
    }

    async startAnimatingGrowth(elementDuration) {
        await this.creatureTop.startAnimatingGrowth(elementDuration)
        this.creatureBottom.startAnimatingGrowth(elementDuration)
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        //this.creature.tick()
    }

    getElementParams(elementType, minChildren, maxChildren) {
        let noElements = randomIntInRange(minChildren, maxChildren)
        let childrenDimensions = []
        let possibleSizes = [2, 3, 4, 5, 6, 8]

        let sum = 0
        for (let i = 0; i < noElements; i++) {
            let curr = randomElementFromArray(possibleSizes)
            childrenDimensions.push(curr)
            sum += curr
        }

        for (let i = 0; i < noElements; i++) {            
            childrenDimensions[i] /= sum
        }

        return childrenDimensions
    }
}