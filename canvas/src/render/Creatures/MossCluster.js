import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';
import Particle from './MossParticle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";
import TWEEN from '@tweenjs/tween.js'
import { sleep } from '../utils';

export default class Cluster extends PIXI.Container {
    constructor({ creatureType, svgElementIndex, childrenSequence, scale, rotation, fillColor, noVisibleElements, evolutionIndex }, creatureName) {
        super()
        this.creatureType = creatureType
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

        const textBoxColor = (fillColor != 0x0cef42) ? 0x0cef42 : 0xfd880b

        console.log('evolution index is: ', evolutionIndex)

        this.creature = new Particle(this.creatureType, this.elementType, childrenSequence, fillColor, noVisibleElements, evolutionIndex)
        this.addChild(this.creature)
        this.selfBbox = this.getBounds()

        this.creatureBounds = this.creature.getLocalBounds()
        const textStyle = new PIXI.TextStyle({
            fontSize: 22,
            //fill: fillColor,
            //fill: '#f9f9f9',
            fill: textBoxColor,
            stroke: "white",
        })

        this.pivot.set(this.selfBbox.width / 2, this.selfBbox.height / 2)

        this.messageText = new PIXI.Text("Taeyoon's Moss", textStyle);
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

        //this.scale.set(scale)
        //this.rotation = rotation
    }

    async startAnimatingGrowth(elementDuration, elementDelay) {
        await this.creature.startAnimatingGrowth(elementDuration, elementDelay)
        this.textBounds = this.message.getLocalBounds()
        this.message.position.set(this.creatureBounds.x + this.creatureBounds.width / 2 - this.textBounds.width / 8, this.creatureBounds.y + this.creatureBounds.height / 2 - this.textBounds.height / 8)
    }

    async evolve(duration) {
        this.isEvolving = true
        await this.creature.evolve(duration)
        this.isEvolving = false

        this.selfBbox = this.getLocalBounds()        
        this.creatureBounds = this.creature.getLocalBounds()
        this.textBounds = this.message.getLocalBounds()

        const tween = new TWEEN.Tween(this.message.position)
        // TODO (cezar): That /8 is actually / 2 * this.message.scale.x (which is currentlly 0.25)
        .to({x: this.creatureBounds.x + this.creatureBounds.width / 2 - this.textBounds.width / 8, y: this.creatureBounds.y + this.creatureBounds.height / 2 - this.textBounds.height / 8 }, 500)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()

        const tween2 = new TWEEN.Tween(this.pivot)
        .to({x: this.selfBbox.x + this.selfBbox.width / 2, y: this.selfBbox.y + this.selfBbox.height / 2 }, 500)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        
        await sleep(500)

        //this.message.position.set(this.creatureBounds.x, this.creatureBounds.y - 15)
        //console.log('creature bounds: ', this.creatureBounds, this.getBounds())
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
        /*
        if (this.isEvolving) {
            this.selfBbox = this.getLocalBounds()        
            this.creatureBounds = this.creature.getLocalBounds()
            this.textBounds = this.message.getBounds()    

            this.message.position.set(this.creatureBounds.x + this.creatureBounds.width / 2 - this.textBounds.width / 8, this.creatureBounds.y + this.creatureBounds.height / 2 - this.textBounds.height / 8)
            this.pivot.set(this.selfBbox.x + this.selfBbox.width / 2, this.selfBbox.y + this.selfBbox.height / 2)
        }
        */
    }

    drawParticle() {
        while (this.children.length > 0)
            this.removeChild(this.children[0])

        let shapeMask
        shapeMask = this.drawElement()
        this.addChild(shapeMask)
        
        // Gradient        
        const bbox = this.selfBbox//shapeMask.getBounds()
          
        const gradientUniforms = {
            u_time: 1.0,
            u_radius1: 0.6, // radius of first point of radial gradient
            u_color1: [244.0 / 256, 17.0 / 256, 190.0 / 256, 1.0], // color of first point of radial gradient            
            u_radius2: 0.9, // radius of second point of radial gradient            
            u_color2: [3.0 / 256, 120.0 / 256, 245.0 / 256, 1.0], // color of second point of radial gradient
            u_color3: [0.0, 0.0, 0.0, 0.8], // color of second point of radial gradient
            u_resolution: [bbox.width, bbox.height]
        }

        const gradientFilter = new PIXI.Filter(null, gradientFragment, gradientUniforms);
        const gradientSprite = new PIXI.Sprite(PIXI.Texture.WHITE)
        gradientSprite.x = 0
        gradientSprite.y = 0
        gradientSprite.width = bbox.width
        gradientSprite.height = bbox.height
        gradientSprite.filters = [gradientFilter]
        const gradientSpriteContainer = new PIXI.Container()
        gradientSpriteContainer.x = bbox.x
        gradientSpriteContainer.y = bbox.y
        gradientSpriteContainer.addChild(gradientSprite)


        const container = new PIXI.Container()
        container.addChild(gradientSpriteContainer)

        var textureMask = window.DWCApp.renderer.generateTexture(shapeMask, { resolution: 2, multisample: PIXI.MSAA_QUALITY.MEDIUM });
        var spriteMask = new PIXI.Sprite(textureMask)
        //spriteMask.scale.set(0.95)
        spriteMask.position.set(bbox.x, bbox.y)

        container.addChild(spriteMask)
        container.mask = spriteMask
        container.filters = [new BlurFilter(1, 8)]
        
        this.addChild(container)
        //shapeMask.filters = [new BlurFilter(1, 2)]
    }

    drawElement() {
        const shapeMask = new PIXI.Container()
        var texture = window.DWCApp.renderer.generateTexture(this.creature, { resolution: 2, multisample: PIXI.MSAA_QUALITY.MEDIUM });
        let sp = new PIXI.Sprite(texture)
        sp.x = -sp.width / 2
        sp.y = -sp.height / 2
        shapeMask.addChild(sp)
        return shapeMask
    }
}