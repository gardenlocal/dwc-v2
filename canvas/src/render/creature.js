import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, Vector } from './utils';
import { DWC_META } from '../../../shared-constants';
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
    
        this.creatureType = 'creature-2'//appearance.creatureType

        let { fromX, fromY, toX, toY, transitionDuration } = movement;
        this.x = fromX
        this.y = fromY
        this.vx = 0
        this.vy = 0
        this.target = { x: toX, y: toY }

        const svgData = PIXI.Loader.shared.resources[this.creatureType].data
        this.svg = new PixiSVG(svgData, { unpackTree: true })
        const bounds = this.svg.getBounds()
        this.svg.pivot.set(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5)
        this.svg.position.set(0, 0)
        const scale = radius / bounds.width
        this.svg.scale.set(scale, scale)
        this.addChild(this.svg)
        //this.svg.alpha = 0.1
        
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
        
        //this.drawRawPoints()
    }

    drawRawPoints() {
        // TODO (cezar): I will refactor this into another class, right now it's just an experiment.
        this.pts2 = []
        this.rawPoints.clear()
        const pts = this.svg.children[0].children[0]._geometry.points
        const nowT = new Date().getTime() / 3000
        
        for (let i = 0; i < pts.length; i += 2) {
            const now = nowT + Math.cos(i / 4) * Math.sin(i / 50 + Math.sqrt(nowT))
            //this.pts2.push(new PIXI.Point(pts[i] + 100 * Math.sin(now / 1000), pts[i + 1] + 100 * Math.cos(now / 1000)))
            const p = new PIXI.Point(pts[i], pts[i + 1])            

            if (this.svgCenter) {
                const angle = Math.atan2(p.y - this.svgCenter.y, p.x - this.svgCenter.x)
                const radius = Math.sqrt((p.y - this.svgCenter.y) ** 2 + (p.x - this.svgCenter.x) ** 2)
                const factor = 1 + (Math.sin(now) - Math.sin(now) % 0.5) * 0.5

                const pX = Math.cos(angle) * (radius * factor) + this.svgCenter.x
                const pY = Math.sin(angle) * (radius * factor) + this.svgCenter.y

                p.x = pX
                p.y = pY
            }

            this.pts2.push(p)
        }

        if (!this.svgCenter && this.pts2.length > 0) {
            let c = { x: 0, y: 0 }
            for (let i = 0; i < this.pts2.length; i++) {
                c.x += this.pts2[i].x
                c.y += this.pts2[i].y
            }
            c.x /= this.pts2.length * 1.0
            c.y /= this.pts2.length * 1.0
            this.svgCenter = c

            console.log('svg center: ', this.svgCenter)
        }
        
        //console.log(this.pts2)
        this.rawPoints.beginFill(0xffeedd);
        this.rawPoints.drawPolygon(this.pts2)
        this.rawPoints.endFill();
    }
}
