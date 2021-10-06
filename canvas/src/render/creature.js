import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, Vector } from './utils';
import { DWC_META } from '../../../shared-constants';
import PixiSVG from '../svg-lib'
import SVGShape from './Geometry/SVGCreatureShape';
import { randomElementFromArray, easeInOutBounce } from './utils';

export default class Creature extends PIXI.Graphics {
    constructor(state) {
        super()

        const { appearance, _id, animatedProperties } = state;        
        this.name = _id
        this.animatedProperties = animatedProperties
        // this.movement = movement
        this.appearance = appearance        

        const { fillColor, radius } = appearance;
        const hex = PIXI.utils.rgb2hex([fillColor.r, fillColor.g, fillColor.b])
    
        //this.creatureType = appearance.creatureType
        this.creatureType = this.animatedProperties.shape.from        
        this.toCreatureType = this.animatedProperties.shape.to
        this.shapeMorphDuration = this.animatedProperties.shape.duration
        this.shapeMorphAlpha = 0
        this.shapeMorphAlphaSgn = 1

        let fromX = this.animatedProperties.position.from.x
        let fromY = this.animatedProperties.position.from.y
        let toX = this.animatedProperties.position.to.x
        let toY = this.animatedProperties.position.to.y

        // This should actually be somewhere between from and to, depending on the timestamp.
        this.x = fromX
        this.y = fromY
        this.vx = 0
        this.vy = 0
        this.target = { x: toX, y: toY }

        const svgData = PIXI.Loader.shared.resources[this.creatureType].data

        this.svgShape = new SVGShape(svgData)
        const bounds = this.svgShape.getBounds()
        this.svgShape.pivot.set(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
        this.svgShape.position.set(0, 0)
        const scale = radius / bounds.width
        this.svgShape.scale.set(scale, scale)
        this.addChild(this.svgShape)
            
        this.destinationMarker = new PIXI.Graphics()        
        this.destinationMarker.beginFill(0xffffff)
        this.destinationMarker.drawCircle(0, 0, 5);
        this.destinationMarker.endFill();
        this.destinationMarker.x = toX - this.x
        this.destinationMarker.y = toY - this.y
        this.addChild(this.destinationMarker)

        this.totalTime = 0
    }

    updateState(newState) {
        for (const [key, prop] of Object.entries(newState)) {
            this.animatedProperties[key] = prop

            switch (key) {
                case (DWC_META.creaturePropertyTypes.position):
                    this.updateTargetPosition(prop)
                    break

                case (DWC_META.creaturePropertyTypes.shape):
                    this.updateTargetShape(prop)
                    break

                default:
                    break
            }
        }
    }

    updateTargetPosition(prop) {
        this.target.x = prop.to.x
        this.target.y = prop.to.y
        this.destinationMarker.x = this.target.x
        this.destinationMarker.y = this.target.y
    }

    updateTargetShape(prop) {
        this.creatureType = prop.from
        this.toCreatureType = prop.to
        this.shapeMorphAlpha = 0
        this.shapeMorphDuration = prop.duration
    }

    tick(delta) {
        // Movement of the entire creature
        this.totalTime += delta

        const target = this.target

        let lastStep = 0;
        let milliseconds = 0;
        milliseconds += delta;
        var elapsed = milliseconds - lastStep;
        lastStep = milliseconds;

        var data = distanceAndAngleBetweenTwoPoints(this.x, this.y, target.x, target.y)
        var velocity = data.distance / 0.1;
        var toTargetVector = new Vector(velocity, data.angle)
        var elapsedSeconds = elapsed / 1000;

        this.x += (toTargetVector.magX * elapsedSeconds)
        this.y += (toTargetVector.magY * elapsedSeconds)

        this.destinationMarker.x = target.x - this.x
        this.destinationMarker.y = target.y - this.y

        // Per-frame update for the creature SVG Shape outlines
        this.svgShape.tick()        
        
        // Shape morphing 
        if (this.shapeMorphAlpha >= 1) {
            // TODO (cezar): Shape morphing should only start when current transition has been completed,
            // otherwise we might see jumps.
        } else {            
            const step = delta / (1000 * this.shapeMorphDuration)
            this.shapeMorphAlpha += step
            this.svgShape.morph(this.creatureType, this.toCreatureType, easeInOutBounce(this.shapeMorphAlpha))
            // console.log('delta: ', delta, 'step: ', step, ' alpha: ', this.shapeMorphAlpha)
        }
    }
}
