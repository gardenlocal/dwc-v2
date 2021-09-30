import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, Vector } from './utils';
import { DWC_META } from './assetLoader';
import PixiSVG from '../svg-lib'

export default class Creature extends PIXI.Graphics {
    constructor(state) {
        super()

        const { movement, appearance, _id } = state;
        this.name = _id
        this.movement = movement
        this.appearance = appearance        

        const { fillColor, radius } = appearance;
        const hex = PIXI.utils.rgb2hex([fillColor.r, fillColor.g, fillColor.b])
    
        this.creatureType = appearance.creatureType

        let { fromX, fromY, toX, toY, transitionDuration } = movement;
        this.x = fromX
        this.y = fromY
        this.vx = 0
        this.vy = 0
        this.target = { x: toX, y: toY }

        const svgData = PIXI.Loader.shared.resources[DWC_META.creatures.CREATURE_1].data
        this.svg = new PixiSVG(svgData, { unpackTree: true })
        const bounds = this.svg.getBounds()
        this.svg.pivot.set(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
        this.svg.position.set(0, 0)
        const scale = radius / bounds.width
        this.svg.scale.set(scale, scale)
        this.addChild(this.svg)
    
        this.destinationMarker = new PIXI.Graphics()        
        this.destinationMarker.beginFill(0xffffff)
        this.destinationMarker.drawCircle(0, 0, 5);
        this.destinationMarker.endFill();
        this.destinationMarker.x = toX - this.x
        this.destinationMarker.y = toY - this.y
        this.addChild(this.destinationMarker)
    }

    updateState(newState) {
        this.movement = newState.movement
        this.target.x = this.movement.toX
        this.target.y = this.movement.toY
        this.destinationMarker.x = this.movement.toX
        this.destinationMarker.y = this.movement.toY
    }

    tick(delta) {
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
    }
}