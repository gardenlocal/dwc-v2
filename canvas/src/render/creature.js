import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, Vector } from './utils';
import { DWC_META } from '../../../shared-constants';
import PixiSVG from '../svg-lib'
import SVGShape from './Geometry/SVGCreatureShape';

export default class Creature extends PIXI.Graphics {
    constructor(state) {
        super()

        const { movement, appearance, _id } = state;
        this.name = _id
        this.movement = movement
        this.appearance = appearance        

        const { fillColor, radius } = appearance;
        const hex = PIXI.utils.rgb2hex([fillColor.r, fillColor.g, fillColor.b])
    
        //this.creatureType = appearance.creatureType
        this.creatureType = 'creature-7'

        let { fromX, fromY, toX, toY, transitionDuration } = movement;
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
        
        this.pts2 = []
        this.rawPoints = new PIXI.Graphics()
        this.rawPoints.scale.set(scale, scale)
        this.rawPoints.pivot.set(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
        this.addChild(this.rawPoints)
    
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
        this.movement = newState.movement
        this.target.x = this.movement.toX
        this.target.y = this.movement.toY
        this.destinationMarker.x = this.movement.toX
        this.destinationMarker.y = this.movement.toY
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
    }
}