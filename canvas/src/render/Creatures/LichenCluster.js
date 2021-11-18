import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import LichenParticle from './LichenParticle';
import { sleep } from '../utils';

export default class LichenCluster extends PIXI.Container {
    constructor({ creatureType, scale, rotation, fillColor, element, evolutionIndex }, creatureName) {
        super()
        this.creatureType = creatureType
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[0].name
        this.evolutionIndex = evolutionIndex

        this.creature = new LichenParticle(creatureType, { ...element, evolutionIndex }, fillColor)
        //this.drawParticle()
        this.addChild(this.creature)
        this.selfBbox = this.getBounds()

        // this.creatureBounds = this.getLocalBounds()//this.creature.getLocalBounds()        
        const textStyle = new PIXI.TextStyle({
            fontSize: 22,
            fontFamily: 'Dongle',
            fill: fillColor,
            stroke: "white",
        })

        // this.pivot.set(this.selfBbox.width / 2, this.selfBbox.height / 2)

        this.messageText = new PIXI.Text(creatureName, textStyle);
        this.messageText.scale.set(0.5)
        this.addChild(this.messageText)
        this.textBounds = this.messageText.getLocalBounds()
        this.messageText.pivot.set(this.textBounds.width / 2, this.textBounds.height / 2)        

        this.creatureBounds = this.creature.parentElement.getLocalBounds()//this.creature.getLocalBounds()        
        this.messageText.position.set(0, this.creatureBounds.height / 2 + 5)


        this.scale.set(scale)
        this.rotation = rotation
    }

    async startAnimatingGrowth(elementDuration, elementDelay) {
        if (this.isAnimatingGrowth) return
        this.isAnimatingGrowth = true
        await this.creature.startAnimatingGrowth(elementDuration, elementDelay)
        this.isAnimatingGrowth = false
    }

    async evolve(duration) {
        await this.creature.evolve(duration)
        await sleep(2500)
    }

    stopEvolution() {
        this.stopEvolutionFlag = true
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        this.creature.tick()
        this.creature.position.set(0, 0)
    }
}