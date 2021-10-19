import * as PIXI from 'pixi.js'
import * as geometric from 'geometric'
import { distanceAndAngleBetweenTwoPoints, randomInRange } from '../utils'

const morphOffsetCache = {}

export default class SVGLayer extends PIXI.Graphics {
    constructor(name, svgObj, pointCount = 20) {
        super()
        this.name = name
        this.svgObj = svgObj
        

        //this.points = this.svgObj._geometry.points
        // In order to implement holes, we probably need to do some odd/even stuff here, based on all the elements of graphicsData
        // For now, we can deal with simple shapes.
        this.points = this.svgObj.geometry.graphicsData[0].points            
        this.points = this.resampleByPoints(pointCount)

        this.pRandom = []
        for (let i = 0; i < this.points.length; i++) {
            this.pRandom.push({
                posAlpha: randomInRange(0.3, 0.7),
                angle: randomInRange(Math.PI / 2 - 0.3, Math.PI / 2 + 0.3),
                r1Factor: randomInRange(0.1, 0.6),
                r2Factor: randomInRange(0.1, 0.6)
            })
        }

        this.addChild(this.svgObj)
        //this.draw()        
    }

    toGeometricPoly(p) {
        let points = []
        for (let i = 0; i < p.length; i += 2) {
            points.push([p[i], p[i + 1]])
        }
        return points
    }

    tick() {
        /*
        const now = new Date().getTime() / 100
        for (let i = 0; i < this.points.length; i += 2) {
            const param = (now + i) / 10
            this.points[i] += Math.sin(param) * 0.1
            this.points[i + 1] += Math.cos(param) * 0.1
        }
        this.draw()
        */
    }

    calculateMorphOffset(from, fromName, to, toName) {
        if (!morphOffsetCache[fromName]) {
            morphOffsetCache[fromName] = {}
        }

        let minDist = 1000000000, minIndex = -1

        // A simple heuristic to determine a rotation of the polygon so that the transform doesn't self-intersect
        // It's pretty simplistic, but better than nothing. Can be improved if we really want to.

        for (let i = 0; i < to.points.length; i += 2) {
            let d = distanceAndAngleBetweenTwoPoints(from.points[0], from.points[1], to.points[i], to.points[i + 1])
            if (d.distance < minDist) {
                minDist = d.distance
                minIndex = i
            }
        }

        morphOffsetCache[fromName][toName] = minIndex
    }

    morph(from, fromName, to, toName, alpha) {
        if (!morphOffsetCache[fromName] || !morphOffsetCache[fromName][toName]) {
            this.calculateMorphOffset(from, fromName, to, toName)
        }

        let toIndexWithOffset = morphOffsetCache[fromName][toName]
        this.points = []

        for (let i = 0; i < from.points.length; i += 2) {
            const interp = geometric.lineInterpolate([[from.points[i], from.points[i + 1]], [to.points[toIndexWithOffset], to.points[toIndexWithOffset + 1]]])(alpha)
            this.points.push(interp[0], interp[1])

            toIndexWithOffset += 2
            if (toIndexWithOffset >= to.points.length) {
                toIndexWithOffset -= to.points.length
            }
        }

        this.draw()
    }

    setStyle(style, matrix) {
		const { fill, opacity, stroke, strokeWidth, strokeOpacity, fillOpacity } = style;

		const isStrokable = stroke !== undefined && stroke !== "none" && stroke !== "transparent";
		const isFillable = fill !== undefined && fill !== "none" && fill !== "transparent";

		const defaultLineWidth = isStrokable ? this.svgObj.options.lineWidth || 1 : 0;
		const lineWidth = strokeWidth !== undefined ? Math.max(0.5, parseFloat(strokeWidth)) : defaultLineWidth;
		const lineColor = isStrokable ? this.svgObj.hexToUint(stroke) : this.svgObj.options.lineColor;

		let strokeOpacityValue = 0;
		let fillOpacityValue = 0;

		if (isStrokable) {
			strokeOpacityValue =
				opacity || strokeOpacity ? parseFloat(opacity || strokeOpacity) : this.svgObj.options.lineOpacity;
		}
		if (isFillable) {
			fillOpacityValue = opacity || fillOpacity ? parseFloat(opacity || fillOpacity) : this.svgObj.options.fillOpacity;
		}

		if (fill) {
			if (!isFillable) {
				this.beginFill(0, 0);
			} else {
				this.beginFill(this.svgObj.hexToUint(fill), fillOpacityValue);
			}
		} else {
			this.beginFill(this.svgObj.options.fillColor, 1);
		}

		this.lineStyle(lineWidth, lineColor, strokeOpacityValue);
		this.setMatrix(matrix);
	}

    resampleByDistance(targetDist) {
        let totalDist = 0
        let newPoints = []

        for (let i = 0; i < this.points.length; i += 2) {
            let pC = [this.points[i], this.points[i + 1]]
            let pN = (i < this.points.length - 2) ? ([this.points[i + 2], this.points[i + 3]]) : ([this.points[0], this.points[1]])
            let dst = distanceAndAngleBetweenTwoPoints(pC[0], pC[1], pN[0], pN[1]).distance
            if (totalDist + dst > targetDist) {
                let interpAlphas = []
                while (totalDist + dst > targetDist) {
                    let advanceDist = targetDist - totalDist
                    interpAlphas.push(advanceDist / dst)
                    totalDist = 0
                    dst -= advanceDist
                }
                totalDist = dst

                interpAlphas.forEach((a, index) => {
                    if (index == interpAlphas.length - 1) {
                        newPoints.push(pN[0], pN[1])
                    } else {
                        let newPoint = geometric.lineInterpolate([pC, pN])(a)
                        newPoints.push(newPoint[0], newPoint[1])    
                    }
                })
            } else {
                totalDist += dst
            }
        }

        return newPoints
    }

    resampleByPoints(noPoints) {
        const p = this.calculatePerimeter()
        return this.resampleByDistance((p - 0.001) / noPoints)
    }

    calculatePerimeter() {
        return geometric.polygonLength(this.toGeometricPoly(this.points))
    }

    draw() {
        this.clear()
        this.setStyle(this.svgObj.__style, this.svgObj.__matrix)
        this.drawFillAndStroke()

        // Outline drawing experiments
        // this.drawStar()
        // this.drawSquiggleGeneral()
        // this.drawSquiggleOutline()
        // this.drawBubblyOutline()        
        // this.drawDebug()
    }

    drawFillAndStroke() {
        // this.beginFill(0xfafafa)
        //this.lineStyle(3, 0x2a2a2a, 1)
        this.drawPolygon(this.points)        
        // this.endFill()
    }

    drawDebug() {
        this.beginFill(0xff0000);
        for (let i = 0; i < this.points.length; i += 2) {
            this.drawCircle(this.points[i], this.points[i + 1], 5)
        }
        this.endFill()
    }

    drawStar() {    
        this.points50 = this.resampleByPoints(100)
        
        const p = this.points50
        const center = geometric.polygonCentroid(this.toGeometricPoly(p))

        this.lineStyle(4, 0xe77c0c, 1)
        for (let i = 0; i < p.length; i += 2) {
            this.drawPolygon(center[0], center[1], p[i], p[i + 1])
        }

        this.lineStyle(3, 0x0aef43, 1)
        for (let i = 0; i < p.length; i += 2) {
            this.drawPolygon(center[0], center[1], p[i] + Math.cos(i / 10) * 6, p[i + 1] + Math.sin(i / 10) * 3)
        }

    }

    drawSquiggleGeneral() {
        this.pointsS = this.resampleByPoints(15)
        const p = this.pointsS        
        const n = p.length

        // this.lineStyle(10, 0x8a8a8a, 1)
        this.lineStyle(10, 0xe77c0c, 1)
        for (let i = 0; i < p.length; i += 2) {
            const curr = [p[i], p[i + 1]]
            const next = [p[(i + 2) % n], p[(i + 3) % n]]

            let offset = Math.round(Math.sin(i / 20) * (n / 2)) + n
            offset += (offset % 2)
            // let offset = 2
                        
            const after = [p[(i + offset) % n], p[(i + offset + 1) % n]]
            this.drawPolygon(curr[0] + 7, curr[1] + 4, after[0] + 7, after[1] + 4)
            this.endFill()
        }

        // this.lineStyle(8, 0xffffff, 1)
        this.lineStyle(8, 0x0aef43, 1)        
        for (let i = 0; i < p.length; i += 2) {
            const curr = [p[i], p[i + 1]]
            const next = [p[(i + 2) % n], p[(i + 3) % n]]

            let offset = Math.round(Math.sin(i / 20) * (n / 2)) + n
            offset += (offset % 2)
            // let offset = 2

            const after = [p[(i + offset) % n], p[(i + offset + 1) % n]]
            this.drawPolygon(curr[0], curr[1], after[0], after[1])
            this.endFill()
        }
    }

    drawSquiggleOutline() {        
        this.pointsS = this.resampleByPoints(12)
        const p = this.pointsS        
        const n = p.length

        let polygon = []    
        //polygon.push(p[0])
        // polygon.push(p[1])

        for (let i = 0; i < p.length; i += 2) {
            const curr = [p[i], p[i + 1]]
            const next = [p[(i + 2) % n], p[(i + 3) % n]]
            const r = this.pRandom[i]

            const center = geometric.lineInterpolate([curr, next])(r.posAlpha)            
            const angle = Math.atan2(next[1] - curr[1], next[0] - curr[0])
            const angle1 = angle + r.angle
            const angle2 = angle - r.angle

            const d = distanceAndAngleBetweenTwoPoints(curr[0], curr[1], next[0], next[1])
            const radius1 = r.r1Factor * d.distance
            const radius2 = r.r2Factor * d.distance

            const pUnder = [
                center[0] + radius1 * Math.cos(angle1),
                center[1] + radius1 * Math.sin(angle1)
            ]
            const pOver = [
                center[0] + radius2 * Math.cos(angle2),
                center[1] + radius2 * Math.sin(angle2)
            ]

            polygon.push(next[0])
            polygon.push(next[1])
            polygon.push(pUnder[0])
            polygon.push(pUnder[1])
            polygon.push(pOver[0])
            polygon.push(pOver[1])
            
            // this.drawPolygon(curr[0], curr[1], after[0], after[1])
            // this.endFill()
        }

        this.lineStyle(8, 0x0aef43, 1)
        this.drawPolygon(polygon)
    }

    drawBubblyOutline() {
        this.pointsS = this.resampleByPoints(12)
        const p = this.pointsS        
        const n = p.length

        let polygon = []    

        this.lineStyle(8, 0x0aef43, 1)
        this.moveTo(p[0], p[1])

        for (let i = 0; i < p.length; i += 2) {
            const curr = [p[i], p[i + 1]]
            const next = [p[(i + 2) % n], p[(i + 3) % n]]
            const r = this.pRandom[i]

            const center = geometric.lineInterpolate([curr, next])(r.posAlpha)            
            const angle = Math.atan2(next[1] - curr[1], next[0] - curr[0])
            const angle1 = angle + r.angle
            const angle2 = angle - r.angle

            const d = distanceAndAngleBetweenTwoPoints(curr[0], curr[1], next[0], next[1])
            const radius1 = r.r1Factor * d.distance
            const radius2 = r.r2Factor * d.distance

            const pUnder = [
                center[0] + radius1 * Math.cos(angle1),
                center[1] + radius1 * Math.sin(angle1)
            ]
            const pOver = [
                center[0] + radius2 * Math.cos(angle2),
                center[1] + radius2 * Math.sin(angle2)
            ]

            this.bezierCurveTo(pOver[0], pOver[1], pUnder[0], pUnder[1], next[0], next[1])            
        }
        
        // this.drawPolygon(polygon)        
        this.closePath()
    }
}