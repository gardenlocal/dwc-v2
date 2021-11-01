import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';
import Particle from './MossParticle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";

export default class Cluster extends PIXI.Graphics {
    constructor({ creatureType, svgElementIndex, childrenSequence, scale, rotation, fillColor }, creatureName) {
        super()
        this.creatureType = creatureType        
        this.elementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

        this.creature = new Particle(this.creatureType, this.elementType, childrenSequence, fillColor)          
        //this.drawParticle()
        this.addChild(this.creature)
        this.selfBbox = this.getBounds()

        this.creatureBounds = this.creature.getBounds()
        const textStyle = new PIXI.TextStyle({
            fontSize: 10,
            fill: fillColor,
            stroke: "white",
        })

        this.pivot.set(this.selfBbox.width / 2, this.selfBbox.height / 2)

        this.message = new PIXI.Text(creatureName, textStyle);
        this.message.position.set(this.creatureBounds.x, 0 - 15)
        this.addChild(this.message)

        //this.scale.set(scale)
        //this.rotation = rotation
    }

    async startAnimatingGrowth(elementDuration, elementDelay) {
        await this.creature.startAnimatingGrowth(elementDuration, elementDelay)
    }

    async evolve(duration) {
        await this.creature.evolve(duration)
        if (!this.stopEvolutionFlag) {
            this.evolve(duration)
        } else {
            this.stopEvolutionFlag = false
        }
    }

    stopEvolution() {
        this.stopEvolutionFlag = true
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        //this.position.set(this.x + 10, this.y)
        this.creature.tick()
        this.creatureBounds = this.creature.getBounds()
        this.creature.position.set(0, 0)
        //this.message.position.set(this.creatureBounds.x, -15)
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