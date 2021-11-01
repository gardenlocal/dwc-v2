import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, Vector } from './utils';
import { DWC_META } from '../../../shared-constants';
import PixiSVG from '../svg-lib'
import SVGShape from './Geometry/SVGCreatureShape';
import { randomElementFromArray, easeInOutBounce, easeInOutQuart, lerp } from './utils';
import MossCluster from "./Creatures/MossCluster"
import MushroomCluster from "./Creatures/MushroomCluster"

export default class Creature extends PIXI.Container {
    constructor(state) {
        super()

        const { appearance, _id, animatedProperties } = state;        
        this.name = _id
        this.animatedProperties = animatedProperties        
        this.appearance = appearance        
        this.creatureName = state.owner.username

        const { fillColor, radius } = appearance;
        const hex = PIXI.utils.rgb2hex([fillColor.r, fillColor.g, fillColor.b])
    
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
        this.creatureTargetRotation = 0
            
        this.destinationMarker = new PIXI.Graphics()        
        this.destinationMarker.beginFill(0xffffff)
        this.destinationMarker.drawCircle(0, 0, 5);
        this.destinationMarker.endFill();
        this.destinationMarker.x = toX - this.x
        this.destinationMarker.y = toY - this.y
        this.addChild(this.destinationMarker)

        switch (appearance.creatureType) {
            case 'moss':
                this.creature = new MossCluster(appearance, this.creatureName)
                break
            case 'lichen':
                break
            case 'mushroom':
                this.creature = new MushroomCluster(appearance, this.creatureName)
                break
        }

        this.addChild(this.creature)
        this.creature.scale.set(appearance.scale)
        this.creature.startAnimatingGrowth(1000)

        this.frame = 0
    }

    updateState(newState) {
        for (const [key, prop] of Object.entries(newState)) {
            this.animatedProperties[key] = prop

            switch (key) {
                case (DWC_META.creaturePropertyTypes.position):
                    this.updateTargetPosition(prop)
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
        this.creatureTargetRotation = Math.atan2(this.target.y - this.originPos.y, this.target.x - this.originPos.x)
    }

    tick(d) {
        const delta = PIXI.Ticker.shared.elapsedMS
        this.frame++

        // Per-frame update for the creature SVG Shape outlines
        this.creature.tick()
        // Movement animation
        if (this.movementAlpha >= 1) {

        } else {
            const step = delta / (1000 * this.movementDuration)
            this.movementAlpha += step

            if (this.appearance.creatureType == 'moss') {                
                this.easedMovementAlpha = this.movementAlpha
            } else {
                this.easedMovementAlpha = easeInOutQuart(this.movementAlpha)
            }

            if (this.frame % 120 == 0 || this.appearance.creatureType != 'moss') {
                this.creature.rotation = 0.001 * this.creatureTargetRotation + 0.999 * this.creature.rotation
                this.x = lerp(this.originPos.x, this.target.x, this.easedMovementAlpha)
                this.y = lerp(this.originPos.y, this.target.y, this.easedMovementAlpha)
            }
        }
        
        this.destinationMarker.x = this.target.x - this.x
        this.destinationMarker.y = this.target.y - this.y
    }
}
