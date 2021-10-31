import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';
import MushroomParticle from './MushroomParticle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";

export default class MushroomCluster extends PIXI.Graphics {
    constructor({ creatureType, svgElementIndex, mirrorSectionScale, mainSectionChildren, mirrorSectionChildren, scale, rotation, fillColor }) {
        super()
        this.creatureType = creatureType
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

        let creatureTopChildren = mainSectionChildren
        let creatureBottomChildren = mirrorSectionChildren

        this.creatureTop = new MushroomParticle(this.creatureType, this.elementType, creatureTopChildren, fillColor)
        const topBBox = this.creatureTop.getBounds()

        this.creatureBottom = new MushroomParticle(this.creatureType, this.elementType, creatureBottomChildren, fillColor)

        this.creatureBottom.scale.set(-mirrorSectionScale, mirrorSectionScale)
        const bottomBBox = this.creatureBottom.getBounds()        
        this.creatureBottom.position.set(0, topBBox.height / 2 - bottomBBox.height / 2)        

        this.creature = new PIXI.Container()
        this.creature.addChild(this.creatureTop)
        this.creature.addChild(this.creatureBottom)
        const bbox = this.creature.getBounds()
        this.creature.pivot.set(-bbox.width / 2, 0)

        this.addChild(this.creature)

        const selfBbox = this.getBounds()

        this.pivot.set(selfBbox.width / 2, selfBbox.height / 2)
        this.scale.set(scale)
        this.rotation = rotation
      
    }

    async startAnimatingGrowth(elementDuration) {
        await this.creatureTop.startAnimatingGrowth(elementDuration)
        this.creatureBottom.startAnimatingGrowth(elementDuration)
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        this.creature.children.forEach(c => c.tick())
    }
}