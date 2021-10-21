import * as PIXI from 'pixi.js'
import { DWC_META } from '../../../../shared-constants';
import SVGCreatureShape from '../Geometry/SVGCreatureShape';
import { randomElementFromArray, randomIntInRange } from '../utils';
import Particle from './Particle';

export default class Cluster extends PIXI.Graphics {
    constructor(creatureType, elementA, elementB) {
        super()
        this.creatureType = creatureType
        this.elementA = elementA
        this.elementB = elementB
        let c1, c2
        c1 = this.getElementParams(this.elementA, 2, 3)
        if (Math.random() < 0.5 || elementA != elementB) {
            c2 = this.getElementParams(this.elementB, 2, 3)
        } else {
            c2 = c1
        }

        this.top = new PIXI.Graphics()

        let skew = randomElementFromArray([0, 0, 0, Math.PI / 4, Math.PI / 8])
        //let skew = 0

        this.creature = new Particle(this.creatureType, this.elementA, c1.noElements, c1.elementsProps)
        this.creature.skew.x = -skew
        this.top.addChild(this.creature)

        this.creature2 = new Particle(this.creatureType, this.elementB, c2.noElements, c2.elementsProps)
        if (Math.random() < 0.5) {
            this.creature2.scale.set(-1, 1)
            this.creature2.x = 2 * this.creature2.getBounds().width    
        } else {
            this.creature2.x = 1 * this.creature2.getBounds().width
        }
        this.creature2.skew.x = skew
        this.top.addChild(this.creature2)

        var texture = window.DWCApp.renderer.generateTexture(this.top);
        let sp = new PIXI.Sprite(texture)
        sp.scale.set(0.2, 0.2)
        sp.x = -220
        sp.y = -220        
        this.addChild(sp)

        //this.drawElement()
        //this.drawGroup()
        //this.drawSquare()
        //this.drawCircle()
        this.drawRandom()
    }

    drawRandom() {
        let r = Math.random()

        if (r <= 0.25) {
            this.drawElement()
        } else if (r <= 0.5) {
            this.drawGroup()
        } else if (r <= 0.75) {
            this.drawSquare()
        } else {
            this.drawCircle()
        }
    }

    drawElement() {
        var texture = window.DWCApp.renderer.generateTexture(this.creature);
        let sp = new PIXI.Sprite(texture)
        sp.scale.set(0.5, 0.5)
        sp.x = -sp.width / 2
        sp.y = -sp.height / 2
        this.addChild(sp)
    }

    drawGroup() {
        var texture = window.DWCApp.renderer.generateTexture(this.top);
        let sp = new PIXI.Sprite(texture)
        sp.scale.set(0.5, 0.5)
        sp.x = -sp.width / 2
        sp.y = -sp.height / 2
        //sp.pivot.set(sp.width / 2, sp.height / 2)
        this.addChild(sp)
    }

    drawSquare() {
        var texture = window.DWCApp.renderer.generateTexture(this.top);
        let sp = new PIXI.Sprite(texture)
        sp.scale.set(0.5, 0.5)
        sp.x = -sp.width / 2
        sp.y = -sp.height
        let sp2 = new PIXI.Sprite(texture)
        let r = Math.random()

        if (r <= 0.25) {
            sp2.scale.set(0.5, 0.5)
            sp2.x = -sp2.width / 2
            sp2.y = 0
        } else if (r <= 0.5) {
            sp2.scale.set(-0.5, 0.5)
            sp2.x = sp2.width / 2    
        } else if (r <= 0.75) {
            sp2.scale.set(0.5, -0.5)
            sp2.x = -sp2.width / 2    
            sp2.y = sp2.height    
        } else {
            sp2.scale.set(-0.5, -0.5)
            sp2.x = sp2.width / 2    
            sp2.y = sp2.height    
        }

        //sp.pivot.set(sp.width / 2, sp.height / 2)
        this.addChild(sp)
        this.addChild(sp2)
    }

    drawCircle() {
        var texture = window.DWCApp.renderer.generateTexture(this.top);

        let radii = [0, 0.25, 0.5, 1, 1.5, 2]
        let radiusFactor = randomElementFromArray(radii)

        let totalPoints = randomElementFromArray([2, 6, 8, 16, 16])

        let r = 0
        for (let i = 0; i < totalPoints; i++) {
            var sprite = new PIXI.Sprite(texture);
            sprite.scale.set(0.5, 0.5)
            sprite.pivot.set(0, -sprite.height * -radiusFactor)
            sprite.rotation = r
            this.addChild(sprite);
            r += 2 * Math.PI / totalPoints
        }
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

            elementsProps.push({
                typeKey: typeKey,
                nextTypeKey: nextTypeKey,
                connectorIndex: randomIntInRange(0, DWC_META.creaturesNew[this.creatureType][typeKey].connectors[nextTypeKey])
            })
        }

        return { type: currElementType, noElements, elementsProps }
    }
}