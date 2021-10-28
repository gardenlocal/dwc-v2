import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';
import Particle from './Particle';
import { BlurFilter } from '@pixi/filter-blur';
import gradientFragment from '../shaders/radialGradient.glsl'
import vertex from "../shaders/vertex.glsl";

export default class Cluster extends PIXI.Graphics {
    constructor(creatureType, elementAIndex, elementBIndex) {
        super()
        this.creatureType = creatureType        

        this.elementA = Object.values(DWC_META.creaturesNew[creatureType])[elementAIndex].name

        let c1, c2
        c1 = this.getElementParams(this.elementA, 2, 6)
        
        let skew = 0

        this.creature = new Particle(this.creatureType, this.elementA, c1.noElements, c1.elementsProps)
        this.creature.skew.x = -skew

        //this.drawParticle()
        this.addChild(this.creature)
    }

    startAnimatingGrowth(elementDuration) {
        this.creature.startAnimatingGrowth(elementDuration)
    }

    getNumberOfElements() {
        return this.creature.getNumberOfElements()
    }

    tick() {
        this.creature.tick()
    }

    drawParticle() {
        let shapeMask
        shapeMask = this.drawElement()
        this.addChild(shapeMask)
        
        // Gradient

        /*
        const bbox = shapeMask.getBounds()
          
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

        //var textureMask = window.DWCApp.renderer.generateTexture(shapeMask, { resolution: 2, multisample: PIXI.MSAA_QUALITY.MEDIUM });
        //var spriteMask = new PIXI.Sprite(textureMask)
        //spriteMask.scale.set(0.95)
        spriteMask.position.set(bbox.x, bbox.y)

        //container.addChild(spriteMask)
        //container.mask = spriteMask
        //container.filters = [new BlurFilter(16, 8)]
        
        this.addChild(container)
        //shapeMask.filters = [new BlurFilter(1, 2)]
        */
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

    getElementParams(elementType, min, max) {
        let noElements = randomIntInRange(min, max)
        let elementsProps = []
        let typeKey, nextTypeKey
        let currElementType = elementType //randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors))

        nextTypeKey = currElementType
        for (let i = 0; i < noElements; i++) {
            typeKey = nextTypeKey
            nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew[this.creatureType][typeKey].connectors))

            if (Math.random() > 0.2) {
                while (nextTypeKey == typeKey) {
                    nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew[this.creatureType][typeKey].connectors))
                }
            }

            elementsProps.push({
                typeKey: typeKey,
                nextTypeKey: nextTypeKey,
                connectorIndex: randomIntInRange(0, DWC_META.creaturesNew[this.creatureType][typeKey].connectors[nextTypeKey])
            })
        }

        return { type: currElementType, noElements, elementsProps }
    }
}