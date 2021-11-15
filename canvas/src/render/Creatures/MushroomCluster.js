import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange, sleep } from '../utils';
import MushroomParticle from './MushroomParticle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";
import TWEEN from '@tweenjs/tween.js';

export default class MushroomCluster extends PIXI.Container {
    constructor(params, creatureName) {
        super()
        this.params = params
        const { creatureType, svgElementIndex, evolutionIndex, evolutions, scale, rotation, fillColor } = params
        this.fillColor = fillColor
        this.creatureType = creatureType
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

        this.evolutions = evolutions
        this.evolutionIndex = evolutionIndex % evolutions.length

        console.log('Mushroom evolution index: ', this.evolutionIndex)
        
        const { mainSectionChildren, mirrorSectionScale, mirrorSectionChildren, mirrorSectionParentIndex } = this.evolutions[this.evolutionIndex]

        this.creature = new PIXI.Container()

        this.creatureTop = new MushroomParticle(this.creatureType, this.elementType, mainSectionChildren, fillColor)        
        this.creatureBottom = this.generateChildFromParameters(this.evolutions[this.evolutionIndex])
        
        this.creature.addChild(this.creatureTop)
        this.creature.addChild(this.creatureBottom)

        const bbox = this.creature.getBounds()
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

        const creatureBottom = new MushroomParticle(this.creatureType, this.elementType, mirrorSectionChildren, this.fillColor)
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
        this.evolutionIndex = (this.evolutionIndex + 1) % this.evolutions.length
        let currEvolution = this.evolutions[this.evolutionIndex]

        await this.creatureBottom.startAnimatingDeath(duration)
        await this.creatureTop.updateChildrenDimensions(currEvolution.mainSectionChildrenAnims[0])
        await this.creatureTop.updateChildrenDimensions(currEvolution.mainSectionChildrenAnims[1])
        await this.creatureTop.updateChildrenDimensions(currEvolution.mainSectionChildren)
        this.creature.removeChild(this.creatureBottom)
        this.creatureBottom = this.generateChildFromParameters(currEvolution)
        this.creature.addChild(this.creatureBottom)
        await this.creatureBottom.startAnimatingGrowth(1500)
        // await this.evolve(1500)
    }

    async startAnimatingGrowth(elementDuration) {
        this.creatureTop.hideAll()
        this.creatureBottom.hideAll()
        await this.creatureTop.startAnimatingGrowth(elementDuration)
        await this.creatureBottom.startAnimatingGrowth(elementDuration)
        await sleep(1000)
        // await this.evolve(1500)
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        this.creature.children.forEach(c => c.tick())
    }
}