import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, Vector } from './utils';
import { DWC_META } from '../../../shared-constants';
import PixiSVG from '../svg-lib'
import SVGShape from './Geometry/SVGCreatureShape';
import { randomElementFromArray, easeInOutBounce, easeInOutQuart, lerp } from './utils';

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

        let fromX = this.animatedProperties.position.from.x
        let fromY = this.animatedProperties.position.from.y
        let toX = this.animatedProperties.position.to.x
        let toY = this.animatedProperties.position.to.y        

        // This should actually be somewhere between from and to, depending on the timestamp.
        this.x = fromX
        this.y = fromY
        this.vx = 0
        this.vy = 0
        this.originPos = { x: fromX, y: fromY }
        this.target = { x: toX, y: toY }
        this.movementDuration = this.animatedProperties.position.duration
        this.movementAlpha = 0

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
        this.originPos.x = this.x
        this.originPos.y = this.y
        this.movementAlpha = 0
        this.movementDuration = this.animatedProperties.position.duration
    }

    updateTargetShape(prop) {
        this.creatureType = prop.from
        this.toCreatureType = prop.to
        this.shapeMorphAlpha = 0
        this.shapeMorphDuration = prop.duration
    }

    tick(d) {
        const delta = PIXI.Ticker.shared.elapsedMS

        this.destinationMarker.x = this.target.x - this.x
        this.destinationMarker.y = this.target.y - this.y

        // Per-frame update for the creature SVG Shape outlines
        this.svgShape.tick()

        // Movement animation
        if (this.movementAlpha >= 1) {

        } else {
            const step = delta / (1000 * this.movementDuration)
            this.movementAlpha += step
            this.easedMovementAlpha = easeInOutQuart(this.movementAlpha)
            this.x = lerp(this.originPos.x, this.target.x, this.easedMovementAlpha)
            this.y = lerp(this.originPos.y, this.target.y, this.easedMovementAlpha)
        }
        
        // Shape morphing animation
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
