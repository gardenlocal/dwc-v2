import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange, sleep } from '../utils';
import MushroomParticle from './MushroomParticle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";
import TWEEN from '@tweenjs/tween.js';

export default class MushroomCluster extends PIXI.Graphics {
    constructor(params, creatureName) {
        super()
        this.params = params
        const { creatureType, svgElementIndex, mirrorSectionScale, mainSectionChildren, mirrorSectionChildren, mirrorSectionParentIndex, scale, rotation, fillColor } = params
        this.creatureType = creatureType
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

        let creatureTopChildren = mainSectionChildren

        this.creatureTop = new MushroomParticle(this.creatureType, this.elementType, creatureTopChildren, fillColor)
        const topBBox = this.creatureTop.getBounds()

        /*
        this.creatureBottom = new MushroomParticle(this.creatureType, this.elementType, creatureBottomChildren, fillColor)
        this.creatureBottom.scale.set(mirrorSectionScale, mirrorSectionScale)
        const bottomBBox = this.creatureBottom.getBounds()                
        
        const childBounds = this.creatureTop.getChildBounds(mirrorSectionParentIndex)
        const gX = childBounds.x + childBounds.width
        const gY = childBounds.y + childBounds.height / 2
        const pos = this.toLocal(new PIXI.Point(gX, gY))
        this.creatureBottom.position.set(pos.x, pos.y - bottomBBox.height / 2)
        */
        this.creature = new PIXI.Container()        
        this.creatureBottom = this.generateChildFromParameters(params)
        
        this.creature.addChild(this.creatureTop)
        this.creature.addChild(this.creatureBottom)

        const bbox = this.creature.getBounds()
        // this.creature.pivot.set(-bbox.width / 2, 0)

        this.addChild(this.creature)

        const textStyle = new PIXI.TextStyle({
            fontSize: 40,
            fill: fillColor,
            stroke: "white",
        })
        const message = new PIXI.Text(creatureName, textStyle);
        message.position.set(bbox.x + bbox.width - message.getBounds().width / 2, -15)
        message.scale.set(0.25)
        this.addChild(message)


        const selfBbox = this.getBounds()

        this.pivot.set(selfBbox.width / 2, selfBbox.height / 2)
        this.scale.set(scale)
        this.rotation = rotation      

    }

    generateChildFromParameters({ mirrorSectionChildren, mirrorSectionScale, mirrorSectionParentIndex, fillColor }) {
        const oldRotation = this.rotation
        this.rotation = 0
        console.log('generate child from parameters: ', mirrorSectionParentIndex)
        const creatureBottom = new MushroomParticle(this.creatureType, this.elementType, mirrorSectionChildren, fillColor)
        creatureBottom.scale.set(mirrorSectionScale, mirrorSectionScale)
        const bottomBBox = creatureBottom.getBounds()                
        
        const childBounds = this.creatureTop.getChildBounds(mirrorSectionParentIndex)
        const gX = childBounds.x + childBounds.width
        const gY = childBounds.y + childBounds.height / 2
        const pos = this.creature.toLocal(new PIXI.Point(gX, gY))
        creatureBottom.position.set(pos.x, pos.y - bottomBBox.height / 2)
        this.rotation = oldRotation

        return creatureBottom
    }

    async evolve(duration) {
        await this.creatureBottom.startAnimatingDeath(duration)
        await this.creatureTop.updateChildrenDimensions([])
        await this.creatureTop.updateChildrenDimensions([])
        await this.creatureTop.updateChildrenDimensions([])
        this.creature.removeChild(this.creatureBottom)
        this.creatureBottom = this.generateChildFromParameters(this.params)
        this.creature.addChild(this.creatureBottom)
        await this.creatureBottom.startAnimatingGrowth(1500)
        await this.evolve(1500)
    }

    async startAnimatingGrowth(elementDuration) {
        await this.creatureTop.startAnimatingGrowth(elementDuration)
        await this.creatureBottom.startAnimatingGrowth(elementDuration)
        await sleep(1000)
        await this.evolve(1500)
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        this.creature.children.forEach(c => c.tick())
    }
}