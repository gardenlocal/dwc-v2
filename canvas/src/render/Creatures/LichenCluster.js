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

        const textBoxColor = (fillColor != 0x0cef42) ? 0x0cef42 : 0xfd880b

        this.creature = new LichenParticle(creatureType, { ...element, evolutionIndex }, fillColor)
        //this.drawParticle()
        this.addChild(this.creature)
        this.selfBbox = this.getBounds()

        this.creatureBounds = this.creature.getLocalBounds()        
        const textStyle = new PIXI.TextStyle({
            fontSize: 22,
            fill: textBoxColor,
            stroke: "white",
        })

        // this.pivot.set(this.selfBbox.width / 2, this.selfBbox.height / 2)

        this.messageText = new PIXI.Text("Taeyoon's Lichen", textStyle);
        this.messageText.position.set(10, 5)
        this.messageBg = new PIXI.Graphics()
        const msgBounds = this.messageText.getLocalBounds()
        this.messageBg.beginFill(textBoxColor)
        this.messageBg.drawRect(msgBounds.x, msgBounds.y, msgBounds.width + 20, msgBounds.height + 10)
        this.messageBg.alpha = 0.0001


        this.message = new PIXI.Container()        
        this.message.addChild(this.messageBg)
        this.message.addChild(this.messageText)
        this.message.scale.set(0.25)
        // this.addChild(this.message)
        this.textBounds = this.message.getLocalBounds()
        this.message.position.set(this.creatureBounds.x + this.creatureBounds.width / 2 - this.textBounds.width / 8, this.creatureBounds.y + this.creatureBounds.height / 2 - this.textBounds.height / 8)

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